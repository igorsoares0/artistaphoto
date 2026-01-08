export type OperationType = 'crop' | 'resize' | 'filter' | 'adjustment';

export interface OperationParams {
  [key: string]: any;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeOptions {
  quality?: 'low' | 'medium' | 'high';
  maintainAspectRatio?: boolean;
}

export interface ResizeParams {
  width: number;
  height: number;
  quality: 'low' | 'medium' | 'high';
  maintainAspectRatio: boolean;
}
