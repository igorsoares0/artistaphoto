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
export type LicenseStatus = 'active' | 'expired' | 'disabled' | 'invalid';

export interface LicenseInfo {
  key: string;
  status: LicenseStatus;
  isValid: boolean;
  expiresAt: string | null;
  activationLimit: number;
  activationUsage: number;
  customerEmail?: string;
  customerName?: string;
  productName?: string;
}

export interface LicenseValidationResult {
  valid: boolean;
  error?: string;
  license_key?: {
    id: number;
    status: string;
    key: string;
    activation_limit: number;
    activation_usage: number;
    created_at: string;
    expires_at: string | null;
  };
  instance?: {
    id: string;
    name: string;
    created_at: string;
  };
  meta?: {
    store_id: number;
    order_id: number;
    product_name: string;
    customer_email: string;
    customer_name: string;
  };
}

export interface LicenseConfig {
  /** Your Lemon Squeezy store URL for purchasing licenses */
  storeUrl?: string;
  /** Cache duration in milliseconds (default: 24 hours) */
  cacheDuration?: number;
  /** Enable offline mode with cached validation (default: true) */
  enableCache?: boolean;
}
