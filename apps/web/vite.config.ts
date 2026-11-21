/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const api = process.env.QUESTEO_API ?? 'http://localhost:3000';

/**
 * Version des images (horodatage du build) : ajoutée aux adresses des images, elle force les
 * navigateurs à recharger une image modifiée (même nom de fichier) dès la mise à jour.
 */
const assetVersion = process.env.VITEST ? 'test' : Date.now().toString(36);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { __ASSET_VERSION__: JSON.stringify(assetVersion) },
  server: {
    port: 5173,
    proxy: {
      '/api': api,
      '/socket.io': { target: api, ws: true },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
