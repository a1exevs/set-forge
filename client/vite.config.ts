import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const apiProxyTarget = env.VITE_DEV_API_PROXY || 'http://localhost:5000';
  const apiProxyOrigin = env.VITE_DEV_API_PROXY ? new URL(apiProxyTarget).origin : undefined;

  return {
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          configure: proxy => {
            if (!apiProxyOrigin) {
              return;
            }
            proxy.on('proxyReq', proxyReq => {
              proxyReq.setHeader('Origin', apiProxyOrigin);
            });
          },
        },
      },
    },
    plugins: [
      TanStackRouterVite({
        routesDirectory: './src/app/model/routes',
        generatedRouteTree: './src/route-tree.gen.ts',
      }),
      react(),
    ],
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@widgets': path.resolve(__dirname, './src/widgets'),
        '@features': path.resolve(__dirname, './src/features'),
        '@entities': path.resolve(__dirname, './src/entities'),
        '@shared': path.resolve(__dirname, './src/shared'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${path.resolve(__dirname, './src/shared/ui/styles/variables.scss').replace(/\\/g, '/')}" as *;`,
        },
      },
    },
  };
});
