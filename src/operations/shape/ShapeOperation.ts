import { BaseOperation } from '../base/Operation';
import type { ShapeOptions, ShapeParams } from '../../types';

export class ShapeOperation extends BaseOperation {
  readonly type = 'shape' as const;
  readonly params: ShapeParams;

  constructor(options: ShapeOptions) {
    super();
    this.params = {
      type: options.type,
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      fill: options.fill,
      stroke: options.stroke,
      rotation: options.rotation || 0,
    };
  }

  async apply(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    ctx.save();

    // Apply rotation if needed
    if (this.params.rotation !== 0) {
      const centerX = this.params.x + this.params.width / 2;
      const centerY = this.params.y + this.params.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((this.params.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // Draw shape based on type
    if (this.params.type === 'rectangle') {
      this.drawRectangle(ctx);
    } else if (this.params.type === 'ellipse') {
      this.drawEllipse(ctx);
    }

    ctx.restore();
  }

  private drawRectangle(ctx: CanvasRenderingContext2D): void {
    // Draw fill if provided
    if (this.params.fill) {
      ctx.fillStyle = this.params.fill;
      ctx.fillRect(this.params.x, this.params.y, this.params.width, this.params.height);
    }

    // Draw stroke if provided
    if (this.params.stroke) {
      ctx.strokeStyle = this.params.stroke.color;
      ctx.lineWidth = this.params.stroke.width;
      ctx.strokeRect(this.params.x, this.params.y, this.params.width, this.params.height);
    }
  }

  private drawEllipse(ctx: CanvasRenderingContext2D): void {
    const centerX = this.params.x + this.params.width / 2;
    const centerY = this.params.y + this.params.height / 2;
    const radiusX = this.params.width / 2;
    const radiusY = this.params.height / 2;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

    // Draw fill if provided
    if (this.params.fill) {
      ctx.fillStyle = this.params.fill;
      ctx.fill();
    }

    // Draw stroke if provided
    if (this.params.stroke) {
      ctx.strokeStyle = this.params.stroke.color;
      ctx.lineWidth = this.params.stroke.width;
      ctx.stroke();
    }
  }

  validate(): boolean {
    return (
      this.params.width > 0 &&
      this.params.height > 0 &&
      this.params.x >= 0 &&
      this.params.y >= 0 &&
      (this.params.type === 'rectangle' || this.params.type === 'ellipse')
    );
  }
}
