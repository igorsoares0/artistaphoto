import { FilterOperation } from './FilterOperation';
import type { VignetteParams } from '../../types';

export class VignetteFilter extends FilterOperation {
  readonly params: VignetteParams;

  constructor(intensity: number = 1.0, strength: number = 0.5) {
    super(intensity);
    this.params = {
      filterType: 'vignette',
      intensity: this.intensity,
      strength: Math.max(0, Math.min(1, strength)),
    };
  }

  protected applyFilter(data: Uint8ClampedArray, width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const strength = this.params.strength || 0.5;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const vignette = 1 - (distance / maxDistance) * strength;
        const factor = Math.max(0, Math.min(1, vignette));

        const index = (y * width + x) * 4;
        const originalR = data[index];
        const originalG = data[index + 1];
        const originalB = data[index + 2];

        // Apply vignette with intensity
        data[index] = originalR * (1 - this.intensity) + originalR * factor * this.intensity;
        data[index + 1] = originalG * (1 - this.intensity) + originalG * factor * this.intensity;
        data[index + 2] = originalB * (1 - this.intensity) + originalB * factor * this.intensity;
      }
    }
  }
}
