import { BaseOperation } from '../base/Operation';
import type { TextOptions, TextParams } from '../../types';

export class TextOperation extends BaseOperation {
  readonly type = 'text' as const;
  readonly params: TextParams;

  constructor(options: TextOptions) {
    super();
    this.params = {
      text: options.text,
      x: options.x,
      y: options.y,
      fontSize: options.fontSize || 24,
      fontFamily: options.fontFamily || 'Arial',
      color: options.color || '#000000',
      align: options.align || 'left',
      baseline: options.baseline || 'alphabetic',
      maxWidth: options.maxWidth || 0,
      bold: options.bold || false,
      italic: options.italic || false,
      rotation: options.rotation || 0,
      stroke: options.stroke,
      shadow: options.shadow,
    };
  }

  async apply(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
    ctx.save();

    // Apply rotation if needed
    if (this.params.rotation !== 0) {
      ctx.translate(this.params.x, this.params.y);
      ctx.rotate((this.params.rotation * Math.PI) / 180);
      ctx.translate(-this.params.x, -this.params.y);
    }

    // Configure font
    const fontStyle = this.params.italic ? 'italic' : 'normal';
    const fontWeight = this.params.bold ? 'bold' : 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${this.params.fontSize}px ${this.params.fontFamily}`;
    ctx.textAlign = this.params.align;
    ctx.textBaseline = this.params.baseline;

    // Apply shadow if provided
    if (this.params.shadow) {
      ctx.shadowColor = this.params.shadow.color;
      ctx.shadowBlur = this.params.shadow.blur;
      ctx.shadowOffsetX = this.params.shadow.offsetX;
      ctx.shadowOffsetY = this.params.shadow.offsetY;
    }

    // Draw text stroke if provided
    if (this.params.stroke) {
      ctx.strokeStyle = this.params.stroke.color;
      ctx.lineWidth = this.params.stroke.width;
      if (this.params.maxWidth > 0) {
        ctx.strokeText(this.params.text, this.params.x, this.params.y, this.params.maxWidth);
      } else {
        ctx.strokeText(this.params.text, this.params.x, this.params.y);
      }
    }

    // Draw text fill
    ctx.fillStyle = this.params.color;
    if (this.params.maxWidth > 0) {
      ctx.fillText(this.params.text, this.params.x, this.params.y, this.params.maxWidth);
    } else {
      ctx.fillText(this.params.text, this.params.x, this.params.y);
    }

    ctx.restore();
  }

  validate(): boolean {
    return (
      this.params.text.length > 0 &&
      this.params.fontSize > 0 &&
      this.params.x >= 0 &&
      this.params.y >= 0
    );
  }
}
