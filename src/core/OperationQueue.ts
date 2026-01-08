import type { Operation } from '../operations/base/Operation';

export class OperationQueue {
  private operations: Operation[] = [];
  private currentIndex: number = -1;

  enqueue(operation: Operation): void {
    // Remove "future" operations if any when adding new operation
    this.operations = this.operations.slice(0, this.currentIndex + 1);
    this.operations.push(operation);
    this.currentIndex++;
  }

  undo(): void {
    if (this.canUndo()) {
      this.currentIndex--;
    }
  }

  redo(): void {
    if (this.canRedo()) {
      this.currentIndex++;
    }
  }

  getActiveOperations(): ReadonlyArray<Operation> {
    return this.operations.slice(0, this.currentIndex + 1);
  }

  getAllOperations(): ReadonlyArray<Operation> {
    return this.operations;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.operations.length - 1;
  }

  clear(): void {
    this.operations = [];
    this.currentIndex = -1;
  }

  reset(): void {
    this.currentIndex = -1;
  }
}
