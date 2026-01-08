import { FilterOperation } from './FilterOperation';
import type { FilterParams } from '../../types';

export class InvertFilter extends FilterOperation {
  readonly params: FilterParams = { filterType: 'invert' };

  constructor(intensity: number = 1.0) {
    super(intensity);
    this.params = { filterType: 'invert', intensity: this.intensity };
  }

  protected applyFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * (1 - this.intensity) + (255 - data[i]) * this.intensity;
      data[i + 1] = data[i + 1] * (1 - this.intensity) + (255 - data[i + 1]) * this.intensity;
      data[i + 2] = data[i + 2] * (1 - this.intensity) + (255 - data[i + 2]) * this.intensity;
    }
  }
}
