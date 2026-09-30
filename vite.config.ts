import path from "path";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import tsConfigPaths from "vite-tsconfig-paths";
import * as packageJson from "./package.json";
/// <reference types="vitest" />


const externalPackages = [
  ...Object.keys(packageJson.peerDependencies),
  ...Object.keys(packageJson.dependencies),
];

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
        '/api/tiff': {
          target: tiffWs,
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tiff/, ''),
        },
      },
    },
    build: {
      // ESM only. UMD cannot preserve module boundaries, and its script-tag
      // path was already broken (rollup was guessing globals for every external).
      lib: {
        entry: resolve('src', 'index.ts'),
        formats: ['es'],
      },
      rollupOptions: {
        // Keep every declared dependency out of the bundle. Inlining them shipped
        // all of plotly.js (and friends) to consumers that never imported a plot.
        // CSS stays bundled so consumers still get a single finch.css.
        external: (id) => {
          if (id.startsWith('.') || path.isAbsolute(id) || id.endsWith('.css')) return false;
          return externalPackages.some((dep) => id === dep || id.startsWith(`${dep}/`));
        },
        output: {
          // One output file per source module, so a consumer importing Paper
          // never walks the edge into PlotlyScatter -> react-plotly.js.
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/testing/setup.ts'],
      globals: true,
    },
  };
});
