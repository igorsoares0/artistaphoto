type OperationType = 'crop' | 'resize' | 'filter' | 'adjustment' | 'text' | 'shape';
interface OperationParams {
    [key: string]: any;
}
interface CropOptions {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface ResizeOptions {
    quality?: 'low' | 'medium' | 'high';
    maintainAspectRatio?: boolean;
}
interface TextOptions {
    text: string;
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    align?: 'left' | 'center' | 'right';
    baseline?: 'top' | 'middle' | 'bottom' | 'alphabetic';
    maxWidth?: number;
    bold?: boolean;
    italic?: boolean;
    stroke?: {
        color: string;
        width: number;
    };
    shadow?: {
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
    };
    rotation?: number;
}
interface TextParams extends Required<Omit<TextOptions, 'stroke' | 'shadow'>> {
    stroke?: {
        color: string;
        width: number;
    };
    shadow?: {
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
    };
}
type ShapeType = 'rectangle' | 'ellipse';
interface ShapeOptions {
    type: ShapeType;
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: {
        color: string;
        width: number;
    };
    rotation?: number;
}
interface ShapeParams extends Required<Omit<ShapeOptions, 'fill' | 'stroke'>> {
    fill?: string;
    stroke?: {
        color: string;
        width: number;
    };
}

type FilterType = 'grayscale' | 'sepia' | 'blur' | 'sharpen' | 'vintage' | 'invert' | 'vignette' | 'posterize' | 'pixelate' | 'edgeDetection';
interface FilterParams {
    filterType: FilterType;
    intensity?: number;
    [key: string]: any;
}

type AdjustmentType = 'brightness' | 'contrast' | 'saturation' | 'exposure' | 'temperature';
interface AdjustmentParams {
    adjustment: AdjustmentType;
    value: number;
}

type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';
interface ImageMetadata {
    createdAt: number;
    format: string;
    width?: number;
    height?: number;
}
interface ExportOptions {
    format?: ExportFormat;
    quality?: number;
}
type LicenseStatus = 'active' | 'expired' | 'disabled' | 'invalid' | 'granted' | 'revoked';
interface LicenseInfo {
    key: string;
    status: LicenseStatus;
    isValid: boolean;
    expiresAt: string | null;
    activationLimit: number | null;
    activationUsage: number;
    usageLimit: number | null;
    usage: number;
    customerEmail?: string;
    customerName?: string;
    productName?: string;
}
interface PolarLicenseKeyResponse {
    id: string;
    organization_id: string;
    customer_id: string;
    customer?: {
        id: string;
        email: string;
        name?: string;
    };
    benefit_id: string;
    key: string;
    display_key: string;
    status: 'granted' | 'revoked' | 'disabled';
    limit_activations: number | null;
    usage: number;
    limit_usage: number | null;
    validations: number;
    last_validated_at: string | null;
    expires_at: string | null;
    created_at: string;
    modified_at: string;
}
interface LicenseValidationResult {
    valid: boolean;
    error?: string;
    polarResponse?: PolarLicenseKeyResponse;
}
interface LicenseConfig {
    /** Your Polar.sh organization ID (optional - already configured in SDK) */
    organizationId?: string;
    /** Your store URL for purchasing licenses */
    storeUrl?: string;
    /** Cache duration in milliseconds (default: 24 hours) */
    cacheDuration?: number;
    /** Enable offline mode with cached validation (default: true) */
    enableCache?: boolean;
}

/**
 * Custom error class for license-related errors
 */
declare class LicenseError extends Error {
    code: string;
    constructor(message: string, code: string);
}

interface Operation {
    readonly type: OperationType;
    readonly params: OperationParams;
    apply(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void>;
    validate(): boolean;
}

declare class ArtistAPhoto {
    private state;
    private operationQueue;
    private processor;
    private constructor();
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
    static configure(config: Partial<LicenseConfig>): void;
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
    static setLicenseKey(key: string): Promise<LicenseInfo>;
    /**
     * Check if a valid license is currently active
     * @returns boolean - true if a valid license is active
     */
    static isLicenseValid(): boolean;
    /**
     * Get information about the current license
     * @returns LicenseInfo | null - License details or null if no license is set
     */
    static getLicenseInfo(): LicenseInfo | null;
    /**
     * Clear the current license (logout)
     * Removes the license from memory and cache
     */
    static clearLicense(): void;
    /**
     * Force refresh the license validation
     * Useful after renewal or to check for updates
     * @returns Promise<LicenseInfo> - Updated license information
     */
    static refreshLicense(): Promise<LicenseInfo>;
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
    static enableDevMode(): void;
    /**
     * Check if development mode is enabled
     */
    static isDevMode(): boolean;
    /**
     * Create an editor instance from an image URL
     * @param url - The URL of the image to load
     * @returns Promise<ArtistAPhoto> - Editor instance
     * @throws LicenseError if no valid license is set
     */
    static fromUrl(url: string): Promise<ArtistAPhoto>;
    /**
     * Create an editor instance from a File object
     * @param file - The File object (from file input)
     * @returns Promise<ArtistAPhoto> - Editor instance
     * @throws LicenseError if no valid license is set
     */
    static fromFile(file: File): Promise<ArtistAPhoto>;
    /**
     * Create an editor instance from an existing canvas
     * @param canvas - The HTMLCanvasElement to use
     * @returns Promise<ArtistAPhoto> - Editor instance
     * @throws LicenseError if no valid license is set
     */
    static fromCanvas(canvas: HTMLCanvasElement): Promise<ArtistAPhoto>;
    /**
     * Create an editor instance from an existing image element
     * @param img - The HTMLImageElement to use
     * @returns Promise<ArtistAPhoto> - Editor instance
     * @throws LicenseError if no valid license is set
     */
    static fromImageElement(img: HTMLImageElement): Promise<ArtistAPhoto>;
    crop(options: CropOptions): this;
    resize(width: number, height: number, options?: ResizeOptions): this;
    addText(options: TextOptions): this;
    addShape(options: ShapeOptions): this;
    filter(type: FilterType, intensity?: number): this;
    brightness(value: number): this;
    contrast(value: number): this;
    saturation(value: number): this;
    exposure(value: number): this;
    temperature(value: number): this;
    undo(): this;
    redo(): this;
    canUndo(): boolean;
    canRedo(): boolean;
    getHistory(): ReadonlyArray<Operation>;
    reset(): this;
    getOriginal(): ImageData;
    preview(): Promise<HTMLCanvasElement>;
    toCanvas(): Promise<HTMLCanvasElement>;
    toBlob(format?: ExportFormat, quality?: number): Promise<Blob>;
    toDataURL(format?: ExportFormat, quality?: number): Promise<string>;
    download(filename: string, format?: ExportFormat, quality?: number): Promise<void>;
}

declare class ArtistAPhotoError extends Error {
    constructor(message: string);
}
declare class InvalidDimensionsError extends ArtistAPhotoError {
    constructor(message?: string);
}
declare class InvalidCropError extends ArtistAPhotoError {
    constructor(message?: string);
}
declare class ImageLoadError extends ArtistAPhotoError {
    constructor(message?: string);
}
declare class ExportError extends ArtistAPhotoError {
    constructor(message?: string);
}
declare class CanvasContextError extends ArtistAPhotoError {
    constructor(message?: string);
}

interface WorkerTask {
    type: string;
    imageData: ImageData;
    params?: any;
}
interface WorkerResponse {
    result: ImageData;
    error?: string;
}
declare class WorkerPool {
    private workers;
    private availableWorkers;
    private maxWorkers;
    private workerUrl;
    constructor(maxWorkers?: number);
    private createWorker;
    private getAvailableWorker;
    private releaseWorker;
    execute<T = WorkerResponse>(task: WorkerTask): Promise<T>;
    terminate(): void;
}

declare function createEditor(source: string | File | HTMLImageElement | HTMLCanvasElement): Promise<ArtistAPhoto>;

export { type AdjustmentParams, type AdjustmentType, ArtistAPhoto, ArtistAPhotoError, CanvasContextError, type CropOptions, ExportError, type ExportFormat, type ExportOptions, type FilterParams, type FilterType, ImageLoadError, type ImageMetadata, InvalidCropError, InvalidDimensionsError, type LicenseConfig, LicenseError, type LicenseInfo, type LicenseStatus, type LicenseValidationResult, type OperationType, type ResizeOptions, type ShapeOptions, type ShapeParams, type ShapeType, type TextOptions, type TextParams, WorkerPool, type WorkerResponse, type WorkerTask, createEditor };
