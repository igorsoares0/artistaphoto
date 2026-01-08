// Main SDK class
export { ArtistAPhoto } from './core/ArtistAPhoto';

// Export all types
export type {
  FilterType,
  ExportFormat,
  CropOptions,
  ResizeOptions,
  ImageMetadata,
  ExportOptions,
  AdjustmentType,
  AdjustmentParams,
  FilterParams,
  OperationType,
} from './types';

// Export errors
export {
  ArtistAPhotoError,
  InvalidDimensionsError,
  InvalidCropError,
  ImageLoadError,
  ExportError,
  CanvasContextError,
} from './errors/ArtistAPhotoError';

// Export worker pool for advanced usage
export { WorkerPool } from './workers/workerPool';
export type { WorkerTask, WorkerResponse } from './workers/workerPool';

// Convenience factory function
export async function createEditor(
  source: string | File | HTMLImageElement | HTMLCanvasElement
): Promise<import('./core/ArtistAPhoto').ArtistAPhoto> {
  const { ArtistAPhoto } = await import('./core/ArtistAPhoto');

  if (typeof source === 'string') {
    return ArtistAPhoto.fromUrl(source);
  } else if (source instanceof File) {
    return ArtistAPhoto.fromFile(source);
  } else if (source instanceof HTMLImageElement) {
    return ArtistAPhoto.fromImageElement(source);
  } else if (source instanceof HTMLCanvasElement) {
    return ArtistAPhoto.fromCanvas(source);
  }

  throw new Error('Unsupported source type');
}
