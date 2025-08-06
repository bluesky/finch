import type { Preview } from "@storybook/react";
//import {initialize, mswLoader } from "msw-storybook-addon"; // Import the MSW loader
import "../tailwind.css";
const basePath = window.location.pathname.startsWith("/finch") ? "/finch" : ""; //required to work on both local dev and gh pages

// initialize({
//   serviceWorker: {
//     url: `${basePath}/mockServiceWorker.js`,
//   }
// });
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "About",
          "Documentation",
          "Bluesky Components", [
            'ReactEDM', [
              '*',
              'Developer Notes'
            ]
          ],
          "Layout Components",
          "General Components",
        ],
      },
    },
  },
  loaders: [],
};

export default preview;
