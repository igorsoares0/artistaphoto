import { FilterOperation } from './FilterOperation';
import { clamp } from '../../utils/color';
import type { FilterParams } from '../../types';

export class SepiaFilter extends FilterOperation {
  readonly params: FilterParams = { filterType: 'sepia' };

  constructor(intensity: number = 1.0) {
    super(intensity);
    this.params = { filterType: 'sepia', intensity: this.intensity };
  }

  protected applyFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Sepia transformation matrix
      const newR = r * 0.393 + g * 0.769 + b * 0.189;
      const newG = r * 0.349 + g * 0.686 + b * 0.168;
      const newB = r * 0.272 + g * 0.534 + b * 0.131;

      // Apply intensity (blend with original)
      data[i] = clamp(data[i] * (1 - this.intensity) + newR * this.intensity);
      data[i + 1] = clamp(data[i + 1] * (1 - this.intensity) + newG * this.intensity);
      data[i + 2] = clamp(data[i + 2] * (1 - this.intensity) + newB * this.intensity);
    }
  }
}
