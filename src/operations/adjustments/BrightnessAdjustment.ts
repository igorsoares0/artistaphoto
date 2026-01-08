import { BaseOperation } from '../base/Operation';
import { validateAdjustmentValue } from '../../utils/validators';
import { clamp } from '../../utils/color';
import type { AdjustmentParams } from '../../types';

export class BrightnessAdjustment extends BaseOperation {
  readonly type = 'adjustment' as const;
  readonly params: AdjustmentParams;

  constructor(value: number) {
    super();
    this.params = {
      adjustment: 'brightness',
      value: validateAdjustmentValue(value),
    };
  }

  async apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const adjustment = this.params.value * 2.55; // Convert to 0-255 scale

    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] + adjustment);
      data[i + 1] = clamp(data[i + 1] + adjustment);
      data[i + 2] = clamp(data[i + 2] + adjustment);
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
