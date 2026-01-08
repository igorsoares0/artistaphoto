import { BaseOperation } from '../base/Operation';
import { validateAdjustmentValue } from '../../utils/validators';
import { clamp } from '../../utils/color';
import type { AdjustmentParams } from '../../types';

export class TemperatureAdjustment extends BaseOperation {
  readonly type = 'adjustment' as const;
  readonly params: AdjustmentParams;

  constructor(value: number) {
    super();
    this.params = {
      adjustment: 'temperature',
      value: validateAdjustmentValue(value),
    };
  }

  async apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const temp = this.params.value / 100; // -1 to 1

    for (let i = 0; i < data.length; i += 4) {
      if (temp > 0) {
        // Warmer: increase red, decrease blue
        data[i] = clamp(data[i] + temp * 40);
        data[i + 2] = clamp(data[i + 2] - temp * 40);
      } else {
        // Cooler: decrease red, increase blue
        data[i] = clamp(data[i] + temp * 40);
        data[i + 2] = clamp(data[i + 2] - temp * 40);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
