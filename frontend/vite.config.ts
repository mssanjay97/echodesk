// vite.config.js
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json'; // The plugin uses your manifest.json

export default defineConfig({
  plugins: [
    crx({ manifest }),
  ],
});
