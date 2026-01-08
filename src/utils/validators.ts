import { InvalidDimensionsError, InvalidCropError } from '../errors/ArtistAPhotoError';
import type { CropOptions } from '../types';

const MAX_DIMENSION = 16384;

export function validateDimensions(width: number, height: number): void {
  if (width <= 0 || height <= 0) {
    throw new InvalidDimensionsError('Dimensions must be positive numbers');
  }
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new InvalidDimensionsError(
      `Dimensions exceed maximum size (${MAX_DIMENSION}x${MAX_DIMENSION})`
    );
  }
}

export function validateCropParams(
  params: CropOptions,
  imageWidth: number,
  imageHeight: number
): void {
  const { x, y, width, height } = params;

  if (x < 0 || y < 0) {
    throw new InvalidCropError('Crop coordinates must be non-negative');
  }
  if (width <= 0 || height <= 0) {
    throw new InvalidCropError('Crop dimensions must be positive');
  }
  if (x + width > imageWidth || y + height > imageHeight) {
    throw new InvalidCropError('Crop area exceeds image bounds');
  }
}

export function validateAdjustmentValue(
  value: number,
  min: number = -100,
  max: number = 100
): number {
  return Math.max(min, Math.min(max, value));
}

export function validateFilterIntensity(intensity: number = 1.0): number {
  return Math.max(0, Math.min(1, intensity));
}
