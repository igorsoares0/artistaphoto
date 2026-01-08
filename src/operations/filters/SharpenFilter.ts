import { FilterOperation } from './FilterOperation';
import { convolve, SHARPEN_KERNEL_3X3 } from '../../utils/matrix';
import type { SharpenParams } from '../../types';

export class SharpenFilter extends FilterOperation {
  readonly params: SharpenParams;

  constructor(intensity: number = 1.0) {
    super(intensity);
    this.params = { filterType: 'sharpen', intensity: this.intensity };
  }

  protected applyFilter(data: Uint8ClampedArray, width: number, height: number): void {
    // Apply sharpen using convolution
    const sharpened = convolve(data, width, height, SHARPEN_KERNEL_3X3, 3);

    // Apply intensity (blend with original)
    for (let i = 0; i < data.length; i++) {
      if ((i + 1) % 4 !== 0) {
        // Skip alpha channel
        data[i] = data[i] * (1 - this.intensity) + sharpened[i] * this.intensity;
      }
    }
  }
}
