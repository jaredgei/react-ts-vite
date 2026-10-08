/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8008',
        changeOrigin: true,
      },
    },
  },
  css: {
    transformer: 'lightningcss',
  },
  build: {
    cssMinify: 'lightningcss',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: true,
  },
});
