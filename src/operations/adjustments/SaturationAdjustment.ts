import { BaseOperation } from '../base/Operation';
import { validateAdjustmentValue } from '../../utils/validators';
import { clamp } from '../../utils/color';
import type { AdjustmentParams } from '../../types';

export class SaturationAdjustment extends BaseOperation {
  readonly type = 'adjustment' as const;
  readonly params: AdjustmentParams;

  constructor(value: number) {
    super();
    this.params = {
      adjustment: 'saturation',
      value: validateAdjustmentValue(value),
    };
  }

  async apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to saturation factor: -100 to 100 -> 0 to 2
    const factor = (this.params.value + 100) / 100;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Convert to grayscale for luminance
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Adjust saturation
      data[i] = clamp(gray + factor * (r - gray));
      data[i + 1] = clamp(gray + factor * (g - gray));
      data[i + 2] = clamp(gray + factor * (b - gray));
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
