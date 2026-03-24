import type { Preview } from "@storybook/react";
import "../tailwind.css";
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
          "Documentation", [
            "Installation",
            "BackendSetup",
          ],
          "Bluesky Components",  [
            'ReactEDM', [
              '*',
              'Developer Notes', [
                'Home',
                'Components'
              ]
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
