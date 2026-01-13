export type OperationType = 'crop' | 'resize' | 'filter' | 'adjustment' | 'text' | 'shape';

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

export interface TextOptions {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  baseline?: 'top' | 'middle' | 'bottom' | 'alphabetic';
  maxWidth?: number;
  bold?: boolean;
  italic?: boolean;
  stroke?: {
    color: string;
    width: number;
  };
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  rotation?: number;
}

export interface TextParams extends Required<Omit<TextOptions, 'stroke' | 'shadow'>> {
  stroke?: {
    color: string;
    width: number;
  };
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
}

export type ShapeType = 'rectangle' | 'ellipse';

export interface ShapeOptions {
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: {
    color: string;
    width: number;
  };
  rotation?: number;
}

export interface ShapeParams extends Required<Omit<ShapeOptions, 'fill' | 'stroke'>> {
  fill?: string;
  stroke?: {
    color: string;
    width: number;
  };
}
