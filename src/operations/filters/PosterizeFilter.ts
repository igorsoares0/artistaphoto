import { FilterOperation } from './FilterOperation';
import { clamp } from '../../utils/color';
import type { PosterizeParams } from '../../types';

export class PosterizeFilter extends FilterOperation {
  readonly params: PosterizeParams;

  constructor(intensity: number = 1.0, levels: number = 4) {
    super(intensity);
    this.params = {
      filterType: 'posterize',
      intensity: this.intensity,
      levels: Math.max(2, Math.min(16, Math.floor(levels))),
    };
  }

  protected applyFilter(data: Uint8ClampedArray): void {
    const { levels } = this.params;
    const step = 255 / (levels - 1);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Quantize each channel
      const newR = Math.round(r / step) * step;
      const newG = Math.round(g / step) * step;
      const newB = Math.round(b / step) * step;

      // Apply intensity (blend with original)
      data[i] = clamp(data[i] * (1 - this.intensity) + newR * this.intensity);
      data[i + 1] = clamp(data[i + 1] * (1 - this.intensity) + newG * this.intensity);
      data[i + 2] = clamp(data[i + 2] * (1 - this.intensity) + newB * this.intensity);
    }
  }
}
