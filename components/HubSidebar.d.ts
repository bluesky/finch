import { RouteItem } from '../types/navigationRouterTypes';
export type HubSidebarProps = {
    /** Route definitions used to render the sidebar navigation links. */
    routes: RouteItem[];
    /** Additional CSS classes applied to the root aside element. */
    className?: string;
    /** Additional CSS classes applied to the active navigation link. */
    classNameActiveLink?: string;
    /** Additional CSS classes applied to inactive navigation links. */
    classNameInactiveLink?: string;
};
export default function HubSidebar({ routes, className, classNameActiveLink, classNameInactiveLink, ...props }: HubSidebarProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=HubSidebar.d.ts.map