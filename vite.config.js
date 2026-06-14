import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api-jkanime': {
        target: 'https://jkanime.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-jkanime/, ''),
        headers: {
          'Origin': 'https://jkanime.net',
          'Referer': 'https://jkanime.net/'
        }
      }
    }
  }
});
