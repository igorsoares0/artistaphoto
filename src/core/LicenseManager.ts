import type {
  LicenseInfo,
  LicenseValidationResult,
  LicenseConfig,
  LicenseStatus,
} from '../types';

const CACHE_KEY = 'artistaphoto_license_cache';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_STORE_URL = 'https://artistaphoto.lemonsqueezy.com';
const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1/licenses';

interface CachedLicense {
  licenseInfo: LicenseInfo;
  validatedAt: number;
  expiresAt: number;
}

export class LicenseManager {
  private static licenseKey: string | null = null;
  private static licenseInfo: LicenseInfo | null = null;
  private static isValidated: boolean = false;
  private static devMode: boolean = false;
  private static config: LicenseConfig = {
    storeUrl: DEFAULT_STORE_URL,
    cacheDuration: DEFAULT_CACHE_DURATION,
    enableCache: true,
  };

  /**
   * Enable development mode (bypasses license validation)
   * Only use this for local development!
   */
  static enableDevMode(): void {
    this.devMode = true;
    this.isValidated = true;
    this.licenseInfo = {
      key: 'DEV-MODE',
      status: 'active',
      isValid: true,
      expiresAt: null,
      activationLimit: 999,
      activationUsage: 1,
      customerEmail: 'dev@localhost',
      customerName: 'Development Mode',
      productName: 'ArtistAPhoto SDK (Dev)',
    };
    console.log('🔧 ArtistAPhoto: Development mode enabled - license validation bypassed');
  }

  /**
   * Check if development mode is enabled
   */
  static isDevMode(): boolean {
    return this.devMode;
  }

