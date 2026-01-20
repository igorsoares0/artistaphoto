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

export function applyWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const text = 'ArtistAPhoto - UNLICENSED';
  const fontSize = Math.max(16, Math.floor(canvas.width * 0.03));

  ctx.save();

  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(text).width;
  const spacing = textWidth * 1.5;
  const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 4);

  for (let y = -diagonal; y < diagonal; y += spacing * 0.6) {
    for (let x = -diagonal; x < diagonal; x += spacing) {
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
}
