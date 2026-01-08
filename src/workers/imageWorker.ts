// Web Worker for heavy image processing operations
// This worker can be used for blur, sharpen, edge detection, and pixelate filters

interface WorkerTask {
  type: 'blur' | 'sharpen' | 'edgeDetection' | 'pixelate';
  imageData: ImageData;
  params?: any;
}

interface WorkerResponse {
  result: ImageData;
  error?: string;
}

// Convolution helper
function convolve(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[],
  kernelSize: number
): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data.length);
  const half = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixelY = Math.min(height - 1, Math.max(0, y + ky - half));
          const pixelX = Math.min(width - 1, Math.max(0, x + kx - half));
          const pixelIndex = (pixelY * width + pixelX) * 4;
          const weight = kernel[ky * kernelSize + kx];

          r += data[pixelIndex] * weight;
          g += data[pixelIndex + 1] * weight;
          b += data[pixelIndex + 2] * weight;
        }
      }

      const index = (y * width + x) * 4;
      result[index] = Math.max(0, Math.min(255, r));
      result[index + 1] = Math.max(0, Math.min(255, g));
      result[index + 2] = Math.max(0, Math.min(255, b));
      result[index + 3] = data[index + 3];
    }
  }

  return result;
}

function applyBlur(imageData: ImageData): ImageData {
  const kernel = [1 / 16, 2 / 16, 1 / 16, 2 / 16, 4 / 16, 2 / 16, 1 / 16, 2 / 16, 1 / 16];
  const result = convolve(imageData.data, imageData.width, imageData.height, kernel, 3);
  const newImageData = new ImageData(imageData.width, imageData.height);
  newImageData.data.set(result);
  return newImageData;
}

function applySharpen(imageData: ImageData): ImageData {
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const result = convolve(imageData.data, imageData.width, imageData.height, kernel, 3);
  const newImageData = new ImageData(imageData.width, imageData.height);
  newImageData.data.set(result);
  return newImageData;
}

function applyEdgeDetection(imageData: ImageData): ImageData {
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new Uint8ClampedArray(data.length);

  // Convert to grayscale
  const gray = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const grayValue = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    gray[i] = gray[i + 1] = gray[i + 2] = grayValue;
    gray[i + 3] = data[i + 3];
  }

  // Apply Sobel
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          const pixelValue = gray[pixelIndex];

          gx += pixelValue * sobelX[kernelIndex];
          gy += pixelValue * sobelY[kernelIndex];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const index = (y * width + x) * 4;

      result[index] = result[index + 1] = result[index + 2] = Math.min(255, magnitude);
      result[index + 3] = data[index + 3];
    }
  }

  const newImageData = new ImageData(width, height);
  newImageData.data.set(result);
  return newImageData;
}

function applyPixelate(imageData: ImageData, blockSize: number = 10): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      // Calculate average
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const index = ((y + dy) * width + (x + dx)) * 4;
          r += data[index];
          g += data[index + 1];
          b += data[index + 2];
          count++;
        }
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // Fill block
      for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
          const index = ((y + dy) * width + (x + dx)) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
        }
      }
    }
  }

  const newImageData = new ImageData(width, height);
  newImageData.data.set(data);
  return newImageData;
}

// Message handler
self.onmessage = (e: MessageEvent<WorkerTask>) => {
  try {
    const { type, imageData, params } = e.data;
    let result: ImageData;

    switch (type) {
      case 'blur':
        result = applyBlur(imageData);
        break;
      case 'sharpen':
        result = applySharpen(imageData);
        break;
      case 'edgeDetection':
        result = applyEdgeDetection(imageData);
        break;
      case 'pixelate':
        result = applyPixelate(imageData, params?.blockSize || 10);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    const response: WorkerResponse = { result };
    self.postMessage(response, [result.data.buffer]);
  } catch (error) {
    const response: WorkerResponse = {
      result: e.data.imageData,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(response);
  }
};

export {};
