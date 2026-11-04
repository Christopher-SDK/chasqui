import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// En desarrollo, /sunat apunta a sunat-sim; en Docker lo hace nginx (ver nginx.conf).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/sunat': {
        target: process.env.SUNAT_URL ?? 'http://127.0.0.1:7100',
        rewrite: (p) => p.replace(/^\/sunat/, ''),
      },
    },
  },
});
