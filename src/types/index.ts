export type {
  OperationType,
  OperationParams,
  CropOptions,
  ResizeOptions,
  ResizeParams,
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
