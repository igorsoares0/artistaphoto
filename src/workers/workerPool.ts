export interface WorkerTask {
  type: string;
  imageData: ImageData;
  params?: any;
}

export interface WorkerResponse {
  result: ImageData;
  error?: string;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private maxWorkers: number;
  private workerUrl: string | null = null;

  constructor(maxWorkers?: number) {
    this.maxWorkers = maxWorkers || navigator.hardwareConcurrency || 4;
  }

  private createWorker(): Worker {
    if (!this.workerUrl) {
      // Create worker from blob if worker file is not available
      const workerCode = `
        // Inline worker code would go here
        // For now, this is a placeholder
        self.onmessage = function(e) {
          self.postMessage({ result: e.data.imageData });
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.workerUrl = URL.createObjectURL(blob);
    }

    const worker = new Worker(this.workerUrl);
    this.workers.push(worker);
    return worker;
  }

  private async getAvailableWorker(): Promise<Worker> {
    if (this.availableWorkers.length > 0) {
      return this.availableWorkers.pop()!;
    }

    if (this.workers.length < this.maxWorkers) {
      return this.createWorker();
    }

    // Wait for a worker to become available
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.availableWorkers.length > 0) {
          clearInterval(checkInterval);
          resolve(this.availableWorkers.pop()!);
        }
      }, 10);
    });
  }

  private releaseWorker(worker: Worker): void {
    this.availableWorkers.push(worker);
  }

  async execute<T = WorkerResponse>(task: WorkerTask): Promise<T> {
    const worker = await this.getAvailableWorker();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.releaseWorker(worker);
        reject(new Error('Worker timeout'));
      }, 30000); // 30 second timeout

      worker.onmessage = (e: MessageEvent<T>) => {
        clearTimeout(timeout);
        this.releaseWorker(worker);
        resolve(e.data);
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        this.releaseWorker(worker);
        reject(error);
      };

      worker.postMessage(task);
    });
  }

  terminate(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];

    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = null;
    }
  }
}
