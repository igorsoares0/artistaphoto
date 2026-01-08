import { BaseOperation } from '../base/Operation';
import { validateAdjustmentValue } from '../../utils/validators';
import { clamp } from '../../utils/color';
import type { AdjustmentParams } from '../../types';

export class ExposureAdjustment extends BaseOperation {
  readonly type = 'adjustment' as const;
  readonly params: AdjustmentParams;

  constructor(value: number) {
    super();
    this.params = {
      adjustment: 'exposure',
      value: validateAdjustmentValue(value),
    };
  }

  async apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Exposure adjustment using gamma correction
    const exposure = this.params.value / 100; // -1 to 1
    const factor = Math.pow(2, exposure);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] * factor);
      data[i + 1] = clamp(data[i + 1] * factor);
      data[i + 2] = clamp(data[i + 2] * factor);
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
