import type { Preview } from "@storybook/react";
import {initialize, mswLoader } from "msw-storybook-addon"; // Import the MSW loader
import '../tailwind.css';
initialize(); // Initialize MSW
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
};

export default preview;
