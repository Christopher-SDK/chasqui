import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// En desarrollo, /sunat, /pagos, /identidad y /caos apuntan a cada servicio; en Docker lo hace nginx (ver nginx.conf).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/caos': {
        target: process.env.CAOS_URL ?? 'http://127.0.0.1:7400',
        rewrite: (p) => p.replace(/^\/caos/, ''),
      },
      '/pagos': {
        target: process.env.PAGOS_URL ?? 'http://127.0.0.1:7200',
        rewrite: (p) => p.replace(/^\/pagos/, ''),
      },
      '/identidad': {
        target: process.env.IDENTIDAD_URL ?? 'http://127.0.0.1:7300',
        rewrite: (p) => p.replace(/^\/identidad/, ''),
      },
      '/sunat': {
        target: process.env.SUNAT_URL ?? 'http://127.0.0.1:7100',
        rewrite: (p) => p.replace(/^\/sunat/, ''),
      },
    },
  },
});
