import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import ts from 'rollup-plugin-typescript2';

export default defineConfig({
  plugins: [
    react(),
    ts({
      check: false,
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      include: ['public/**/*.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, 'public/background.ts'),
        index: path.resolve(__dirname, '/index.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
