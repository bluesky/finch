import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import tailwindcss from 'tailwindcss'

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ['../public'], //added this to support mws for api call mocks, see public/mockServiceWorker.js
  async viteFinal(config) {
    return mergeConfig(config, {
      css: {
        postcss: {
          plugins: [tailwindcss()],
        },
      },
    });
  },
};
export default config;
