import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, useLocation } from 'react-router';
import { House, ChartScatter } from '@phosphor-icons/react';
import FinchAppLayout from '@/components/FinchAppLayout/FinchAppLayout';
import { useFullscreen } from '@/components/FinchAppLayout/hooks/useFullscreen';
import Paper from '@/components/Paper';
import { RouteItem } from '@/types/navigationRouterTypes';

/**
 * Demo page that shows the current url and toggles fullscreen.
 *
 * Storybook renders inside a `MemoryRouter`, so the url never reaches the address bar;
 * printing it here makes the `?fullscreen` param visible.
 */
const FullscreenDemoPage = ({ name }: { name: string }) => {
    const { pathname, search, hash } = useLocation();
    const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
    return (
        <Paper>
            <h2 className="text-xl font-bold mb-2 text-center">{name}</h2>
            <p className="text-center mb-4">
                Current url:{' '}
                <code className="bg-slate-100 px-1 rounded">{`${pathname}${search}${hash}`}</code>
            </p>
            <div className="flex flex-col items-center gap-2">
                <button
                    type="button"
                    onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                    className="px-4 py-2 rounded-md bg-sky-700 text-white hover:bg-sky-600"
                >
                    {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                </button>
                {isFullscreen && (
                    <p className="text-sm text-slate-600">
                        Or press <kbd className="border rounded px-1">Esc</kbd> (click inside the
                        page first so it has keyboard focus).
                    </p>
                )}
            </div>
        </Paper>
    );
};

const routes: RouteItem[] = [
    {
        element: <FullscreenDemoPage name="Home" />,
        path: '/',
        label: 'Home',
        icon: <House size={32} />,
    },
    {
        path: '/explorer',
        label: 'Explorer',
        icon: <ChartScatter size={32} />,
        tabs: [
            { element: <FullscreenDemoPage name="Live" />, path: 'live', label: 'Live' },
            { element: <FullscreenDemoPage name="Replay" />, path: 'replay', label: 'Replay' },
        ],
    },
];

const meta = {
    title: 'Layout Components/FinchAppLayout Fullscreen',
    component: FinchAppLayout,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
## Fullscreen mode

Add \`?fullscreen\` to any url to hide the sidebar and header so the page fills the window.
Press **Escape** to leave. Page tabs stay visible, and switching tabs keeps fullscreen.

\`\`\`
/explorer/live              -> normal layout
/explorer/live?fullscreen   -> page only
\`\`\`

The mode lives in the query string rather than the hash, so it works the same under
\`BrowserRouter\` and \`HashRouter\` (\`#/explorer/live?fullscreen\`), and a fullscreen view can be
bookmarked or opened on a wall display.

Escape is ignored while typing in an input, textarea, select or editable element, and when
another component (such as a Radix menu closing) has already handled it.

### Turning it off

\`\`\`tsx
<FinchAppLayout routes={routes} allowFullscreen={false} />
\`\`\`

### Toggling from your own components

\`\`\`tsx
import { useFullscreen } from '@blueskyproject/finch';

function FullscreenButton() {
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  return (
    <button onClick={isFullscreen ? exitFullscreen : enterFullscreen}>
      {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    </button>
  );
}
\`\`\`

To build a fullscreen link without the hook, use \`withFullscreenParam(search, true)\`.
                `,
            },
        },
    },
    decorators: [
        (Story, { args, parameters }) => (
            <MemoryRouter initialEntries={[parameters.initialPath ?? '/']}>
                <Story args={args} />
            </MemoryRouter>
        ),
    ],
} satisfies Meta<typeof FinchAppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Starts in the normal layout. Use the button on the page to enter fullscreen. */
export const Toggle: Story = {
    args: {
        routes,
        headerTitle: 'Fullscreen Demo',
        className: 'w-full h-full',
    },
};

/** Opens a tabbed route at `/explorer?fullscreen`, which redirects to the first tab and stays fullscreen. */
export const StartFullscreenWithTabs: Story = {
    parameters: { initialPath: '/explorer?fullscreen' },
    args: {
        routes,
        headerTitle: 'Fullscreen Demo',
        className: 'w-full h-full',
    },
};

/** With `allowFullscreen={false}`, the `?fullscreen` param is ignored. */
export const FullscreenDisabled: Story = {
    parameters: { initialPath: '/?fullscreen' },
    args: {
        routes,
        headerTitle: 'Fullscreen Disabled',
        allowFullscreen: false,
        className: 'w-full h-full',
    },
};
