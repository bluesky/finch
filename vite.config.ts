import path from "path";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import tsConfigPaths from "vite-tsconfig-paths";
import * as packageJson from "./package.json";
/// <reference types="vitest" />


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const qserverRest = env.VITE_QSERVER_REST?.trim() || 'http://localhost:60610';
  const qserverWs = env.VITE_QSERVER_WS?.trim() || 'ws://localhost:8001/api/v1/qs-console-socket';
  const cameraWs = env.VITE_CAMERA_WS?.trim() || 'ws://localhost:8001/api/v1/camera-socket';
  const tiffWs = env.VITE_TIFF_WS?.trim() || 'ws://localhost:8002/tiff-socket';

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
      //basicSsl(), //turn this on only when needed for local dev when https is needed
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
      allowedHosts: ['blueskyproject.io'],
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
        '/api/tiff': {
          target: tiffWs,
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tiff/, ''),
        },
        '/tiled-demo': {
          target: 'https://tiled-demo.nsls2.bnl.gov',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tiled-demo/, ''),
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
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/testing/setup.ts'],
      globals: true,
    },
  };
});
