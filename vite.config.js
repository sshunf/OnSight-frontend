import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();
const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:3001';
const skipPrerender = process.env.SKIP_PRERENDER === 'true';

const prerenderRoutes = [
  '/',
  '/foundersNote',
  '/dashboard-demo',
  '/waitlist',
  '/garage',
  '/gym-select',
  '/roi',
  '/roi-calculator',
];

export default defineConfig(async ({ command }) => {
  const plugins = [react()];

  if (command === 'build' && !skipPrerender) {
    let prerender;

    try {
      ({ default: prerender } = await import('@prerenderer/rollup-plugin'));
    } catch (error) {
      throw new Error(
        "Prerendering is enabled, but '@prerenderer/rollup-plugin' is not installed. Run npm install in OnSight-frontend or set SKIP_PRERENDER=true.",
        { cause: error },
      );
    }

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

  return {
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
    },
    base: '/',
  };
});
