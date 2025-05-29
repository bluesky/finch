import { RouteItem } from '../types/navigationRouterTypes';
export type HubAppLayoutProps = {
    routes: RouteItem[];
    headerTitle?: string;
    headerTitleClassName?: string;
    headerLogoUrl?: string;
    mainContentClassName?: string;
    headerClassName?: string;
    sidebarClassName?: string;
    sidebarActiveLinkClassName?: string;
    sidebarInactiveLinkClassName?: string;
};
export default function HubAppLayout({ routes, headerTitle, headerLogoUrl, mainContentClassName, headerClassName, headerTitleClassName, sidebarClassName, sidebarActiveLinkClassName, sidebarInactiveLinkClassName }: HubAppLayoutProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=HubAppLayout.d.ts.map