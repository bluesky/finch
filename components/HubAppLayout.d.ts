import { RouteItem } from '../types/navigationRouterTypes';
export type HubAppLayoutProps = {
    /** Route definitions used to populate the sidebar navigation and render the main content area. */
    routes: RouteItem[];
    /** Title text displayed in the header. */
    headerTitle?: string;
    /** Additional CSS classes applied to the header title element. */
    classNameHeaderTitle?: string;
    /** URL of the logo image displayed in the header. Ignored when `headerLogoIcon` is provided. */
    headerLogoUrl?: string;
    /**
     * A React element rendered in place of the header logo image.
     * When provided, `headerLogoUrl` is not rendered.
     */
    headerLogoIcon?: React.ReactElement;
    /** Additional CSS classes applied to the outer main content area. */
    classNameMainContent?: string;
    /** Additional CSS classes applied to the inner main content area. */
    classNameMainContentInnerContainer?: string;
    /** Additional CSS classes applied to the header element. */
    classNameHeader?: string;
    /** Additional CSS classes applied to the sidebar element. */
    classNameSidebar?: string;
    /** Additional CSS classes applied to the active sidebar link. */
    classNameSidebarActiveLink?: string;
    /** Additional CSS classes applied to inactive sidebar links. */
    classNameSidebarInactiveLink?: string;
    /** Additional CSS classes applied to the root layout element. */
    className?: string;
};
export default function HubAppLayout({ routes, headerTitle, headerLogoUrl, headerLogoIcon, classNameMainContent, classNameMainContentInnerContainer, classNameHeader, classNameHeaderTitle, classNameSidebar, classNameSidebarActiveLink, classNameSidebarInactiveLink, className, ...props }: HubAppLayoutProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=HubAppLayout.d.ts.map