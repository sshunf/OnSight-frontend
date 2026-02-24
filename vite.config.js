import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import prerender from '@prerenderer/rollup-plugin';

dotenv.config();
const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:3001';
const skipPrerender = process.env.SKIP_PRERENDER === 'true';

const prerenderRoutes = [
  '/',
  '/features',
  '/foundersNote',
  '/dashboard-demo',
  '/waitlist',
  '/documentation',
  '/faq',
  '/case-studies',
  '/blog',
  '/garage',
  '/gym-select',
  '/roi',
  '/roi-calculator',
];

const plugins = [react()];
if (!skipPrerender) {
  plugins.push(
    prerender({
      routes: prerenderRoutes,
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        renderAfterTime: 1000,
      },
    }),
  );
}

export default defineConfig({
  plugins,
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['react-router', 'react-router-dom'],
    base: '/',
  },
});
