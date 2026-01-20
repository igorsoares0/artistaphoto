import { ImageState } from './ImageState';
import { OperationQueue } from './OperationQueue';
import { ImageProcessor } from './ImageProcessor';
import { LicenseManager, LicenseError } from './LicenseManager';
import { loadImageFromUrl, loadImageFromFile, getImageData } from '../utils/imageLoader';
import { canvasToBlob, canvasToDataURL, downloadBlob, applyWatermark } from '../utils/canvas';
import { validateCropParams, validateDimensions } from '../utils/validators';
import { CropOperation } from '../operations/crop/CropOperation';
import { ResizeOperation } from '../operations/resize/ResizeOperation';
import { TextOperation } from '../operations/text/TextOperation';
import { ShapeOperation } from '../operations/shape/ShapeOperation';
import { GrayscaleFilter } from '../operations/filters/GrayscaleFilter';
import { SepiaFilter } from '../operations/filters/SepiaFilter';
import { BlurFilter } from '../operations/filters/BlurFilter';
import { SharpenFilter } from '../operations/filters/SharpenFilter';
import { VintageFilter } from '../operations/filters/VintageFilter';
import { InvertFilter } from '../operations/filters/InvertFilter';
import { VignetteFilter } from '../operations/filters/VignetteFilter';
import { PosterizeFilter } from '../operations/filters/PosterizeFilter';
import { PixelateFilter } from '../operations/filters/PixelateFilter';
import { EdgeDetectionFilter } from '../operations/filters/EdgeDetectionFilter';
import { BrightnessAdjustment } from '../operations/adjustments/BrightnessAdjustment';
import { ContrastAdjustment } from '../operations/adjustments/ContrastAdjustment';
import { SaturationAdjustment } from '../operations/adjustments/SaturationAdjustment';
import { ExposureAdjustment } from '../operations/adjustments/ExposureAdjustment';
import { TemperatureAdjustment } from '../operations/adjustments/TemperatureAdjustment';
import type { Operation } from '../operations/base/Operation';
import type {
  CropOptions,
  ResizeOptions,
  FilterType,
  ExportFormat,
  TextOptions,
  ShapeOptions,
  LicenseInfo,
  LicenseConfig,
} from '../types';

// Re-export LicenseError for consumers
export { LicenseError };

export class ArtistAPhoto {
  private state: ImageState;
  private operationQueue: OperationQueue;
  private processor: ImageProcessor;

  private constructor(state: ImageState) {
    this.state = state;
    this.operationQueue = new OperationQueue();
    this.processor = new ImageProcessor();
  }

  // ==================== License Management (Static Methods) ====================

  /**
   * Configure the SDK license settings
   * @param config - License configuration options
   * @example
   * ```typescript
   * ArtistAPhoto.configure({
   *   storeUrl: 'https://yourstore.lemonsqueezy.com',
   *   cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
   *   enableCache: true
   * });
   * ```
   */
  static configure(config: Partial<LicenseConfig>): void {
    LicenseManager.configure(config);
  }

  /**
   * Set and validate a license key
   * Must be called before using any SDK functionality
   * @param key - The license key from Lemon Squeezy
   * @returns Promise<LicenseInfo> - Information about the validated license
   * @throws LicenseError if the license is invalid, expired, or activation limit reached
   * @example
   * ```typescript
   * try {
   *   const licenseInfo = await ArtistAPhoto.setLicenseKey('APH-XXXX-XXXX-XXXX');
   *   console.log('License activated:', licenseInfo.productName);
   * } catch (error) {
   *   if (error instanceof LicenseError) {
   *     console.error('License error:', error.code, error.message);
   *   }
   * }
   * ```
   */
  static async setLicenseKey(key: string): Promise<LicenseInfo> {
    return LicenseManager.setLicenseKey(key);
  }

  /**
   * Check if a valid license is currently active
   * @returns boolean - true if a valid license is active
   */
  static isLicenseValid(): boolean {
    return LicenseManager.isLicenseValid();
  }

  /**
   * Get information about the current license
   * @returns LicenseInfo | null - License details or null if no license is set
   */
  static getLicenseInfo(): LicenseInfo | null {
    return LicenseManager.getLicenseInfo();
  }

  /**
   * Clear the current license (logout)
   * Removes the license from memory and cache
   */
  static clearLicense(): void {
    LicenseManager.clearLicense();
  }

  /**
   * Force refresh the license validation
   * Useful after renewal or to check for updates
   * @returns Promise<LicenseInfo> - Updated license information
   */
  static async refreshLicense(): Promise<LicenseInfo> {
    return LicenseManager.refreshLicense();
  }

  /**
   * Enable development mode (bypasses license validation)
   * Use this ONLY for local development and testing!
   * @example
   * ```typescript
   * // At the start of your app (development only)
   * if (process.env.NODE_ENV === 'development') {
   *   ArtistAPhoto.enableDevMode();
   * }
   * ```
   */
  static enableDevMode(): void {
    LicenseManager.enableDevMode();
  }

  /**
   * Check if development mode is enabled
   */
  static isDevMode(): boolean {
    return LicenseManager.isDevMode();
  }

  // ==================== Factory Methods ====================

  /**
   * Create an editor instance from an image URL
   * @param url - The URL of the image to load
   * @returns Promise<ArtistAPhoto> - Editor instance
   * @throws LicenseError if no valid license is set
   */
  static async fromUrl(url: string): Promise<ArtistAPhoto> {
    const img = await loadImageFromUrl(url);
    const imageData = getImageData(img);
    const state = new ImageState(img, imageData);
    return new ArtistAPhoto(state);
  }

