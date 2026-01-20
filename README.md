# ArtistAPhoto

Um SDK TypeScript poderoso para edição de imagens no browser com suporte a filtros, ajustes, crop, resize, undo/redo e Web Workers para performance otimizada.

## Características

### Operações de Transformação
- **Crop**: Recortar imagens com dimensões personalizadas
- **Resize**: Redimensionar imagens com controle de qualidade
- **Add Text**: Adicionar texto personalizado com fontes, cores, sombras e contornos
- **Add Shapes**: Adicionar formas geométricas (retângulo e elipse) com preenchimento e contorno

### 10 Filtros Disponíveis
- **Grayscale**: Conversão para tons de cinza
- **Sepia**: Efeito sépia vintage
- **Blur**: Desfoque gaussiano
- **Sharpen**: Nitidez aprimorada
- **Vintage**: Efeito vintage com vinheta
- **Invert**: Inversão de cores
- **Vignette**: Escurecimento nas bordas
- **Posterize**: Redução de cores
- **Pixelate**: Efeito pixelado
- **Edge Detection**: Detecção de bordas (Sobel)

### 5 Ajustes de Imagem
- **Brightness**: Brilho (-100 a 100)
- **Contrast**: Contraste (-100 a 100)
- **Saturation**: Saturação (-100 a 100)
- **Exposure**: Exposição (-100 a 100)
- **Temperature**: Temperatura de cor (-100 a 100)

### Recursos Avançados
- ✅ **Fluent API** com method chaining
- ✅ **Undo/Redo** completo
- ✅ **Edição não-destrutiva** (preserva imagem original)
- ✅ **Web Workers** para operações pesadas
- ✅ **TypeScript** com tipos completos
- ✅ **Export** em múltiplos formatos (JPEG, PNG, WebP)

## Instalação

```bash
npm install artistaphoto
```

## Ativação de Licença

