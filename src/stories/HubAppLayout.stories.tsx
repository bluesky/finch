import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import HubAppLayout from '@/components/HubAppLayout';
import Paper from '@/components/Paper';
import { House, Joystick, StackPlus, ImageSquare  } from "@phosphor-icons/react";
import { RouteItem } from '@/types/navigationRouterTypes';
import { MemoryRouter } from 'react-router';

/**
 * Routes Structure Documentation
 * ============================
 * 
 * The HubAppLayout component expects a `routes` prop that is an array of RouteItem objects.
 * Each RouteItem defines a navigation tab/page with the following structure:
 * 
 * RouteItem {
 *   element: React.ReactNode   - The component/content to render when this route is active
 *   path: string              - The URL path for this route (e.g., "/", "/control", "/data")
 *   label: string             - The display text shown in the sidebar navigation tab
 *   icon: React.ReactNode     - The icon displayed next to the label in the sidebar
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
 *   }
 * ];
 * 
 * The HubAppLayout component will:
 * 1. Create sidebar navigation tabs based on the label and icon
 * 2. Handle routing between different paths
 * 3. Render the corresponding element when a route is selected
 */

const Page1 = () => {
    return (
        <Paper>
            <h2 className="text-xl font-bold mb-2 text-center">Home Page</h2>
            <p className="text-center">Your element for this route will be rendered here.</p>
            <p>{"<-"} clicking on the tabs changes content</p>
        </Paper>
    )
}

const Page2 = () => {
    return (
        <Paper size='small'>
            <h2 className="text-xl font-bold mb-2 text-center">Controller</h2>
            <p className="text-center">A little widget for controls</p>
        </Paper>
    )
}

const Page3 = () => {
    return (
        <Paper className="bg-yellow-400">
            <h2 className="text-xl font-bold mb-2 text-center">Q Server Page</h2>
            <p className="text-center">A page for the queue server.</p>
        </Paper>
    )
}

const Page4 = () => {
    return (
        <Paper rounded='none'>
            <h2 className="text-xl font-bold mb-2 text-center">Data Page</h2>
            <p className="text-center">A page for data visualization and analysis tools.</p>
        </Paper>
    )
}

const routes: RouteItem[] = [
    {element: <Page1 />, path: "/", label: "Home", icon: <House size={32} />},
    {element: <Page2 />, path: "/control", label: "Control", icon: <Joystick size={32} />},
    {element: <Page3 />, path: "/qserver", label: "Q Server", icon: <StackPlus size={32} />},
    {element: <Page4 />, path: "/data", label: "Data", icon: <ImageSquare size={32} />},
];

const meta = {
    title: 'Layout Components/HubAppLayout',
    component: HubAppLayout,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
## Routes Structure

The HubAppLayout component expects a \`routes\` prop that is an array of RouteItem objects.
Each RouteItem defines a navigation tab/page with the following structure:

\`\`\`typescript
RouteItem {
  element: React.ReactNode   // The component/content to render when this route is active
  path: string              // The URL path for this route (e.g., "/", "/control", "/data")
  label: string             // The display text shown in the sidebar navigation tab
  icon: React.ReactNode     // The icon displayed next to the label in the sidebar
}
\`\`\`

### Example Usage:
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

### How it works:
1. **Creates sidebar navigation tabs** based on the label and icon
2. **Handles routing** between different paths using React Router
3. **Renders the corresponding element** when a route is selected

The component uses React Router internally to manage navigation between different pages/views.
                `
            }
        }
    },
    decorators: [
        (Story, { args }) => (
            <MemoryRouter initialEntries={['/']}>
                <Story args={args} />
            </MemoryRouter>
        ),
    ],
} satisfies Meta<typeof HubAppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        routes: routes,
        className: 'w-full h-full'
    }
}

export const CustomTitle: Story = {
    args: {
        routes: routes,
        headerTitle: 'Custom Header Title with Custom Icon',
        headerLogoUrl: 'https://img.icons8.com/?size=100&id=9243&format=png&color=000000',
        className: 'w-full h-full'
    }
}

export const CustomClasses: Story = {
    args: {
        routes: routes,
        headerTitle: 'Styled Sidebar and Main Content',
        headerLogoUrl: 'https://img.icons8.com/?size=100&id=59484&format=png&color=000000',
        sidebarClassName: 'bg-red-100',
        sidebarActiveLinkClassName: 'bg-red-500',
        sidebarInactiveLinkClassName: 'text-red-500 hover:bg-purple-300 hover:text-slate-900',
        mainContentClassName: 'bg-red-300',
        headerClassName: 'bg-red-200',
        headerTitleClassName: 'text-red-900',
        className: 'w-full h-full'
    }
}
