import path from "path";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import tsConfigPaths from "vite-tsconfig-paths";
import * as packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const qserverRest = env.VITE_QSERVER_REST?.trim() || 'http://localhost:60610';
  const qserverWs = env.VITE_QSERVER_WS?.trim() || 'ws://localhost:8001/api/v1/qs-console-socket';
  const cameraWs = env.VITE_CAMERA_WS?.trim() || 'ws://localhost:8000/pvcamera';

  return {
    define: {
      'import.meta.env': {
        VITE_QSERVER_REST: JSON.stringify(qserverRest),
        VITE_QSERVER_WS: JSON.stringify(qserverWs),
        VITE_CAMERA_WS: JSON.stringify(cameraWs),
      },
    },
    plugins: [
      react(),
      tsConfigPaths(),
      dts({
        include: ['src/', 'src/vite-env.d.ts'],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api/qserver': {
          target: qserverRest,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/qserver/, ''),
        },
        '/api/qserver/console': {
          target: qserverWs,
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/qserver\/console/, ''),
        },
        '/api/camera': {
          target: cameraWs,
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/camera/, ''),
        },
      },
    },
    build: {
      lib: {
        entry: resolve('src', 'index.ts'),
        name: 'Finch',
        formats: ['es', 'umd'],
        fileName: (format) => `finch.${format}.js`,
      },
      rollupOptions: {
        external: [...Object.keys(packageJson.peerDependencies)],
      },
    },
  };
});