O ArtistAPhoto SDK requer uma licença válida para funcionar. Você pode adquirir uma licença em [polar.sh/artistaphoto](https://polar.sh/artistaphoto).

```typescript
import { ArtistAPhoto, LicenseError } from 'artistaphoto';

// Ativar licença (faça isso uma vez quando seu app iniciar)
try {
  await ArtistAPhoto.setLicenseKey('SUA-LICENSE-KEY-AQUI');
  console.log('License activated successfully!');
} catch (error) {
  if (error instanceof LicenseError) {
    console.error('License error:', error.code, error.message);
  }
}

// Agora você pode usar o SDK normalmente
const editor = await ArtistAPhoto.fromUrl('/image.jpg');
```

### Usando Variáveis de Ambiente (Recomendado)

```typescript
// .env
ARTISTAPHOTO_LICENSE_KEY=SUA-LICENSE-KEY-AQUI

// Seu código
await ArtistAPhoto.setLicenseKey(process.env.ARTISTAPHOTO_LICENSE_KEY);
```

### Configuração Opcional

```typescript
// Opcionalmente, você pode configurar cache e outras opções
ArtistAPhoto.configure({
  cacheDuration: 24 * 60 * 60 * 1000, // Cache por 24 horas (padrão)
  enableCache: true                    // Habilitar cache local (padrão)
});
```

### Métodos de Licença Disponíveis

```typescript
// Verificar se a licença é válida
if (ArtistAPhoto.isLicenseValid()) {
  // SDK está pronto para uso
}

// Obter informações da licença
const info = ArtistAPhoto.getLicenseInfo();
console.log(info?.expiresAt, info?.activationUsage);

// Forçar revalidação da licença
await ArtistAPhoto.refreshLicense();

// Limpar licença (logout)
ArtistAPhoto.clearLicense();
```

## Uso Básico

```typescript
import { ArtistAPhoto } from 'artistaphoto';

// Ativar licença primeiro
await ArtistAPhoto.setLicenseKey('SUA-LICENSE-KEY-AQUI');

// Carregar imagem
const editor = await ArtistAPhoto.fromUrl('/path/to/image.jpg');

// Aplicar operações com method chaining
await editor
  .crop({ x: 100, y: 100, width: 500, height: 500 })
  .filter('vintage', 0.7)
  .brightness(20)
  .saturation(-10)
  .filter('vignette', 0.5)
  .resize(800, 600)
  .toBlob('image/jpeg', 0.9);

// Ou baixar diretamente
await editor.download('edited-image.jpg', 'image/jpeg');
```

## API

### Factory Methods

```typescript
// Carregar de URL
const editor = await ArtistAPhoto.fromUrl('https://example.com/image.jpg');

// Carregar de File
const editor = await ArtistAPhoto.fromFile(fileInput.files[0]);

// Carregar de Canvas
const editor = await ArtistAPhoto.fromCanvas(canvasElement);

// Carregar de Image Element
const editor = await ArtistAPhoto.fromImageElement(imgElement);
```

### Operações de Transformação

```typescript
// Crop
editor.crop({ x: 0, y: 0, width: 300, height: 300 });

// Resize
editor.resize(800, 600, { quality: 'high', maintainAspectRatio: true });

// Adicionar Texto Simples
editor.addText({
  text: 'Hello World',
  x: 100,
  y: 100,
  fontSize: 32,
  color: '#000000'
});

// Adicionar Texto com Estilos
editor.addText({
  text: 'ArtistAPhoto',
  x: 200,
  y: 150,
  fontSize: 48,
  fontFamily: 'Arial',
  color: '#FF0000',
  bold: true,
  italic: false,
  stroke: {
    color: '#FFFFFF',
    width: 2
  },
  shadow: {
    color: 'rgba(0, 0, 0, 0.5)',
    blur: 4,
    offsetX: 2,
    offsetY: 2
  },
  rotation: 15 // Rotação em graus
});

// Adicionar Shape - Retângulo
editor.addShape({
  type: 'rectangle',
  x: 50,
  y: 50,
  width: 200,
  height: 100,
  fill: '#FF0000'
});

// Adicionar Shape - Elipse com Contorno
editor.addShape({
  type: 'ellipse',
  x: 100,
  y: 100,
  width: 150,
  height: 150,
  fill: '#00FF00',
  stroke: {
    color: '#000000',
    width: 3
  }
});

// Adicionar Shape com Rotação
editor.addShape({
  type: 'rectangle',
  x: 200,
  y: 150,
  width: 100,
  height: 50,
  fill: '#0000FF',
  rotation: 45 // Rotação em graus
});
```

### Aplicar Filtros

```typescript
// Filtros com intensidade (0 a 1)
editor.filter('grayscale', 1.0);
editor.filter('sepia', 0.7);
editor.filter('blur', 0.5);
editor.filter('sharpen', 0.8);
editor.filter('vintage', 0.6);
editor.filter('invert', 1.0);
editor.filter('vignette', 0.5);
editor.filter('posterize', 0.7);
editor.filter('pixelate', 1.0);
editor.filter('edgeDetection', 0.9);
```

### Ajustes de Imagem

```typescript
// Valores de -100 a 100
editor.brightness(20);
editor.contrast(15);
editor.saturation(-10);
editor.exposure(5);
editor.temperature(15); // Positivo = mais quente, negativo = mais frio
```

### Undo/Redo

```typescript
// Desfazer última operação
editor.undo();

// Refazer operação desfeita
editor.redo();

// Verificar se pode desfazer/refazer
if (editor.canUndo()) {
  editor.undo();
}

if (editor.canRedo()) {
  editor.redo();
}

// Obter histórico completo
const history = editor.getHistory();
```

### Export

```typescript
// Para Canvas
const canvas = await editor.toCanvas();

// Para Blob
const blob = await editor.toBlob('image/jpeg', 0.9);

// Para Data URL
const dataURL = await editor.toDataURL('image/png');

// Download direto
await editor.download('my-image.jpg', 'image/jpeg', 0.85);
```

### Reset

```typescript
// Resetar para imagem original (remove todas as operações)
editor.reset();
```

## Exemplos Avançados

### Encadeamento Completo

```typescript
const editor = await ArtistAPhoto.fromUrl('/image.jpg');

const result = await editor
  .crop({ x: 50, y: 50, width: 400, height: 400 })
  .filter('vintage', 0.8)
  .temperature(15)
  .saturation(-10)
  .brightness(10)
  .addText({
    text: 'Vintage Photo',
    x: 300,
    y: 50,
    fontSize: 36,
    fontFamily: 'Georgia',
    color: '#FFFFFF',
    bold: true,
    shadow: {
      color: 'rgba(0, 0, 0, 0.7)',
      blur: 6,
      offsetX: 2,
      offsetY: 2
    }
  })
  .filter('vignette', 0.6)
  .resize(600, 600)
  .toCanvas();

document.body.appendChild(result);
```

### Preview Antes de Exportar

```typescript
const editor = await ArtistAPhoto.fromUrl('/image.jpg');

editor
  .filter('sepia', 0.7)
  .brightness(10);

// Preview das mudanças
const preview = await editor.preview();
document.getElementById('preview').appendChild(preview);

// Se satisfeito, exportar
const blob = await editor.toBlob('image/png');
```

### Undo/Redo Workflow

```typescript
const editor = await ArtistAPhoto.fromUrl('/image.jpg');

editor
  .brightness(20)
  .contrast(10)
  .saturation(15);

// Desfazer últimas 2 operações
editor.undo().undo();

// Refazer 1 operação
editor.redo();

// Adicionar nova operação (limpa histórico de redo)
editor.filter('grayscale');
```

## Formatos de Export

Suporta os seguintes formatos:
- `image/jpeg` - JPEG com qualidade ajustável (0-1)
- `image/png` - PNG (sem compressão com perda)
- `image/webp` - WebP com qualidade ajustável (0-1)

```typescript
// JPEG com 90% de qualidade
await editor.toBlob('image/jpeg', 0.9);

// PNG (qualidade ignorada)
await editor.toBlob('image/png');

// WebP com 85% de qualidade
await editor.toBlob('image/webp', 0.85);
```

## Performance

O SDK usa Web Workers automaticamente para operações pesadas (blur, sharpen, edge detection, pixelate), garantindo que a UI permaneça responsiva durante o processamento.

## TypeScript

O SDK é totalmente tipado e oferece IntelliSense completo:

```typescript
import { ArtistAPhoto, FilterType, ExportFormat } from 'artistaphoto';

const filter: FilterType = 'grayscale';
const format: ExportFormat = 'image/jpeg';

const editor = await ArtistAPhoto.fromUrl('/image.jpg');
editor.filter(filter).toBlob(format, 0.9);
```

## Error Handling

```typescript
import { ArtistAPhoto, ImageLoadError, InvalidCropError } from 'artistaphoto';

try {
  const editor = await ArtistAPhoto.fromUrl('/invalid-url.jpg');
} catch (error) {
  if (error instanceof ImageLoadError) {
    console.error('Falha ao carregar imagem:', error.message);
  }
}

try {
  editor.crop({ x: -10, y: -10, width: 1000, height: 1000 });
} catch (error) {
  if (error instanceof InvalidCropError) {
    console.error('Parâmetros de crop inválidos:', error.message);
  }
}
```

## Build do Projeto

```bash
# Development
npm run dev

# Build production
npm run build

# Type check
npm run typecheck

# Tests
npm run test
```

## Estrutura de Arquivos Gerados

```
dist/
├── index.js          # CommonJS
├── index.mjs         # ES Module
├── index.global.js   # IIFE (browser)
├── worker.js         # Web Worker (CJS)
├── worker.mjs        # Web Worker (ESM)
├── worker.global.js  # Web Worker (IIFE)
├── index.d.ts        # TypeScript types
└── *.map             # Source maps
```

## Licença

Commercial License - See [LICENSE](./LICENSE) for details.

Purchase at [polar.sh/artistaphoto](https://polar.sh/artistaphoto)

## Suporte a Navegadores

- Chrome/Edge: últimas 2 versões
- Firefox: últimas 2 versões
- Safari: últimas 2 versões

Requer suporte a:
- Canvas API
- ES2020
- Web Workers (opcional, para melhor performance)
