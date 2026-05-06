import type { Preview } from "@storybook/react";
import "../tailwind.css";
const version = import.meta.env.STORYBOOK_FINCH_VERSION;
console.log(`Finch UI version ${version}`);
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
        method: 'alphabetical',
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
