import { FilterOperation } from './FilterOperation';
import { convolve, BLUR_KERNEL_3X3 } from '../../utils/matrix';
import type { BlurParams } from '../../types';

export class BlurFilter extends FilterOperation {
  readonly params: BlurParams;

  constructor(intensity: number = 1.0, radius: number = 1) {
    super(intensity);
    this.params = { filterType: 'blur', intensity: this.intensity, radius };
  }

  protected applyFilter(data: Uint8ClampedArray, width: number, height: number): void {
    // Apply Gaussian blur using convolution
    const blurred = convolve(data, width, height, BLUR_KERNEL_3X3, 3);

    // Apply intensity (blend with original)
    for (let i = 0; i < data.length; i++) {
      if ((i + 1) % 4 !== 0) {
        // Skip alpha channel
        data[i] = data[i] * (1 - this.intensity) + blurred[i] * this.intensity;
      }
    }
  }
}
