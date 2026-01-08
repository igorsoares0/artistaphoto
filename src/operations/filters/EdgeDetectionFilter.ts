import { FilterOperation } from './FilterOperation';
import { SOBEL_X_KERNEL, SOBEL_Y_KERNEL } from '../../utils/matrix';
import { clamp } from '../../utils/color';
import type { FilterParams } from '../../types';

export class EdgeDetectionFilter extends FilterOperation {
  readonly params: FilterParams;

  constructor(intensity: number = 1.0) {
    super(intensity);
    this.params = { filterType: 'edgeDetection', intensity: this.intensity };
  }

  protected applyFilter(data: Uint8ClampedArray, width: number, height: number): void {
    // Convert to grayscale first
    const gray = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const grayValue = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      gray[i] = gray[i + 1] = gray[i + 2] = grayValue;
      gray[i + 3] = data[i + 3];
    }

    // Apply Sobel operator
    const result = this.applySobel(gray, width, height);

    // Apply intensity (blend with original)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * (1 - this.intensity) + result[i] * this.intensity;
      data[i + 1] = data[i + 1] * (1 - this.intensity) + result[i + 1] * this.intensity;
      data[i + 2] = data[i + 2] * (1 - this.intensity) + result[i + 2] * this.intensity;
    }
  }

  private applySobel(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data.length);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;

        // Apply Sobel kernels
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            const pixelValue = data[pixelIndex];

            gx += pixelValue * SOBEL_X_KERNEL[kernelIndex];
            gy += pixelValue * SOBEL_Y_KERNEL[kernelIndex];
          }
        }

        // Calculate magnitude
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const index = (y * width + x) * 4;

        result[index] = result[index + 1] = result[index + 2] = clamp(magnitude);
        result[index + 3] = data[index + 3]; // Preserve alpha
      }
    }

    return result;
  }
}
