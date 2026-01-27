export type {
  OperationType,
  OperationParams,
  CropOptions,
  ResizeOptions,
  ResizeParams,
  TextOptions,
  TextParams,
  ShapeType,
  ShapeOptions,
  ShapeParams,
} from './operations';

export type {
  FilterType,
  FilterParams,
  BlurParams,
  SharpenParams,
  VignetteParams,
  PosterizeParams,
  PixelateParams,
} from './filters';

export type {
  AdjustmentType,
  AdjustmentParams,
} from './adjustments';

export type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImageMetadata {
  createdAt: number;
  format: string;
  width?: number;
  height?: number;
}

export interface ExportOptions {
  format?: ExportFormat;
  quality?: number; // 0-1 for JPEG/WebP
}

// License types
export type LicenseStatus = 'active' | 'expired' | 'disabled' | 'invalid' | 'granted' | 'revoked';

export interface LicenseInfo {
  key: string;
  status: LicenseStatus;
  isValid: boolean;
  expiresAt: string | null;
  activationLimit: number | null;
  activationUsage: number;
  usageLimit: number | null;
  usage: number;
  customerEmail?: string;
  customerName?: string;
  productName?: string;
}

export interface PolarLicenseKeyResponse {
  id: string;
  organization_id: string;
  customer_id: string;
  customer?: {
    id: string;
    email: string;
    name?: string;
  };
  benefit_id: string;
  key: string;
  display_key: string;
  status: 'granted' | 'revoked' | 'disabled';
  limit_activations: number | null;
  usage: number;
  limit_usage: number | null;
  validations: number;
  last_validated_at: string | null;
  expires_at: string | null;
  created_at: string;
  modified_at: string;
}

export interface GumroadLicenseResponse {
  success: boolean;
  uses: number;
  message?: string;
  purchase: {
    seller_id: string;
    product_id: string;
    product_name: string;
    permalink: string;
    product_permalink: string;
    email: string;
    price: number;
    gumroad_fee: number;
    currency: string;
    quantity: number;
    discover_fee_charged: boolean;
    can_contact: boolean;
    referrer: string;
    card: {
      type: string | null;
      bin: string | null;
      expiry_month: string | null;
      expiry_year: string | null;
    };
    order_number: number;
    sale_id: string;
    sale_timestamp: string;
    purchaser_id: string;
    subscription_id: string;
    variants: string;
    license_key: string;
    ip_country: string;
    recurrence: string;
    is_gift_receiver_purchase: boolean;
    refunded: boolean;
    chargebacked: boolean;
    disputed: boolean;
    dispute_won: boolean;
    id: string;
    created_at: string;
    custom_fields: any;
    chargebacked_at: string | null;
    disputed_at: string | null;
    dispute_won_at: string | null;
    refunded_at: string | null;
    full_name: string;
    subscription_cancelled_at: string | null;
    subscription_failed_at: string | null;
    subscription_ended_at: string | null;
    ended: boolean;
  };
}

export interface LicenseValidationResult {
  valid: boolean;
  error?: string;
  polarResponse?: PolarLicenseKeyResponse;
  gumroadResponse?: GumroadLicenseResponse;
}

export interface LicenseConfig {
  /** Your Gumroad product IDs (optional - already configured in SDK) */
  productIds?: string[];
  /** Your store URL for purchasing licenses */
  storeUrl?: string;
  /** Cache duration in milliseconds (default: 24 hours) */
  cacheDuration?: number;
  /** Enable offline mode with cached validation (default: true) */
  enableCache?: boolean;
}
