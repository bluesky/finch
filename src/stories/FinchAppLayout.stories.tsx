import type { Meta, StoryObj } from '@storybook/react';
import FinchAppLayout from '@/components/FinchAppLayout/FinchAppLayout';
import Paper from '@/components/Paper';
import { House, Joystick, StackPlus, ImageSquare, ChartScatter } from '@phosphor-icons/react';
import { RouteItem } from '@/types/navigationRouterTypes';
import { MemoryRouter } from 'react-router';

/**
 * Routes Structure Documentation
 * ============================
 *
 * The FinchAppLayout component expects a `routes` prop that is an array of RouteItem objects.
 * Each RouteItem defines a navigation tab/page with the following structure:
 *
 * RouteItem {
 *   path: string                       - The URL path for this route (e.g., "/", "/control"), static only
 *   label: string                      - The display text shown in the sidebar navigation tab
 *   element?: React.ReactNode          - The component/content to render when this route is active
 *   tabs?: RouteTab[]                  - Tabs shown in a strip above the page, each with its own URL
 *   icon?: React.ReactNode             - The icon displayed next to the label in the sidebar
 *   isBackgroundTransparent?: boolean  - Renders the page transparent with white text (default: false)
 *   classNameContainer?: string        - Additional CSS classes for the page container
 *   showPageTitle?: boolean            - Shows this route's label in the header (default: true, except on "/")
 * }
 *
 * A route declares either `element` or `tabs`, never both.
 *
 * RouteTab {
 *   path: string                       - Path segment under the route path (e.g. "live" under "/explorer")
 *   label: string                      - The display text shown on the tab
 *   element: React.ReactNode           - The component/content to render when this tab is active
 * }
 *
 * Example:
 * const routes: RouteItem[] = [
 *   {
 *     element: <HomePage />,
 *     path: "/",
 *     label: "Home",
 *     icon: <House size={32} />
 *   },
 *   {
 *     element: <ControlPage />,
 *     path: "/control",
 *     label: "Control",
 *     icon: <Joystick size={32} />
 *   },
 *   {
 *     path: "/explorer",
 *     label: "Explorer",
 *     icon: <ChartScatter size={32} />,
 *     tabs: [
 *       { element: <LiveTab />, path: "live", label: "Live" },
 *       { element: <ReplayTab />, path: "replay", label: "Replay" }
 *     ]
 *   }
 * ];
 *
 * The FinchAppLayout component will:
 * 1. Create sidebar navigation tabs based on the label and icon
 * 2. Handle routing between different paths
 * 3. Render the corresponding element when a route is selected
 * 4. Draw a tab strip above the page for any route that declares tabs
 * 5. Show the active route label in the header, after the app title
 */

const Page1 = () => {
    return (
        <Paper>
            <h2 className="text-xl font-bold mb-2 text-center">Home Page</h2>
            <p className="text-center">Your element for this route will be rendered here.</p>
            <p>{'<-'} clicking on the tabs changes content</p>
        </Paper>
    );
};

const Page2 = () => {
    return (
        <Paper size="small">
            <h2 className="text-xl font-bold mb-2 text-center">Controller</h2>
            <p className="text-center">A little widget for controls</p>
        </Paper>
    );
};

const Page3 = () => {
    return (
        <Paper className="bg-yellow-400">
            <h2 className="text-xl font-bold mb-2 text-center">Q Server Page</h2>
            <p className="text-center">A page for the queue server.</p>
        </Paper>
    );
};

const Page4 = () => {
    return (
        <Paper rounded="none">
            <h2 className="text-xl font-bold mb-2 text-center">Data Page</h2>
            <p className="text-center">A page for data visualization and analysis tools.</p>
        </Paper>
    );
};

const routes: RouteItem[] = [
    { element: <Page1 />, path: '/', label: 'Home', icon: <House size={32} /> },
    { element: <Page2 />, path: '/control', label: 'Control', icon: <Joystick size={32} /> },
    { element: <Page3 />, path: '/qserver', label: 'Q Server', icon: <StackPlus size={32} /> },
    { element: <Page4 />, path: '/data', label: 'Data', icon: <ImageSquare size={32} /> },
];

type ExplorerTabProps = {
    name: string;
};

const ExplorerTab = ({ name }: ExplorerTabProps) => {
    return (
        <Paper>
            <h2 className="text-xl font-bold mb-2 text-center">{name}</h2>
            <p className="text-center">Each tab has its own URL under /explorer.</p>
        </Paper>
    );
};

const routesWithTabs: RouteItem[] = [
    ...routes,
    {
        path: '/explorer',
        label: 'Explorer',
        icon: <ChartScatter size={32} />,
        tabs: [
            { element: <ExplorerTab name="Live" />, path: 'live', label: 'Live' },
            { element: <ExplorerTab name="Explore" />, path: 'explore', label: 'Explore' },
            { element: <ExplorerTab name="Replay" />, path: 'replay', label: 'Replay' },
            { element: <ExplorerTab name="Run" />, path: 'run', label: 'Run' },
        ],
    },
];

