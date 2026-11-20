import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentMatchGlobs: [
      // Testes puros (.test.ts) não precisam carregar a DOM do JSDOM
      ['**/*.test.ts', 'node'],
    ],
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
