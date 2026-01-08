import { FilterOperation } from './FilterOperation';
import { clamp } from '../../utils/color';
import type { FilterParams } from '../../types';

export class VintageFilter extends FilterOperation {
  readonly params: FilterParams;

  constructor(intensity: number = 1.0) {
    super(intensity);
    this.params = { filterType: 'vintage', intensity: this.intensity };
  }

  protected applyFilter(data: Uint8ClampedArray, width: number, height: number): void {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Warm sepia-like tone
        let newR = r * 0.9 + 30;
        let newG = g * 0.85 + 10;
        let newB = b * 0.7;

        // Reduce saturation slightly
        const gray = (newR + newG + newB) / 3;
        newR = newR * 0.8 + gray * 0.2;
        newG = newG * 0.8 + gray * 0.2;
        newB = newB * 0.8 + gray * 0.2;

        // Apply vignette (darker at edges)
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const vignette = 1 - (distance / maxDistance) * 0.5;

        newR *= vignette;
        newG *= vignette;
        newB *= vignette;

        // Apply intensity (blend with original)
        data[i] = clamp(data[i] * (1 - this.intensity) + newR * this.intensity);
        data[i + 1] = clamp(data[i + 1] * (1 - this.intensity) + newG * this.intensity);
        data[i + 2] = clamp(data[i + 2] * (1 - this.intensity) + newB * this.intensity);
      }
    }
  }
}
