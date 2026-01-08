import { createCanvas, getContext2D } from '../utils/canvas';
import type { ImageState } from './ImageState';
import type { Operation } from '../operations/base/Operation';

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = createCanvas(1, 1);
    this.ctx = getContext2D(this.canvas);
  }

  async execute(
    state: ImageState,
    operations: ReadonlyArray<Operation>
  ): Promise<HTMLCanvasElement> {
    // Set up canvas with original image
    this.canvas.width = state.width;
    this.canvas.height = state.height;
    this.ctx.drawImage(state.originalImage, 0, 0);

    // Apply operations sequentially
    for (const operation of operations) {
      await operation.apply(this.canvas, this.ctx);
    }

    return this.canvas;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
