import type {
  LicenseInfo,
  LicenseValidationResult,
  LicenseConfig,
  LicenseStatus,
} from '../types';

const CACHE_KEY = 'artistaphoto_license_cache';
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_STORE_URL = 'https://srsigor.gumroad.com';
const GUMROAD_API_URL = 'https://api.gumroad.com/v2/licenses/verify';

// Your Gumroad Product IDs (get these from your Gumroad product settings)
// Add both Solo and Team product IDs here
const GUMROAD_PRODUCT_IDS = [
  'R4Nv9B5P5-9sdVR3E3ytdg==',  // Solo plan
  '3i7epkgA3v0HK0r_UghsZg==',  // Team plan
];

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
  productIds: GUMROAD_PRODUCT_IDS,
  storeUrl: DEFAULT_STORE_URL,
  cacheDuration: DEFAULT_CACHE_DURATION,
  enableCache: true,
};

export class LicenseManager {
  /**
   * Configure the license manager
   * @param config - Configuration options including productId (required for validation)
   */
  static configure(config: Partial<LicenseConfig>): void {
    _config = { ..._config, ...config };
  }

  /**
   * Set and validate a license key
   * @param key - The license key from Gumroad
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

    // Validate with Gumroad
    const result = await LicenseManager.validateWithGumroad(_licenseKey);

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

  private static async validateWithGumroad(key: string): Promise<LicenseValidationResult> {
    try {
      // Get product IDs from config or use defaults
      const productIds = _config.productIds || GUMROAD_PRODUCT_IDS;

      // Try validating with each product ID
      // This allows a license key to work with both Solo and Team plans
      for (const productId of productIds) {
        try {
          const response = await fetch(GUMROAD_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              product_id: productId,
              license_key: key,
            }),
          });

          if (!response.ok) {
            continue; // Try next product ID
          }

          const data = await response.json();

          // Gumroad returns { success: true/false, purchase: {...} }
          if (!data.success) {
            continue; // Try next product ID
          }

          // Check if subscription is active
          const purchase = data.purchase;
          const isSubscription = !!purchase.subscription_id;
          let isExpired = false;

          if (isSubscription) {
            // Check if subscription ended
            if (purchase.subscription_ended_at) {
              isExpired = new Date(purchase.subscription_ended_at) < new Date();
            }
            // If no end date, subscription is active
          }

          const isValid = data.success && !isExpired;

          // If valid with this product ID, return success
          if (isValid) {
            return {
              valid: true,
              gumroadResponse: data,
            };
          }

          // If expired, return error (don't try other products)
          if (isExpired) {
            return {
              valid: false,
              gumroadResponse: data,
              error: 'Subscription has expired',
            };
          }
        } catch {
          // If this product ID fails, try next one
          continue;
        }
      }

      // If none of the product IDs worked, return error
      return {
        valid: false,
        error: 'License key not found',
      };
    } catch (error) {
      // If network error and we have cache, use cache
      if (_config.enableCache) {
        const cached = LicenseManager.getFromCache();
        if (cached && cached.licenseInfo.key === key) {
          return {
            valid: true,
            gumroadResponse: undefined,
          };
        }
      }

      return {
        valid: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static parseLicenseInfo(key: string, result: LicenseValidationResult): LicenseInfo {
    const gumroad = result.gumroadResponse;

    if (!gumroad || !gumroad.purchase) {
      // Fallback for cached response without gumroadResponse
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

    const purchase = gumroad.purchase;
    let status: LicenseStatus = 'active';
    let expiresAt: string | null = null;

    // Check if it's a subscription
    if (purchase.subscription_id) {
      if (purchase.subscription_ended_at) {
        const endDate = new Date(purchase.subscription_ended_at);
        if (endDate < new Date()) {
          status = 'expired';
        }
        expiresAt = purchase.subscription_ended_at;
      }
      // If subscription has no end date, it's active
    }

    // Check if purchase was refunded or chargebacked
    if (purchase.refunded || purchase.chargebacked) {
      status = 'revoked';
    }

    const isValid = result.valid === true;

    return {
      key,
      status: isValid ? 'active' : status,
      isValid: isValid,
      expiresAt: expiresAt,
      activationLimit: null, // Gumroad doesn't have activation limits
      activationUsage: 0,
      usageLimit: null,
      usage: 0,
      customerEmail: purchase.email,
      customerName: purchase.full_name,
      productName: purchase.product_name,
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
