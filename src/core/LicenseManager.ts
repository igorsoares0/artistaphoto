import type {
  LicenseInfo,
  LicenseValidationResult,
  LicenseConfig,
  LicenseStatus,
  PolarLicenseKeyResponse,
} from '../types';

const CACHE_KEY = 'artistaphoto_license_cache';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_STORE_URL = 'https://polar.sh/artistaphoto';
const POLAR_API_URL = 'https://api.polar.sh/v1/customer-portal/license-keys';

// Your Polar.sh Organization ID (replace with your actual org ID from Polar.sh dashboard)
const POLAR_ORGANIZATION_ID = '752cf07e-872c-4678-91a6-a1883aadee6d';

interface CachedLicense {
  licenseInfo: LicenseInfo;
  validatedAt: number;
  expiresAt: number;
}

// Use module-level variables instead of static class properties for better consistency
let _licenseKey: string | null = null;
let _licenseInfo: LicenseInfo | null = null;
let _isValidated: boolean = false;
let _config: LicenseConfig = {
  organizationId: POLAR_ORGANIZATION_ID,
  storeUrl: DEFAULT_STORE_URL,
  cacheDuration: DEFAULT_CACHE_DURATION,
  enableCache: true,
};

export class LicenseManager {
  /**
   * Configure the license manager
   * @param config - Configuration options including organizationId (required for validation)
   */
  static configure(config: Partial<LicenseConfig>): void {
    _config = { ..._config, ...config };
  }

  /**
   * Set and validate a license key
   * @param key - The license key from Polar.sh
   * @returns Promise<LicenseInfo> - Information about the validated license
   * @throws Error if license is invalid
   */
  static async setLicenseKey(key: string): Promise<LicenseInfo> {
    if (!key || typeof key !== 'string') {
      throw new LicenseError('License key is required', 'INVALID_KEY');
    }

    _licenseKey = key.trim();

    // Check cache first
    if (_config.enableCache) {
      const cached = LicenseManager.getFromCache();
      if (cached && cached.licenseInfo.key === _licenseKey) {
        _licenseInfo = cached.licenseInfo;
        _isValidated = true;
        return _licenseInfo;
      }
    }

    // Validate with Polar.sh
    const result = await LicenseManager.validateWithPolar(_licenseKey);

    if (!result.valid) {
      _isValidated = false;
      _licenseInfo = null;
      throw LicenseManager.createErrorFromResult(result);
    }

    // Parse license info
    _licenseInfo = LicenseManager.parseLicenseInfo(_licenseKey, result);
    _isValidated = true;

    // Cache the result
    if (_config.enableCache) {
      LicenseManager.saveToCache(_licenseInfo);
    }

    return _licenseInfo;
  }

  /**
   * Check if a valid license is active
   */
  static isLicenseValid(): boolean {
    return _isValidated && _licenseInfo !== null && _licenseInfo.isValid;
  }

  /**
   * Get current license information
   */
  static getLicenseInfo(): LicenseInfo | null {
    return _licenseInfo;
  }

  /**
   * Get the current license key
   */
  static getLicenseKey(): string | null {
    return _licenseKey;
  }