  /**
   * Configure the license manager
   */
  static configure(config: Partial<LicenseConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set and validate a license key
   * @param key - The license key from Lemon Squeezy
   * @returns Promise<LicenseInfo> - Information about the validated license
   * @throws Error if license is invalid
   */
  static async setLicenseKey(key: string): Promise<LicenseInfo> {
    if (!key || typeof key !== 'string') {
      throw new LicenseError('License key is required', 'INVALID_KEY');
    }

    this.licenseKey = key.trim();

    // Check cache first
    if (this.config.enableCache) {
      const cached = this.getFromCache();
      if (cached && cached.licenseInfo.key === this.licenseKey) {
        this.licenseInfo = cached.licenseInfo;
        this.isValidated = true;
        return this.licenseInfo;
      }
    }

    // Validate with Lemon Squeezy
    const result = await this.validateWithLemonSqueezy(this.licenseKey);

    if (!result.valid) {
      this.isValidated = false;
      this.licenseInfo = null;
      throw this.createErrorFromResult(result);
    }

    // Parse license info
    this.licenseInfo = this.parseLicenseInfo(this.licenseKey, result);
    this.isValidated = true;

    // Cache the result
    if (this.config.enableCache) {
      this.saveToCache(this.licenseInfo);
    }

    return this.licenseInfo;
  }

  /**
   * Check if a valid license is active
   */
  static isLicenseValid(): boolean {
    // Dev mode always valid
    if (LicenseManager.devMode) {
      return true;
    }
    const valid = LicenseManager.isValidated && LicenseManager.licenseInfo !== null && LicenseManager.licenseInfo.isValid;
    console.log('🔍 License check:', { devMode: LicenseManager.devMode, isValidated: LicenseManager.isValidated, licenseInfo: LicenseManager.licenseInfo, result: valid });
    return valid;
  }

  /**
   * Get current license information
   */
  static getLicenseInfo(): LicenseInfo | null {
    return this.licenseInfo;
  }

  /**
   * Get the current license key
   */
  static getLicenseKey(): string | null {
    return this.licenseKey;
  }

  /**
   * Verify license is valid, throw if not
   * Call this before any SDK operation
   */
  static requireValidLicense(): void {
    // Dev mode always passes
    if (LicenseManager.devMode) {
      return;
    }
    if (!LicenseManager.isLicenseValid()) {
      const storeUrl = LicenseManager.config.storeUrl || DEFAULT_STORE_URL;
      throw new LicenseError(
        `License key required. Call ArtistAPhoto.setLicenseKey() first.\n` +
        `Purchase a license at: ${storeUrl}`,
        'LICENSE_REQUIRED'
      );
    }
  }

  /**
   * Clear the current license (logout)
   */
  static clearLicense(): void {
    this.licenseKey = null;
    this.licenseInfo = null;
    this.isValidated = false;
    this.clearCache();
  }

  /**
   * Refresh the license validation (force re-validation)
   */
  static async refreshLicense(): Promise<LicenseInfo> {
    if (!this.licenseKey) {
      throw new LicenseError('No license key set', 'NO_LICENSE');
    }

    this.clearCache();
    return this.setLicenseKey(this.licenseKey);
  }

  // ==================== Private Methods ====================

  private static async validateWithLemonSqueezy(key: string): Promise<LicenseValidationResult> {
    try {
      const instanceName = this.getInstanceName();

      const response = await fetch(`${LEMON_SQUEEZY_API_URL}/validate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: key,
          instance_name: instanceName,
        }),
      });

      if (!response.ok) {
        return {
          valid: false,
          error: `HTTP error: ${response.status}`,
        };
      }

      const data: LicenseValidationResult = await response.json();
      return data;
    } catch (error) {
      // If network error and we have cache, use cache
      if (this.config.enableCache) {
        const cached = this.getFromCache();
        if (cached && cached.licenseInfo.key === key) {
          return {
            valid: true,
            license_key: {
              id: 0,
              status: cached.licenseInfo.status,
              key: cached.licenseInfo.key,
              activation_limit: cached.licenseInfo.activationLimit,
              activation_usage: cached.licenseInfo.activationUsage,
              created_at: '',
              expires_at: cached.licenseInfo.expiresAt,
            },
          };
        }
      }

      return {
        valid: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static getInstanceName(): string {
    // In browser, use hostname
    if (typeof window !== 'undefined' && window.location) {
      return window.location.hostname;
    }
    // In Node.js, use a generic identifier
    return 'nodejs-server';
  }

  private static parseLicenseInfo(key: string, result: LicenseValidationResult): LicenseInfo {
    const licenseKey = result.license_key;
    const meta = result.meta;

    let status: LicenseStatus = 'invalid';
    if (licenseKey) {
      switch (licenseKey.status) {
        case 'active':
          status = 'active';
          break;
        case 'expired':
          status = 'expired';
          break;
        case 'disabled':
          status = 'disabled';
          break;
        default:
          status = 'invalid';
      }
    }

    return {
      key,
      status,
      isValid: result.valid && status === 'active',
      expiresAt: licenseKey?.expires_at || null,
      activationLimit: licenseKey?.activation_limit || 0,
      activationUsage: licenseKey?.activation_usage || 0,
      customerEmail: meta?.customer_email,
      customerName: meta?.customer_name,
      productName: meta?.product_name,
    };
  }

  private static createErrorFromResult(result: LicenseValidationResult): LicenseError {
    const storeUrl = this.config.storeUrl || DEFAULT_STORE_URL;

    if (result.error?.includes('expired')) {
      return new LicenseError(
        `Your license has expired.\n` +
        `Renew at: ${storeUrl}\n` +
        `Need help? Contact support.`,
        'LICENSE_EXPIRED'
      );
    }

    if (result.error?.includes('Activation limit')) {
      const limit = result.license_key?.activation_limit || 'N/A';
      return new LicenseError(
        `Activation limit reached (${limit} sites maximum).\n` +
        `Manage activations at: https://app.lemonsqueezy.com\n` +
        `Need more? Upgrade at ${storeUrl}`,
        'ACTIVATION_LIMIT'
      );
    }

    if (result.error?.includes('disabled')) {
      return new LicenseError(
        `This license has been disabled.\n` +
        `Contact support for assistance.`,
        'LICENSE_DISABLED'
      );
    }

    return new LicenseError(
      `Invalid license key.\n` +
      `Purchase a valid license at: ${storeUrl}`,
      'INVALID_KEY'
    );
  }

  // ==================== Cache Methods ====================

  private static getFromCache(): CachedLicense | null {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        return null;
      }

      const parsed: CachedLicense = JSON.parse(cached);

      // Check if cache is still valid
      if (Date.now() > parsed.expiresAt) {
        this.clearCache();
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private static saveToCache(licenseInfo: LicenseInfo): void {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const cacheDuration = this.config.cacheDuration || DEFAULT_CACHE_DURATION;

      const cached: CachedLicense = {
        licenseInfo,
        validatedAt: Date.now(),
        expiresAt: Date.now() + cacheDuration,
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // Ignore localStorage errors (private browsing, etc.)
    }
  }

  private static clearCache(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CACHE_KEY);
      }
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Custom error class for license-related errors
 */
export class LicenseError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'LicenseError';
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    const ErrorWithCaptureStackTrace = Error as typeof Error & {
      captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    };
    if (ErrorWithCaptureStackTrace.captureStackTrace) {
      ErrorWithCaptureStackTrace.captureStackTrace(this, LicenseError);
    }
  }
}
