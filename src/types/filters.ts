export type FilterType =
  | 'grayscale'
  | 'sepia'
  | 'blur'
  | 'sharpen'
  | 'vintage'
  | 'invert'
  | 'vignette'
  | 'posterize'
  | 'pixelate'
  | 'edgeDetection';

export interface FilterParams {
  filterType: FilterType;
  intensity?: number;
  [key: string]: any;
}

export interface BlurParams extends FilterParams {
  filterType: 'blur';
  radius?: number;
}

export interface SharpenParams extends FilterParams {
  filterType: 'sharpen';
}

export interface VignetteParams extends FilterParams {
  filterType: 'vignette';
  strength?: number;
}

export interface PosterizeParams extends FilterParams {
  filterType: 'posterize';
  levels?: number;
}

export interface PixelateParams extends FilterParams {
  filterType: 'pixelate';
  blockSize?: number;
}
