import type { OperationType, OperationParams } from '../../types';

export interface Operation {
  readonly type: OperationType;
  readonly params: OperationParams;

  apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void>;
  validate(): boolean;
}

export abstract class BaseOperation implements Operation {
  abstract readonly type: OperationType;
  abstract readonly params: OperationParams;

  abstract apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void>;

  validate(): boolean {
    return true;
  }
}
