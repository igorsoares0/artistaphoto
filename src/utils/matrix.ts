export function convolve(
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
      result[index + 3] = data[index + 3]; // Preserve alpha
    }
  }

  return result;
}

export const BLUR_KERNEL_3X3 = [1 / 16, 2 / 16, 1 / 16, 2 / 16, 4 / 16, 2 / 16, 1 / 16, 2 / 16, 1 / 16];

export const SHARPEN_KERNEL_3X3 = [0, -1, 0, -1, 5, -1, 0, -1, 0];

export const SOBEL_X_KERNEL = [-1, 0, 1, -2, 0, 2, -1, 0, 1];

export const SOBEL_Y_KERNEL = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
