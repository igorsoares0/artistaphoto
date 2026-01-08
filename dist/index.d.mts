type OperationType = 'crop' | 'resize' | 'filter' | 'adjustment';
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
    static fromUrl(url: string): Promise<ArtistAPhoto>;
    static fromFile(file: File): Promise<ArtistAPhoto>;
    static fromCanvas(canvas: HTMLCanvasElement): Promise<ArtistAPhoto>;
    static fromImageElement(img: HTMLImageElement): Promise<ArtistAPhoto>;
    crop(options: CropOptions): this;
    resize(width: number, height: number, options?: ResizeOptions): this;
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

export { type AdjustmentParams, type AdjustmentType, ArtistAPhoto, ArtistAPhotoError, CanvasContextError, type CropOptions, ExportError, type ExportFormat, type ExportOptions, type FilterParams, type FilterType, ImageLoadError, type ImageMetadata, InvalidCropError, InvalidDimensionsError, type OperationType, type ResizeOptions, WorkerPool, type WorkerResponse, type WorkerTask, createEditor };
