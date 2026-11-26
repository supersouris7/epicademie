/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const api = process.env.EPICADEMIE_API ?? 'http://localhost:3000';

/**
 * Version des images (horodatage du build) : ajoutée aux adresses des images, elle force les
 * navigateurs à recharger une image modifiée (même nom de fichier) dès la mise à jour.
 */
const assetVersion = process.env.VITEST ? 'test' : Date.now().toString(36);

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

/** En développement comme en production (serveur), `/admin` et ses sous-adresses servent admin.html. */
const adminPage: Plugin = {
  name: 'page-admin',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (/^\/admin(\/|\?|$)/.test(req.url ?? '')) req.url = '/admin.html';
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), adminPage],
  build: { rolldownOptions: { input: { index: page('./index.html'), admin: page('./admin.html') } } },
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
