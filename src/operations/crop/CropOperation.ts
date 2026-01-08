import { BaseOperation } from '../base/Operation';
import type { CropOptions } from '../../types';

export class CropOperation extends BaseOperation {
  readonly type = 'crop' as const;
  readonly params: CropOptions;

  constructor(params: CropOptions) {
    super();
    this.params = params;
  }

  async apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    const { x, y, width, height } = this.params;

    // Get cropped image data
    const imageData = ctx.getImageData(x, y, width, height);

    // Resize canvas to cropped dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw cropped image
    ctx.putImageData(imageData, 0, 0);
  }

  validate(): boolean {
    const { x, y, width, height } = this.params;
    return x >= 0 && y >= 0 && width > 0 && height > 0;
  }
}