  /**
   * Verify license is valid, throw if not
   * Call this before any SDK operation
   */
  static requireValidLicense(): void {
    if (!LicenseManager.isLicenseValid()) {
      const storeUrl = _config.storeUrl || DEFAULT_STORE_URL;
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
    _licenseKey = null;
    _licenseInfo = null;
    _isValidated = false;
    LicenseManager.clearCache();
  }

  /**
   * Refresh the license validation (force re-validation)
   */
  static async refreshLicense(): Promise<LicenseInfo> {
    if (!_licenseKey) {
      throw new LicenseError('No license key set', 'NO_LICENSE');
    }

    LicenseManager.clearCache();
    return LicenseManager.setLicenseKey(_licenseKey);
  }

  // ==================== Private Methods ====================

  private static async validateWithPolar(key: string): Promise<LicenseValidationResult> {
    try {
      const response = await fetch(`${POLAR_API_URL}/validate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: key,
          organization_id: _config.organizationId,
        }),
      });

      if (response.status === 404) {
        return {
          valid: false,
          error: 'License key not found',
        };
      }

      if (response.status === 422) {
        return {
          valid: false,
          error: 'Invalid license key format',
        };
      }

      if (!response.ok) {
        return {
          valid: false,
          error: `HTTP error: ${response.status}`,
        };
      }

      const data: PolarLicenseKeyResponse = await response.json();

      // Check if license is valid (status is "granted" and not expired)
      const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
      const isValid = data.status === 'granted' && !isExpired;

      return {
        valid: isValid,
        polarResponse: data,
        error: !isValid ? LicenseManager.getErrorMessage(data, isExpired) : undefined,
      };
    } catch (error) {
      // If network error and we have cache, use cache
      if (_config.enableCache) {
        const cached = LicenseManager.getFromCache();
        if (cached && cached.licenseInfo.key === key) {
          return {
            valid: true,
            polarResponse: undefined,
          };
        }
      }

      return {
        valid: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static getErrorMessage(data: PolarLicenseKeyResponse, isExpired: boolean): string {
    if (isExpired) {
      return 'License has expired';
    }
    if (data.status === 'revoked') {
      return 'License has been revoked';
    }
    if (data.status === 'disabled') {
      return 'License has been disabled';
    }
    return 'License is not valid';
  }

  private static parseLicenseInfo(key: string, result: LicenseValidationResult): LicenseInfo {
    const polar = result.polarResponse;

    if (!polar) {
      // Fallback for cached response without polarResponse
      return {
        key,
        status: 'active',
        isValid: true,
        expiresAt: null,
        activationLimit: null,
        activationUsage: 0,
        usageLimit: null,
        usage: 0,
      };
    }

    let status: LicenseStatus = 'active';
    if (polar.status === 'granted') {
      status = 'active';
    } else if (polar.status === 'revoked') {
      status = 'revoked';
    } else if (polar.status === 'disabled') {
      status = 'disabled';
    }

    // Check expiration
    const isExpired = polar.expires_at ? new Date(polar.expires_at) < new Date() : false;
    if (isExpired) {
      status = 'expired';
    }

    const isValid = result.valid === true;

    return {
      key,
      status: isValid ? 'active' : status,
      isValid: isValid,
      expiresAt: polar.expires_at,
      activationLimit: polar.limit_activations,
      activationUsage: polar.validations || 0,
      usageLimit: polar.limit_usage,
      usage: polar.usage || 0,
      customerEmail: polar.customer?.email,
      customerName: polar.customer?.name,
      productName: undefined, // Polar doesn't include product name in validation response
    };
  }

  private static createErrorFromResult(result: LicenseValidationResult): LicenseError {
    const storeUrl = _config.storeUrl || DEFAULT_STORE_URL;

    if (result.error?.includes('expired')) {
      return new LicenseError(
        `Your license has expired.\n` +
        `Renew at: ${storeUrl}\n` +
        `Need help? Contact support.`,
        'LICENSE_EXPIRED'
      );
    }

    if (result.error?.includes('revoked')) {
      return new LicenseError(
        `This license has been revoked.\n` +
        `Contact support for assistance.`,
        'LICENSE_REVOKED'
      );
    }

    if (result.error?.includes('disabled')) {
      return new LicenseError(
        `This license has been disabled.\n` +
        `Contact support for assistance.`,
        'LICENSE_DISABLED'
      );
    }

    if (result.error?.includes('not found')) {
      return new LicenseError(
        `License key not found.\n` +
        `Purchase a valid license at: ${storeUrl}`,
        'INVALID_KEY'
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
        LicenseManager.clearCache();
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

      const cacheDuration = _config.cacheDuration || DEFAULT_CACHE_DURATION;

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