  /**
   * Create an editor instance from a File object
   * @param file - The File object (from file input)
   * @returns Promise<ArtistAPhoto> - Editor instance
   * @throws LicenseError if no valid license is set
   */
  static async fromFile(file: File): Promise<ArtistAPhoto> {
    const img = await loadImageFromFile(file);
    const imageData = getImageData(img);
    const state = new ImageState(img, imageData);
    return new ArtistAPhoto(state);
  }

  /**
   * Create an editor instance from an existing canvas
   * @param canvas - The HTMLCanvasElement to use
   * @returns Promise<ArtistAPhoto> - Editor instance
   * @throws LicenseError if no valid license is set
   */
  static async fromCanvas(canvas: HTMLCanvasElement): Promise<ArtistAPhoto> {
    const img = new Image();
    img.src = canvas.toDataURL();
    await new Promise((resolve) => (img.onload = resolve));
    const imageData = getImageData(img);
    const state = new ImageState(img, imageData);
    return new ArtistAPhoto(state);
  }

  /**
   * Create an editor instance from an existing image element
   * @param img - The HTMLImageElement to use
   * @returns Promise<ArtistAPhoto> - Editor instance
   * @throws LicenseError if no valid license is set
   */
  static async fromImageElement(img: HTMLImageElement): Promise<ArtistAPhoto> {
    const imageData = getImageData(img);
    const state = new ImageState(img, imageData);
    return new ArtistAPhoto(state);
  }

  // ==================== Transformation Operations ====================

  crop(options: CropOptions): this {
    validateCropParams(options, this.state.width, this.state.height);
    const operation = new CropOperation(options);
    this.operationQueue.enqueue(operation);
    return this;
  }

  resize(width: number, height: number, options?: ResizeOptions): this {
    validateDimensions(width, height);
    const operation = new ResizeOperation(width, height, options);
    this.operationQueue.enqueue(operation);
    return this;
  }

  addText(options: TextOptions): this {
    const operation = new TextOperation(options);
    this.operationQueue.enqueue(operation);
    return this;
  }

  addShape(options: ShapeOptions): this {
    const operation = new ShapeOperation(options);
    this.operationQueue.enqueue(operation);
    return this;
  }

  // ==================== Filter Operations ====================

  filter(type: FilterType, intensity: number = 1.0): this {
    let operation: Operation;

    switch (type) {
      case 'grayscale':
        operation = new GrayscaleFilter(intensity);
        break;
      case 'sepia':
        operation = new SepiaFilter(intensity);
        break;
      case 'blur':
        operation = new BlurFilter(intensity);
        break;
      case 'sharpen':
        operation = new SharpenFilter(intensity);
        break;
      case 'vintage':
        operation = new VintageFilter(intensity);
        break;
      case 'invert':
        operation = new InvertFilter(intensity);
        break;
      case 'vignette':
        operation = new VignetteFilter(intensity);
        break;
      case 'posterize':
        operation = new PosterizeFilter(intensity);
        break;
      case 'pixelate':
        operation = new PixelateFilter(intensity);
        break;
      case 'edgeDetection':
        operation = new EdgeDetectionFilter(intensity);
        break;
    }

    this.operationQueue.enqueue(operation);
    return this;
  }

  // ==================== Adjustment Operations ====================

  brightness(value: number): this {
    const operation = new BrightnessAdjustment(value);
    this.operationQueue.enqueue(operation);
    return this;
  }

  contrast(value: number): this {
    const operation = new ContrastAdjustment(value);
    this.operationQueue.enqueue(operation);
    return this;
  }

  saturation(value: number): this {
    const operation = new SaturationAdjustment(value);
    this.operationQueue.enqueue(operation);
    return this;
  }

  exposure(value: number): this {
    const operation = new ExposureAdjustment(value);
    this.operationQueue.enqueue(operation);
    return this;
  }

  temperature(value: number): this {
    const operation = new TemperatureAdjustment(value);
    this.operationQueue.enqueue(operation);
    return this;
  }

  // ==================== Undo/Redo Operations ====================

  undo(): this {
    this.operationQueue.undo();
    return this;
  }

  redo(): this {
    this.operationQueue.redo();
    return this;
  }

  canUndo(): boolean {
    return this.operationQueue.canUndo();
  }

  canRedo(): boolean {
    return this.operationQueue.canRedo();
  }

  getHistory(): ReadonlyArray<Operation> {
    return this.operationQueue.getAllOperations();
  }

  // ==================== State Management ====================

  reset(): this {
    this.operationQueue.reset();
    return this;
  }

  getOriginal(): ImageData {
    return this.state.originalImageData;
  }

  async preview(): Promise<HTMLCanvasElement> {
    const operations = this.operationQueue.getActiveOperations();
    return await this.processor.execute(this.state, operations);
  }

  // ==================== Export Operations ====================

  async toCanvas(): Promise<HTMLCanvasElement> {
    return await this.preview();
  }

  async toBlob(format?: ExportFormat, quality?: number): Promise<Blob> {
    const canvas = await this.toCanvas();
    if (!LicenseManager.isLicenseValid()) {
      applyWatermark(canvas);
    }
    return await canvasToBlob(canvas, format, quality);
  }

  async toDataURL(format?: ExportFormat, quality?: number): Promise<string> {
    const canvas = await this.toCanvas();
    if (!LicenseManager.isLicenseValid()) {
      applyWatermark(canvas);
    }
    return canvasToDataURL(canvas, format, quality);
  }

  async download(filename: string, format?: ExportFormat, quality?: number): Promise<void> {
    const blob = await this.toBlob(format, quality);
    downloadBlob(blob, filename);
  }
}
