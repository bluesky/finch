import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import tailwindcss from 'tailwindcss';
import pkg from "../package.json";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  env: (config) => ({
    ...config,
    STORYBOOK_FINCH_VERSION: pkg.version,
  }),
  staticDirs: ['../public'], //added this to support mws for api call mocks, see public/mockServiceWorker.js
  async viteFinal(config) {
    return mergeConfig(config, {
      base: '/finch/',
      css: {
        postcss: {
          plugins: [tailwindcss()],
        },
      },
    });
  },
};
export default config;
