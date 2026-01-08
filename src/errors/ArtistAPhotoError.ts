export class ArtistAPhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArtistAPhotoError';
    Object.setPrototypeOf(this, ArtistAPhotoError.prototype);
  }
}

export class InvalidDimensionsError extends ArtistAPhotoError {
  constructor(message: string = 'Invalid dimensions') {
    super(message);
    this.name = 'InvalidDimensionsError';
    Object.setPrototypeOf(this, InvalidDimensionsError.prototype);
  }
}

export class InvalidCropError extends ArtistAPhotoError {
  constructor(message: string = 'Invalid crop parameters') {
    super(message);
    this.name = 'InvalidCropError';
    Object.setPrototypeOf(this, InvalidCropError.prototype);
  }
}

export class ImageLoadError extends ArtistAPhotoError {
  constructor(message: string = 'Failed to load image') {
    super(message);
    this.name = 'ImageLoadError';
    Object.setPrototypeOf(this, ImageLoadError.prototype);
  }
}

export class ExportError extends ArtistAPhotoError {
  constructor(message: string = 'Failed to export image') {
    super(message);
    this.name = 'ExportError';
    Object.setPrototypeOf(this, ExportError.prototype);
  }
}

export class CanvasContextError extends ArtistAPhotoError {
  constructor(message: string = 'Failed to get canvas context') {
    super(message);
    this.name = 'CanvasContextError';
    Object.setPrototypeOf(this, CanvasContextError.prototype);
  }
}
