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

export interface LicenseValidationResult {
  valid: boolean;
  error?: string;
  polarResponse?: PolarLicenseKeyResponse;
}

export interface LicenseConfig {
  /** Your Polar.sh organization ID (optional - already configured in SDK) */
  organizationId?: string;
  /** Your store URL for purchasing licenses */
  storeUrl?: string;
  /** Cache duration in milliseconds (default: 24 hours) */
  cacheDuration?: number;
  /** Enable offline mode with cached validation (default: true) */
  enableCache?: boolean;
}
