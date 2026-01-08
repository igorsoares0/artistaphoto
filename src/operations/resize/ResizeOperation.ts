import { BaseOperation } from '../base/Operation';
import { createCanvas, getContext2D } from '../../utils/canvas';
import type { ResizeParams, ResizeOptions } from '../../types';

export class ResizeOperation extends BaseOperation {
  readonly type = 'resize' as const;
  readonly params: ResizeParams;

  constructor(width: number, height: number, options?: ResizeOptions) {
    super();
    this.params = {
      width,
      height,
      quality: options?.quality || 'high',
      maintainAspectRatio: options?.maintainAspectRatio ?? true,
    };
  }

  async apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    const { width, height, quality } = this.params;

    // Store current image
    const currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const tempCanvas = createCanvas(canvas.width, canvas.height);
    const tempCtx = getContext2D(tempCanvas);
    tempCtx.putImageData(currentImage, 0, 0);

    // Resize canvas
    canvas.width = width;
    canvas.height = height;

    // Set image smoothing based on quality
    ctx.imageSmoothingEnabled = quality === 'high' || quality === 'medium';
    ctx.imageSmoothingQuality = quality === 'high' ? 'high' : quality === 'medium' ? 'medium' : 'low';

    // Draw resized image
    ctx.drawImage(tempCanvas, 0, 0, width, height);
  }

  validate(): boolean {
    const { width, height } = this.params;
    return width > 0 && height > 0;
  }
}
