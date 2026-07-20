import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const publicOrigin = env.VITE_PUBLIC_ORIGIN || 'https://localhost';
  process.env.VITE_PUBLIC_ORIGIN = publicOrigin;
  const devServerPort = 5173;
  const apiProxyTarget = env.VITE_DEV_API_PROXY || 'http://localhost:5001';
  const devClientOrigin = `http://localhost:${devServerPort}`;

  return {
    // Baked into the bundle at build time; keeps the real operator identity out of the
    // (public) source. Empty when unset — the privacy page falls back to placeholders.
    define: {
      __PRIVACY_OPERATOR_NAME__: JSON.stringify(env.VITE_PRIVACY_OPERATOR_NAME || ''),
      __PRIVACY_OPERATOR_NAME_RU__: JSON.stringify(env.VITE_PRIVACY_OPERATOR_NAME_RU || ''),
      __PRIVACY_OPERATOR_NAME_EN__: JSON.stringify(env.VITE_PRIVACY_OPERATOR_NAME_EN || ''),
      __PRIVACY_CONTACT_EMAIL__: JSON.stringify(env.VITE_PRIVACY_CONTACT_EMAIL || ''),
    },
    server: {
      port: devServerPort,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          configure: proxy => {
            // Nest CORS whitelist uses CLIENT_URL (SPA origin). changeOrigin rewrites Host
            // to the API target; keep Origin aligned with the browser so preflight succeeds.
            proxy.on('proxyReq', proxyReq => {
              proxyReq.setHeader('Origin', devClientOrigin);
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
