import { BaseOperation } from '../base/Operation';
import { validateFilterIntensity } from '../../utils/validators';
import type { FilterParams } from '../../types';

export abstract class FilterOperation extends BaseOperation {
  readonly type = 'filter' as const;
  protected intensity: number;
  abstract readonly params: FilterParams;

  constructor(intensity: number = 1.0) {
    super();
    this.intensity = validateFilterIntensity(intensity);
  }

  async apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply filter to each pixel
    this.applyFilter(data, canvas.width, canvas.height);

    ctx.putImageData(imageData, 0, 0);
  }

  protected abstract applyFilter(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): void;
}
