// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite-plugin-svgr/client" />

import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  plugins: [svgr(), react()],
  build: {
    target: 'es2020',
    manifest: true,
    rollupOptions: {
      // overwrite default .html entry
      input: './entrypoint.js',
    },
  },
});
