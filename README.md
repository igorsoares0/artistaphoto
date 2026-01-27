# ArtistAPhoto

[![npm version](https://img.shields.io/npm/v/artistaphoto.svg)](https://www.npmjs.com/package/artistaphoto)
[![License: Commercial](https://img.shields.io/badge/license-Commercial-blue.svg)](https://polar.sh/artistaphoto)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Powerful browser-based image editing SDK with filters, adjustments, crop, resize, text, shapes, and undo/redo support.**

<!-- TODO: Add demo GIF here -->
<!-- ![ArtistAPhoto Demo](demo.gif) -->

## Installation

```bash
npm install artistaphoto
```

## License

> **Commercial SDK** - Free to try, license required for production.

| Mode | Features | Export |
|------|----------|--------|
| **Trial** (no license) | All features | With watermark |
| **Licensed** | All features | Clean, no watermark |

Purchase a license at [artistasdk.com](https://artistasdk.com)

## Quick Start

```typescript
import { ArtistAPhoto } from 'artistaphoto';

// Load image (works without license - exports will have watermark)
const editor = await ArtistAPhoto.fromFile(file);

// Edit with chainable API
editor
  .crop({ x: 50, y: 50, width: 400, height: 400 })
  .filter('vintage', 0.8)
  .brightness(10)
  .addText({ text: 'Hello!', x: 100, y: 50, fontSize: 32, color: '#fff' })
  .resize(800, 600);

// Export
await editor.download('edited.jpg', 'image/jpeg', 0.9);
```

### Activate License (removes watermark)

```typescript
await ArtistAPhoto.setLicenseKey('YOUR-LICENSE-KEY');
```

## Features

### Transformations
- **Crop** - Custom region cropping
- **Resize** - High-quality scaling with aspect ratio control
- **Text** - Custom fonts, colors, shadows, stroke, rotation
- **Shapes** - Rectangles & ellipses with fill and stroke

### Filters
`grayscale` · `sepia` · `blur` · `sharpen` · `vintage` · `invert` · `vignette` · `posterize` · `pixelate` · `edgeDetection`

### Adjustments
`brightness` · `contrast` · `saturation` · `exposure` · `temperature`

### Core
- Fluent API with method chaining
- Full undo/redo support
- Non-destructive editing
- Web Workers for heavy operations
- Export to JPEG, PNG, WebP
- Full TypeScript support

## API Reference

### Loading Images

```typescript
const editor = await ArtistAPhoto.fromUrl('https://example.com/image.jpg');
const editor = await ArtistAPhoto.fromFile(fileInput.files[0]);
const editor = await ArtistAPhoto.fromCanvas(canvasElement);
const editor = await ArtistAPhoto.fromImageElement(imgElement);
```

### Transformations

```typescript
editor.crop({ x: 0, y: 0, width: 300, height: 300 });
editor.resize(800, 600, { quality: 'high', maintainAspectRatio: true });

editor.addText({
  text: 'Hello',
  x: 100, y: 100,
  fontSize: 32,
  fontFamily: 'Arial',
  color: '#000',
  bold: true,
  italic: false,
  rotation: 15,
  stroke: { color: '#fff', width: 2 },
  shadow: { color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 }
});

editor.addShape({
  type: 'rectangle', // or 'ellipse'
  x: 50, y: 50,
  width: 200, height: 100,
  fill: '#ff0000',
  stroke: { color: '#000', width: 2 },
  rotation: 45
});
```

### Filters & Adjustments

```typescript
// Filters (intensity: 0-1)
editor.filter('grayscale', 1.0);
editor.filter('sepia', 0.7);
editor.filter('blur', 0.5);

// Adjustments (-100 to 100)
editor.brightness(20);
editor.contrast(15);
editor.saturation(-10);
editor.exposure(5);
editor.temperature(15);
```

### Undo/Redo

```typescript
editor.undo();
editor.redo();
editor.canUndo(); // boolean
editor.canRedo(); // boolean
editor.reset();   // back to original
```

### Export

```typescript
const canvas = await editor.toCanvas();
const blob = await editor.toBlob('image/jpeg', 0.9);
const dataURL = await editor.toDataURL('image/png');
await editor.download('image.jpg', 'image/jpeg', 0.9);
```

### License Management

```typescript
await ArtistAPhoto.setLicenseKey('YOUR-KEY');  // Activate
ArtistAPhoto.isLicenseValid();                  // Check status
ArtistAPhoto.getLicenseInfo();                  // Get details
ArtistAPhoto.clearLicense();                    // Deactivate
await ArtistAPhoto.refreshLicense();            // Force refresh
```

## Error Handling

```typescript
import { ArtistAPhoto, LicenseError, ImageLoadError } from 'artistaphoto';

try {
  await ArtistAPhoto.setLicenseKey('invalid-key');
} catch (error) {
  if (error instanceof LicenseError) {
    console.error(error.code, error.message);
  }
}
```

## Browser Support

Chrome, Edge, Firefox, Safari (last 2 versions)

Requires: Canvas API, ES2020, Web Workers (optional)

## License

Commercial License - [Purchase here](https://artistasdk.com)

---

**[Full Documentation](https://github.com/user/artistaphoto#readme)** · **[Report Issue](https://github.com/user/artistaphoto/issues)** · **[Purchase License](https://artistasdk.com)**
