import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    worker: 'src/workers/imageWorker.ts'
  },
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  target: 'es2020',
  platform: 'browser',
  globalName: 'ArtistAPhoto',
  outDir: 'dist',
  esbuildOptions(options) {
    options.banner = {
      js: '/* ArtistAPhoto - Browser Image Editor SDK */',
    };
  },
});
