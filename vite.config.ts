import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8001',
    },
  },
});
