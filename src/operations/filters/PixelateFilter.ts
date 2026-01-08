import { FilterOperation } from './FilterOperation';
import type { PixelateParams } from '../../types';

export class PixelateFilter extends FilterOperation {
  readonly params: PixelateParams;

  constructor(intensity: number = 1.0, blockSize: number = 10) {
    super(intensity);
    this.params = {
      filterType: 'pixelate',
      intensity: this.intensity,
      blockSize: Math.max(1, Math.floor(blockSize)),
    };
  }

  protected applyFilter(data: Uint8ClampedArray, width: number, height: number): void {
    const { blockSize } = this.params;
    const original = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        // Calculate average color of the block
        const avgColor = this.getBlockAverage(original, x, y, blockSize, width, height);

        // Fill block with average color
        this.fillBlock(data, original, x, y, blockSize, width, height, avgColor);
      }
    }
  }

  private getBlockAverage(
    data: Uint8ClampedArray,
    startX: number,
    startY: number,
    size: number,
    width: number,
    height: number
  ): [number, number, number] {
    let r = 0,
      g = 0,
      b = 0,
      count = 0;

    for (let y = startY; y < Math.min(startY + size, height); y++) {
      for (let x = startX; x < Math.min(startX + size, width); x++) {
        const index = (y * width + x) * 4;
        r += data[index];
        g += data[index + 1];
        b += data[index + 2];
        count++;
      }
    }

    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
  }

  private fillBlock(
    data: Uint8ClampedArray,
    original: Uint8ClampedArray,
    startX: number,
    startY: number,
    size: number,
    width: number,
    height: number,
    color: [number, number, number]
  ): void {
    const [r, g, b] = color;

    for (let y = startY; y < Math.min(startY + size, height); y++) {
      for (let x = startX; x < Math.min(startX + size, width); x++) {
        const index = (y * width + x) * 4;

        // Apply intensity (blend with original)
        data[index] = original[index] * (1 - this.intensity) + r * this.intensity;
        data[index + 1] = original[index + 1] * (1 - this.intensity) + g * this.intensity;
        data[index + 2] = original[index + 2] * (1 - this.intensity) + b * this.intensity;
      }
    }
  }
}
