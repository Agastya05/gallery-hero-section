import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standard Vite + React setup, kept intentionally minimal.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 1600, // three.js + r3f bundles are naturally large
  },
});