const meta = {
    title: 'Layout Components/FinchAppLayout',
    component: FinchAppLayout,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
## Routes Structure

The FinchAppLayout component expects a \`routes\` prop that is an array of RouteItem objects.
Each RouteItem defines a navigation tab/page with the following structure:

\`\`\`typescript
RouteItem {
  element?: React.ReactNode       // The component/content to render when this route is active
  path: string                    // The URL path, static only (e.g., "/", "/control", "/data")
  label: string                   // The display text shown in the sidebar navigation tab
  icon: React.ReactNode           // The icon displayed next to the label in the sidebar
  tabs?: RouteTab[]               // Tabs shown in a strip above the page (omit \`element\` when set)
  isBackgroundTransparent?: boolean  // If true, page background is transparent (default: false)
  classNameContainer?: string     // Additional CSS classes applied to the page container
  showPageTitle?: boolean         // Whether the header shows this route's label (default: true, except on "/")
}
\`\`\`

A route declares either \`element\` or \`tabs\`, never both.

Route paths must be static. The sidebar links to each \`path\` directly, so a dynamic
segment such as \`/runs/:uid\` would render a link to that literal text.

### Page Tabs

A route can declare \`tabs\` instead of an \`element\`. Finch then draws a tab strip
above the page and gives each tab its own URL beneath the route path, so tabs are
deep-linkable and survive a refresh. Visiting the bare route path redirects to the
first tab.

\`\`\`typescript
RouteTab {
  element: React.ReactNode        // The component/content to render when this tab is active
  path: string                    // Path segment under the route path (e.g. "live" under "/explorer")
  label: string                   // The display text shown on the tab
  isBackgroundTransparent?: boolean  // If true, this tab's background is transparent
  classNameContainer?: string     // Additional CSS classes applied to this tab's container
}
\`\`\`

\`\`\`typescript
const routes: RouteItem[] = [
  {
    path: '/explorer',
    label: 'Explorer',
    icon: <ChartScatter size={32} />,
    tabs: [
      { element: <LiveTab />, path: 'live', label: 'Live' },        // -> /explorer/live
      { element: <ReplayTab />, path: 'replay', label: 'Replay' },  // -> /explorer/replay
    ],
  },
];
\`\`\`

### Basic Example:
\`\`\`typescript
const routes: RouteItem[] = [
  {
    element: <HomePage />,
    path: "/",
    label: "Home",
    icon: <House size={32} />
  },
  {
    element: <ControlPage />,
    path: "/control",
    label: "Control",
    icon: <Joystick size={32} />
  }
];
\`\`\`

### Full App Example (from App.tsx):
\`\`\`typescript
import FinchAppLayout from '@/components/FinchAppLayout/FinchAppLayout';
import { RouteItem } from '@/types/navigationRouterTypes';
import { House, Table, TestTube, Question } from '@phosphor-icons/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const routes: RouteItem[] = [
    {
      element: <AboutFinchPage />,
      path: '/',
      label: 'About',
      icon: <House size={32} />,
      isBackgroundTransparent: true,   // no background fill — page blends into layout
    },
    {
      element: <AllComponentsPage />,
      path: '/components',
      label: 'Review',
      icon: <Table size={32} />,
      classNameContainer: 'bg-slate-50',  // custom background color for this page
    },
    {
      element: <TestPage />,
      path: '/test',
      label: 'Test',
      icon: <TestTube size={32} />,
      isBackgroundTransparent: true,
    },
    {
      element: <Documentation />,
      path: '/documentation',
      label: 'Help',
      icon: <Question size={32} />,
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <FinchAppLayout
        routes={routes}
        headerTitle="Finch Dev Mode"
        headerLogoIcon={
          <div className="h-12 aspect-square text-sky-950">
            {finchIcons.finchPortraitFrameless}
          </div>
        }
      />
    </QueryClientProvider>
  );
}
\`\`\`

### How it works:
1. **Creates sidebar navigation tabs** based on the label and icon
2. **Handles routing** between different paths using React Router
3. **Renders the corresponding element** when a route is selected
4. **Applies per-route styling** via \`isBackgroundTransparent\` or \`classNameContainer\`
5. **Draws a tab strip** above the page for any route that declares \`tabs\`
6. **Shows the active route label** in the header, after the app title, on every route but \`/\` (override per route with \`showPageTitle\`)

The component uses React Router internally to manage navigation between different pages/views.
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

export const Default: Story = {
    args: {
        routes: routes,
        className: 'w-full h-full',
    },
};

export const CustomTitle: Story = {
    args: {
        routes: routes,
        headerTitle: 'Custom Header Title with Custom Icon',
        headerLogoUrl: 'https://img.icons8.com/?size=100&id=9243&format=png&color=000000',
        className: 'w-full h-full',
    },
};

export const WithPageTabs: Story = {
    parameters: { initialPath: '/explorer' },
    args: {
        routes: routesWithTabs,
        headerTitle: 'Finch Dev Mode',
        className: 'w-full h-full',
    },
};

export const CustomClasses: Story = {
    args: {
        routes: routes,
        headerTitle: 'Styled Sidebar and Main Content',
        headerLogoUrl: 'https://img.icons8.com/?size=100&id=59484&format=png&color=000000',
        classNameSidebar: 'bg-red-100',
        classNameSidebarActiveLink: 'bg-red-500',
        classNameSidebarInactiveLink: 'text-red-500 hover:bg-purple-300 hover:text-slate-900',
        classNameMainContent: 'bg-red-300',
        classNameMainContentScrollContainer: 'p-2',
        classNameHeader: 'bg-red-200',
        classNameHeaderTitle: 'text-red-900',
        className: 'w-full h-full',
    },
};
