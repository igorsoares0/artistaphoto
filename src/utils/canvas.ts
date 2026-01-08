import { CanvasContextError, ExportError } from '../errors/ArtistAPhotoError';
import type { ExportFormat } from '../types';

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new CanvasContextError('Failed to get 2D context');
  }
  return ctx;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'image/png',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new ExportError('Failed to create blob from canvas'));
        }
      },
      format,
      quality
    );
  });
}

export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'image/png',
  quality?: number
): string {
  return canvas.toDataURL(format, quality);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
