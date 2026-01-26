# ArtistAPhoto Documentation

Complete documentation for the ArtistAPhoto image editing SDK.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Licensing](#licensing)
4. [Core Concepts](#core-concepts)
5. [Loading Images](#loading-images)
6. [Transformations](#transformations)
7. [Filters](#filters)
8. [Adjustments](#adjustments)
9. [Text & Shapes](#text--shapes)
10. [Undo/Redo](#undoredo)
11. [Exporting](#exporting)
12. [Error Handling](#error-handling)
13. [TypeScript](#typescript)
14. [Performance](#performance)
15. [Browser Support](#browser-support)
16. [FAQ](#faq)
17. [Troubleshooting](#troubleshooting)

---

## Getting Started

ArtistAPhoto is a powerful browser-based image editing SDK that provides a complete toolkit for image manipulation. With support for filters, adjustments, transformations, text overlays, shapes, and full undo/redo functionality, it's designed to integrate seamlessly into any web application.

### Key Features

- **10 Professional Filters** - Grayscale, sepia, blur, sharpen, vintage, invert, vignette, posterize, pixelate, edge detection
- **5 Image Adjustments** - Brightness, contrast, saturation, exposure, temperature
- **Transformations** - Crop, resize with quality control
- **Overlays** - Text with full styling, shapes (rectangles, ellipses)
- **Non-destructive Editing** - Original image preserved, full undo/redo
- **High Performance** - Web Workers for heavy operations
- **TypeScript Ready** - Full type definitions included
- **Multiple Export Formats** - JPEG, PNG, WebP

### Quick Example

```typescript
import { ArtistAPhoto } from 'artistaphoto';

// Load an image
const editor = await ArtistAPhoto.fromFile(file);

// Apply edits
editor
  .crop({ x: 50, y: 50, width: 400, height: 400 })
  .filter('vintage', 0.8)
  .brightness(10)
  .resize(800, 600);

// Download result
await editor.download('edited-photo.jpg', 'image/jpeg', 0.9);
```

---

## Installation

### npm

```bash
npm install artistaphoto
```

### yarn

```bash
yarn add artistaphoto
```

### pnpm

```bash
pnpm add artistaphoto
```

### CDN (Browser)

```html
<script src="https://unpkg.com/artistaphoto/dist/index.global.js"></script>
<script>
  const { ArtistAPhoto } = window.artistaphoto;
</script>
```

### ES Module Import

```typescript
import { ArtistAPhoto } from 'artistaphoto';
```

### CommonJS

```javascript
const { ArtistAPhoto } = require('artistaphoto');
```

---

## Licensing

ArtistAPhoto is a commercial SDK with a free trial mode.

### Trial Mode (No License)

Without a license key, the SDK operates in trial mode:

| Feature | Trial Mode |
|---------|-----------|
| All editing features | ✅ Available |
| Preview (toCanvas) | ✅ No watermark |
| Export (toBlob, toDataURL, download) | ⚠️ **With watermark** |

The watermark displays "ArtistAPhoto - UNLICENSED" diagonally across exported images.

### Licensed Mode

With a valid license key:

| Feature | Licensed Mode |
|---------|--------------|
| All editing features | ✅ Available |
| Preview | ✅ No watermark |
| Export | ✅ **No watermark** |

### Purchasing a License

Visit [polar.sh/artistaphoto](https://polar.sh/artistaphoto) to purchase a license.

### Activating Your License

```typescript
import { ArtistAPhoto, LicenseError } from 'artistaphoto';

async function activateLicense() {
  try {
    const licenseInfo = await ArtistAPhoto.setLicenseKey('YOUR-LICENSE-KEY');
    console.log('License activated!', licenseInfo);
  } catch (error) {
    if (error instanceof LicenseError) {
      console.error('License error:', error.code, error.message);
    }
  }
}
```

### Using Environment Variables (Recommended)

```typescript
// .env
ARTISTAPHOTO_LICENSE_KEY=YOUR-LICENSE-KEY

// Your code
await ArtistAPhoto.setLicenseKey(process.env.ARTISTAPHOTO_LICENSE_KEY);
```

### License Configuration

```typescript
ArtistAPhoto.configure({
  cacheDuration: 24 * 60 * 60 * 1000, // Cache duration in ms (default: 24 hours)
  enableCache: true                    // Enable local caching (default: true)
});
```

### License Methods

| Method | Description |
|--------|-------------|
| `setLicenseKey(key)` | Activate a license key |
| `isLicenseValid()` | Check if license is valid |
| `getLicenseInfo()` | Get license details |
| `clearLicense()` | Deactivate license (returns to trial) |
| `refreshLicense()` | Force re-validation |

### License Info Object

```typescript
interface LicenseInfo {
  key: string;
  status: 'active' | 'expired' | 'revoked' | 'disabled';
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
```

---

## Core Concepts

### Fluent API

ArtistAPhoto uses a fluent (chainable) API pattern. Most methods return `this`, allowing you to chain operations:

```typescript
editor
  .crop({ x: 0, y: 0, width: 500, height: 500 })
  .filter('grayscale')
  .brightness(20)
  .resize(400, 400);
```

### Non-Destructive Editing

All edits are stored as operations in a queue. The original image is never modified, allowing you to:

- Undo/redo any operation
- Reset to the original image at any time
- Preview changes before exporting

### Operation Queue

Operations are applied in order when you call `preview()`, `toCanvas()`, `toBlob()`, `toDataURL()`, or `download()`.

```typescript
// Operations are queued, not immediately applied
editor.brightness(20);  // Queued
editor.contrast(10);    // Queued

// Operations applied when rendering
const canvas = await editor.preview();
```

---

## Loading Images

ArtistAPhoto provides multiple ways to load images.

### From URL

```typescript
const editor = await ArtistAPhoto.fromUrl('https://example.com/image.jpg');
```

> **Note:** The image URL must be CORS-enabled or same-origin.

### From File Input

```typescript
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const editor = await ArtistAPhoto.fromFile(file);
});
```

### From Canvas Element

```typescript
const canvas = document.getElementById('myCanvas');
const editor = await ArtistAPhoto.fromCanvas(canvas);
```

### From Image Element

```typescript
const img = document.getElementById('myImage');
const editor = await ArtistAPhoto.fromImageElement(img);
```

### Getting Original Image Data

```typescript
const originalImageData = editor.getOriginal();
console.log('Original size:', originalImageData.width, 'x', originalImageData.height);
```

---

## Transformations

### Crop

Extract a rectangular region from the image.

```typescript
editor.crop({
  x: number,      // Left position (required)
  y: number,      // Top position (required)
  width: number,  // Crop width (required)
  height: number  // Crop height (required)
});
```

**Example:**

```typescript
// Crop a 300x300 region starting at position (50, 50)
editor.crop({ x: 50, y: 50, width: 300, height: 300 });
```

**Validation:**
- `x` and `y` must be >= 0
- `width` and `height` must be > 0
- Crop region must not exceed image bounds

### Resize

Scale the image to new dimensions.

```typescript
editor.resize(
  width: number,   // Target width (required)
  height: number,  // Target height (required)
  options?: {
    quality?: 'low' | 'medium' | 'high',  // Default: 'medium'
    maintainAspectRatio?: boolean          // Default: false
  }
);
```

**Examples:**

```typescript
// Simple resize
editor.resize(800, 600);

// High-quality resize maintaining aspect ratio
editor.resize(800, 600, {
  quality: 'high',
  maintainAspectRatio: true
});
```

**Quality Levels:**
- `low` - Fastest, suitable for thumbnails
- `medium` - Balanced quality and speed
- `high` - Best quality, uses multi-step algorithm

---

## Filters

Apply visual filters to the image. All filters accept an intensity parameter (0 to 1).

```typescript
editor.filter(type: FilterType, intensity?: number);
```

### Available Filters

| Filter | Description | Default Intensity |
|--------|-------------|-------------------|
| `grayscale` | Convert to black and white | 1.0 |
| `sepia` | Warm, vintage brown tones | 1.0 |
| `blur` | Gaussian blur effect | 1.0 |
| `sharpen` | Enhance edges and details | 1.0 |
| `vintage` | Retro look with vignette | 1.0 |
| `invert` | Negative/inverted colors | 1.0 |
| `vignette` | Darkened edges | 1.0 |
| `posterize` | Reduce color levels | 1.0 |
| `pixelate` | Pixelated/mosaic effect | 1.0 |
| `edgeDetection` | Sobel edge detection | 1.0 |

### Examples

```typescript
// Full intensity grayscale
editor.filter('grayscale');

// 50% sepia effect
editor.filter('sepia', 0.5);

// Light blur
editor.filter('blur', 0.3);

// Strong sharpening
editor.filter('sharpen', 0.9);

// Combine multiple filters
editor
  .filter('vintage', 0.7)
  .filter('vignette', 0.5);
```

### Filter Intensity Guide

| Intensity | Effect |
|-----------|--------|
| 0.0 | No effect |
| 0.1 - 0.3 | Subtle |
| 0.4 - 0.6 | Moderate |
| 0.7 - 0.9 | Strong |
| 1.0 | Full effect |

---

## Adjustments

Fine-tune image properties. All adjustments accept values from -100 to 100.

### Brightness

Adjust overall lightness.

```typescript
editor.brightness(value: number); // -100 to 100
```

| Value | Effect |
|-------|--------|
| -100 | Completely dark |
| 0 | No change |
| 100 | Completely bright |

### Contrast

Adjust the difference between light and dark areas.

```typescript
editor.contrast(value: number); // -100 to 100
```

| Value | Effect |
|-------|--------|
| -100 | Flat, gray image |
| 0 | No change |
| 100 | Maximum contrast |

### Saturation

Adjust color intensity.

```typescript
editor.saturation(value: number); // -100 to 100
```

| Value | Effect |
|-------|--------|
| -100 | Grayscale |
| 0 | No change |
| 100 | Vivid colors |

### Exposure

Simulate camera exposure adjustment.

```typescript
editor.exposure(value: number); // -100 to 100
```

| Value | Effect |
|-------|--------|
| -100 | Underexposed (dark) |
| 0 | No change |
| 100 | Overexposed (bright) |

### Temperature

Adjust color temperature (warm/cool).

```typescript
editor.temperature(value: number); // -100 to 100
```

| Value | Effect |
|-------|--------|
| -100 | Cool (blue tint) |
| 0 | No change |
| 100 | Warm (orange tint) |

### Combined Example

```typescript
// Portrait enhancement
editor
  .brightness(5)
  .contrast(10)
  .saturation(-5)
  .temperature(10);
```

---

## Text & Shapes

### Adding Text

Add text overlays with full styling options.

```typescript
editor.addText({
  // Required
  text: string,
  x: number,
  y: number,

  // Optional styling
  fontSize?: number,        // Default: 24
  fontFamily?: string,      // Default: 'Arial'
  color?: string,           // Default: '#000000'
  bold?: boolean,           // Default: false
  italic?: boolean,         // Default: false
  align?: 'left' | 'center' | 'right',      // Default: 'left'
  baseline?: 'top' | 'middle' | 'bottom',   // Default: 'alphabetic'
  maxWidth?: number,        // Maximum width before wrapping
  rotation?: number,        // Rotation in degrees

  // Optional stroke (outline)
  stroke?: {
    color: string,
    width: number
  },

  // Optional shadow
  shadow?: {
    color: string,
    blur: number,
    offsetX: number,
    offsetY: number
  }
});
```

**Examples:**

```typescript
// Simple text
editor.addText({
  text: 'Hello World',
  x: 100,
  y: 100
});

// Styled text
editor.addText({
  text: 'ArtistAPhoto',
  x: 200,
  y: 150,
  fontSize: 48,
  fontFamily: 'Georgia',
  color: '#FF0000',
  bold: true,
  italic: true
});

// Text with stroke and shadow
editor.addText({
  text: 'WATERMARK',
  x: 300,
  y: 200,
  fontSize: 36,
  color: '#FFFFFF',
  stroke: {
    color: '#000000',
    width: 2
  },
  shadow: {
    color: 'rgba(0, 0, 0, 0.5)',
    blur: 4,
    offsetX: 2,
    offsetY: 2
  }
});

// Rotated text
editor.addText({
  text: 'SAMPLE',
  x: 250,
  y: 250,
  fontSize: 32,
  color: 'rgba(255, 0, 0, 0.5)',
  rotation: -45
});
```

### Adding Shapes

Add geometric shapes to the image.

```typescript
editor.addShape({
  // Required
  type: 'rectangle' | 'ellipse',
  x: number,
  y: number,
  width: number,
  height: number,

  // Optional styling
  fill?: string,            // Fill color (default: transparent)
  rotation?: number,        // Rotation in degrees

  // Optional stroke (outline)
  stroke?: {
    color: string,
    width: number
  }
});
```

**Examples:**

```typescript
// Filled rectangle
editor.addShape({
  type: 'rectangle',
  x: 50,
  y: 50,
  width: 200,
  height: 100,
  fill: '#FF0000'
});

// Circle (ellipse with equal width/height)
editor.addShape({
  type: 'ellipse',
  x: 150,
  y: 150,
  width: 100,
  height: 100,
  fill: '#00FF00'
});

// Rectangle with stroke only (no fill)
editor.addShape({
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 150,
  height: 80,
  stroke: {
    color: '#0000FF',
    width: 3
  }
});

// Rotated ellipse with fill and stroke
editor.addShape({
  type: 'ellipse',
  x: 200,
  y: 200,
  width: 150,
  height: 80,
  fill: 'rgba(255, 255, 0, 0.5)',
  stroke: {
    color: '#000000',
    width: 2
  },
  rotation: 30
});
```

---

## Undo/Redo

ArtistAPhoto maintains a complete history of operations, allowing full undo/redo support.

### Undo

Revert the last operation.

```typescript
editor.undo();
```

### Redo

Re-apply a previously undone operation.

```typescript
editor.redo();
```

### Check Availability

```typescript
if (editor.canUndo()) {
  editor.undo();
}

if (editor.canRedo()) {
  editor.redo();
}
```

### Reset

Remove all operations and return to the original image.

```typescript
editor.reset();
```

### Get History

Access the complete operation history.

```typescript
const history = editor.getHistory();
console.log('Operations:', history.length);
```

### Example Workflow

```typescript
const editor = await ArtistAPhoto.fromUrl('/image.jpg');

// Apply operations
editor
  .brightness(20)
  .contrast(10)
  .filter('sepia', 0.5);

console.log(editor.canUndo()); // true
console.log(editor.canRedo()); // false

// Undo last two operations
editor.undo(); // Removes sepia
editor.undo(); // Removes contrast

console.log(editor.canRedo()); // true

// Redo one operation
editor.redo(); // Re-applies contrast

// New operation clears redo history
editor.saturation(15);

console.log(editor.canRedo()); // false
```

---

## Exporting

Export the edited image in various formats.

### Preview (Canvas)

Get a canvas element with the current edits applied. Useful for displaying previews.

```typescript
const canvas = await editor.preview();
document.body.appendChild(canvas);
```

> **Note:** Preview never includes watermark, even in trial mode.

### To Canvas

Alias for `preview()`.

```typescript
const canvas = await editor.toCanvas();
```

### To Blob

Export as a Blob object. Useful for uploading to servers.

```typescript
const blob = await editor.toBlob(
  format?: 'image/jpeg' | 'image/png' | 'image/webp',  // Default: 'image/png'
  quality?: number  // 0-1 for JPEG/WebP (default: 0.92)
);

// Upload example
const formData = new FormData();
formData.append('image', blob, 'edited.jpg');
await fetch('/upload', { method: 'POST', body: formData });
```

### To Data URL

Export as a base64 data URL. Useful for displaying in `<img>` tags.

```typescript
const dataURL = await editor.toDataURL(
  format?: 'image/jpeg' | 'image/png' | 'image/webp',
  quality?: number
);

document.getElementById('result').src = dataURL;
```

### Download

Trigger a browser download.

```typescript
await editor.download(
  filename: string,
  format?: 'image/jpeg' | 'image/png' | 'image/webp',
  quality?: number
);
```

**Examples:**

```typescript
// Download as JPEG with 90% quality
await editor.download('my-photo.jpg', 'image/jpeg', 0.9);

// Download as PNG (lossless)
await editor.download('my-photo.png', 'image/png');

// Download as WebP with 85% quality
await editor.download('my-photo.webp', 'image/webp', 0.85);
```

### Format Comparison

| Format | Compression | Transparency | Best For |
|--------|-------------|--------------|----------|
| JPEG | Lossy | No | Photos |
| PNG | Lossless | Yes | Graphics, screenshots |
| WebP | Both | Yes | Web (smaller files) |

### Quality Guide

| Quality | File Size | Use Case |
|---------|-----------|----------|
| 0.5 - 0.7 | Small | Thumbnails, previews |
| 0.8 - 0.9 | Medium | Web display |
| 0.95 - 1.0 | Large | Print, archival |

---

## Error Handling

ArtistAPhoto provides specific error types for different failure scenarios.

### Error Types

```typescript
import {
  ArtistAPhoto,
  LicenseError,
  ImageLoadError,
  InvalidCropError,
  InvalidDimensionsError
} from 'artistaphoto';
```

### LicenseError

Thrown when license validation fails.

```typescript
try {
  await ArtistAPhoto.setLicenseKey('invalid-key');
} catch (error) {
  if (error instanceof LicenseError) {
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}
```

**Error Codes:**

| Code | Description |
|------|-------------|
| `INVALID_KEY` | License key not found or invalid format |
| `LICENSE_EXPIRED` | License has expired |
| `LICENSE_REVOKED` | License was revoked |
| `LICENSE_DISABLED` | License was disabled |
| `NO_LICENSE` | No license key set (when calling refresh) |

### ImageLoadError

Thrown when image loading fails.

```typescript
try {
  const editor = await ArtistAPhoto.fromUrl('https://invalid-url.com/image.jpg');
} catch (error) {
  if (error instanceof ImageLoadError) {
    console.error('Failed to load image:', error.message);
  }
}
```

**Common Causes:**
- Invalid URL
- CORS restrictions
- Network error
- Unsupported image format

### InvalidCropError

Thrown when crop parameters are invalid.

```typescript
try {
  editor.crop({ x: -10, y: 0, width: 100, height: 100 });
} catch (error) {
  if (error instanceof InvalidCropError) {
    console.error('Invalid crop:', error.message);
  }
}
```

### InvalidDimensionsError

Thrown when resize dimensions are invalid.

```typescript
try {
  editor.resize(0, 100);
} catch (error) {
  if (error instanceof InvalidDimensionsError) {
    console.error('Invalid dimensions:', error.message);
  }
}
```

### General Error Handling Pattern

```typescript
import {
  ArtistAPhoto,
  LicenseError,
  ImageLoadError
} from 'artistaphoto';

async function editImage(file) {
  try {
    // Activate license
    await ArtistAPhoto.setLicenseKey(process.env.LICENSE_KEY);

    // Load and edit
    const editor = await ArtistAPhoto.fromFile(file);
    editor.filter('vintage').brightness(10);

    // Export
    return await editor.toBlob('image/jpeg', 0.9);

  } catch (error) {
    if (error instanceof LicenseError) {
      // Handle license issues
      console.error('License problem:', error.code);
      // Fallback: continue without license (with watermark)

    } else if (error instanceof ImageLoadError) {
      // Handle image loading issues
      console.error('Could not load image');

    } else {
      // Handle unexpected errors
      console.error('Unexpected error:', error);
    }
  }
}
```

---

## TypeScript

ArtistAPhoto is written in TypeScript and includes full type definitions.

### Importing Types

```typescript
import {
  ArtistAPhoto,

  // Error types
  LicenseError,
  ImageLoadError,
  InvalidCropError,
  InvalidDimensionsError,

  // Option types
  FilterType,
  ExportFormat,
  CropOptions,
  ResizeOptions,
  TextOptions,
  ShapeOptions,

  // Info types
  LicenseInfo,
  LicenseConfig
} from 'artistaphoto';
```

### Type Definitions

```typescript
// Filter types
type FilterType =
  | 'grayscale'
  | 'sepia'
  | 'blur'
  | 'sharpen'
  | 'vintage'
  | 'invert'
  | 'vignette'
  | 'posterize'
  | 'pixelate'
  | 'edgeDetection';

// Export formats
type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';

// Crop options
interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Resize options
interface ResizeOptions {
  quality?: 'low' | 'medium' | 'high';
  maintainAspectRatio?: boolean;
}

// Text options
interface TextOptions {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  baseline?: 'top' | 'middle' | 'bottom' | 'alphabetic';
  maxWidth?: number;
  rotation?: number;
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

// Shape options
interface ShapeOptions {
  type: 'rectangle' | 'ellipse';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  rotation?: number;
  stroke?: {
    color: string;
    width: number;
  };
}
```

### Typed Example

```typescript
import {
  ArtistAPhoto,
  FilterType,
  ExportFormat,
  CropOptions
} from 'artistaphoto';

async function processImage(file: File): Promise<Blob> {
  const editor = await ArtistAPhoto.fromFile(file);

  const cropOptions: CropOptions = {
    x: 0,
    y: 0,
    width: 500,
    height: 500
  };

  const filter: FilterType = 'vintage';
  const format: ExportFormat = 'image/jpeg';

  editor
    .crop(cropOptions)
    .filter(filter, 0.8);

  return editor.toBlob(format, 0.9);
}
```

---

## Performance

ArtistAPhoto is optimized for performance in browser environments.

### Web Workers

Heavy operations automatically use Web Workers to avoid blocking the main thread:

- Blur filter
- Sharpen filter
- Edge detection filter
- Pixelate filter

This keeps the UI responsive even when processing large images.

### Best Practices

**1. Process at display size, not original size**

```typescript
// Instead of processing a 4000x3000 image
// Resize first if you only need a smaller output
editor
  .resize(1200, 900)
  .filter('blur', 0.5);  // Much faster on smaller image
```

**2. Chain operations before rendering**

```typescript
// Good: Single render at the end
editor
  .brightness(10)
  .contrast(5)
  .filter('vintage');
const result = await editor.toBlob();

// Avoid: Multiple renders
const preview1 = await editor.brightness(10).preview();
const preview2 = await editor.contrast(5).preview();  // Re-renders everything
```

**3. Use appropriate quality settings**

```typescript
// Thumbnails: low quality resize, high compression
editor.resize(200, 200, { quality: 'low' });
await editor.toBlob('image/jpeg', 0.6);

// Final output: high quality
editor.resize(1200, 900, { quality: 'high' });
await editor.toBlob('image/jpeg', 0.9);
```

**4. Preview vs Export**

Use `preview()` for displaying intermediate results (no watermark check, faster).
Use `toBlob()`/`toDataURL()` only for final export.

---

## Browser Support

### Supported Browsers

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Edge | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |

### Required APIs

- Canvas API
- ES2020
- Fetch API (for URL loading)
- Blob API (for export)

### Optional APIs

- Web Workers (enhanced performance)
- localStorage (license caching)

### Checking Support

```typescript
function checkSupport(): boolean {
  return !!(
    window.HTMLCanvasElement &&
    window.Blob &&
    window.fetch
  );
}
```

---

## FAQ

### Can I use ArtistAPhoto without a license?

Yes! The SDK works fully without a license. The only limitation is that exported images will have a watermark. This is perfect for:
- Evaluation and testing
- Development
- Non-commercial projects (with watermark attribution)

### How does the watermark look?

The watermark displays "ArtistAPhoto - UNLICENSED" in a diagonal pattern across the entire image. It's semi-transparent (30% opacity) gray text.

### Is the license a subscription?

License terms are available at [polar.sh/artistaphoto](https://polar.sh/artistaphoto). Check the current offerings for subscription vs. one-time purchase options.

### Can I use ArtistAPhoto on the server (Node.js)?

ArtistAPhoto is designed for browser environments and requires Canvas API. For Node.js, you would need to use a Canvas implementation like `node-canvas` or `jsdom`. This is not officially supported but may work.

### Does ArtistAPhoto modify the original image?

No. ArtistAPhoto uses non-destructive editing. The original image is preserved, and all edits are stored as operations. You can always call `reset()` to return to the original.

### How large images can ArtistAPhoto handle?

This depends on the browser and device memory. Generally:
- Up to 4000x4000 pixels works well on desktop
- Up to 2000x2000 pixels on mobile devices
- For very large images, consider resizing before editing

### Can I save/load edit sessions?

Currently, there's no built-in session persistence. The operation history is stored in memory. You could implement your own persistence by serializing `getHistory()` results.

---

## Troubleshooting

### Image won't load from URL

**Problem:** `ImageLoadError` when loading from URL.

**Solutions:**
1. Check if the URL is accessible
2. Verify CORS headers on the server
3. Try loading from same origin
4. Use `fromFile()` instead with a file input

```typescript
// If CORS is an issue, proxy through your server
const response = await fetch('/api/proxy-image?url=' + encodeURIComponent(imageUrl));
const blob = await response.blob();
const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
const editor = await ArtistAPhoto.fromFile(file);
```

### License validation fails

**Problem:** `LicenseError` with code `INVALID_KEY`.

**Solutions:**
1. Double-check the license key for typos
2. Ensure the key hasn't expired
3. Check network connectivity
4. Try `refreshLicense()` to force re-validation

### Export quality is poor

**Problem:** Exported image looks blurry or has artifacts.

**Solutions:**
1. Use higher quality setting: `toBlob('image/jpeg', 0.95)`
2. Use PNG for lossless: `toBlob('image/png')`
3. Avoid multiple resize operations
4. Use `quality: 'high'` for resize

### Memory issues with large images

**Problem:** Browser becomes slow or crashes with large images.

**Solutions:**
1. Resize the image early in the pipeline
2. Process in smaller batches
3. Use `reset()` to clear operations you no longer need
4. Avoid keeping multiple editor instances

### Filters are slow

**Problem:** Certain filters (blur, sharpen) take a long time.

**Solutions:**
1. Resize image to smaller dimensions first
2. Use lower intensity values
3. Ensure Web Workers are supported (check console for errors)
4. Avoid applying heavy filters multiple times

### Watermark appears even with license

**Problem:** Exports have watermark despite valid license.

**Solutions:**
1. Verify `isLicenseValid()` returns `true`
2. Ensure `setLicenseKey()` completed successfully before export
3. Check `getLicenseInfo()` for expiration
4. Try `refreshLicense()` to update cached license

---

## Support

- **Documentation:** You're reading it!
- **Issues:** [GitHub Issues](https://github.com/user/artistaphoto/issues)
- **Purchase:** [polar.sh/artistaphoto](https://polar.sh/artistaphoto)

---

*Last updated: January 2025*
