import { StoryObj } from '@storybook/react';
import { default as HubAppLayout } from '../components/HubAppLayout';
import { RouteItem } from '../types/navigationRouterTypes';
declare const meta: {
    title: string;
    component: typeof HubAppLayout;
    tags: string[];
    parameters: {
        layout: string;
    };
    decorators: ((Story: import('@storybook/core/csf').PartialStoryFn<import('@storybook/react').ReactRenderer, {
        routes: RouteItem[];
        headerTitle?: string | undefined;
        headerTitleClassName?: string | undefined;
        headerLogoUrl?: string | undefined;
        mainContentClassName?: string | undefined;
        headerClassName?: string | undefined;
        sidebarClassName?: string | undefined;
        sidebarActiveLinkClassName?: string | undefined;
        sidebarInactiveLinkClassName?: string | undefined;
    }>) => import("react/jsx-runtime").JSX.Element)[];
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Default: Story;
export declare const CustomTitle: Story;
export declare const CustomClasses: Story;
//# sourceMappingURL=HubAppLayout.stories.d.ts.map