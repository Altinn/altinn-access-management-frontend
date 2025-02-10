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
  server: {
    cors: {
      origin: [
        'https://am.ui.at22.altinn.cloud',
        'https://am.ui.altinn.no',
        'https://am.ui.tt02.altinn.no',
      ],
      credentials: true,
    },
  },
  plugins: [svgr(), react()],
  build: {
    target: 'es2020',
    manifest: true,
    rollupOptions: {
      // overwrite default .html entry
      input: './entrypoint.js',
      output: {
        entryFileNames: 'assets/accessmanagement.js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.')[1];
          if (/css/i.test(extType)) {
            return `assets/accessmanagement.css`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
