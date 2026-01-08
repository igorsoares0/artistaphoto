import { ImageLoadError } from '../errors/ArtistAPhotoError';
import { createCanvas, getContext2D } from './canvas';

export async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ImageLoadError(`Failed to load image from ${url}`));
    img.src = url;
  });
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImageFromUrl(url);
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function getImageData(img: HTMLImageElement): ImageData {
  const canvas = createCanvas(img.width, img.height);
  const ctx = getContext2D(canvas);
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = createCanvas(imageData.width, imageData.height);
  const ctx = getContext2D(canvas);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
