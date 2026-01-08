import { BaseOperation } from '../base/Operation';
import { validateAdjustmentValue } from '../../utils/validators';
import { clamp } from '../../utils/color';
import type { AdjustmentParams } from '../../types';

export class ContrastAdjustment extends BaseOperation {
  readonly type = 'adjustment' as const;
  readonly params: AdjustmentParams;

  constructor(value: number) {
    super();
    this.params = {
      adjustment: 'contrast',
      value: validateAdjustmentValue(value),
    };
  }

  async apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert value to contrast factor: -100 to 100 -> 0 to 2+
    const factor = (259 * (this.params.value + 255)) / (255 * (259 - this.params.value));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(factor * (data[i] - 128) + 128);
      data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
      data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
