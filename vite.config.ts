import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: () => 'index.js',
      formats: ['cjs'],
    },
    outDir: 'lib',
    rollupOptions: {
      external: ['jsonwebtoken', 'node-fetch'],
    },
  },
});
