import FinchHeader from './FinchHeader';
import FinchMainContent from './FinchMainContent';
import FinchSidebar from './FinchSidebar';
import { useActiveRoute } from './hooks/useActiveRoute';
import { cn } from '@/lib/utils';

import { RouteItem } from '@/types/navigationRouterTypes';

export type FinchAppLayoutProps = {
    /** Route definitions used to populate the sidebar navigation and render the main content area. */
    routes: RouteItem[];
    /** Title text displayed in the header. */
    headerTitle?: string;
    /** Additional CSS classes applied to the header title element. */
    classNameHeaderTitle?: string;
    /** Additional CSS classes applied to the header page title element. */
    classNameHeaderPageTitle?: string;
    /** URL of the logo image displayed in the header. Ignored when `headerLogoIcon` is provided. */
    headerLogoUrl?: string;
    /**
     * A React element rendered in place of the header logo image.
     * When provided, `headerLogoUrl` is not rendered.
     */
    headerLogoIcon?: React.ReactElement;
    /** Additional CSS classes applied to the outer main content area. */
    classNameMainContent?: string;
    /** Additional CSS classes applied to the scrolling main content area that holds the page padding. */
    classNameMainContentScrollContainer?: string;
    /** Additional CSS classes applied to the inner main content area. */
    classNameMainContentInnerContainer?: string;
    /** Additional CSS classes applied to the page tab strip. */
    classNamePageTabs?: string;
    /** Additional CSS classes applied to the active page tab. */
    classNamePageTabsActive?: string;
    /** Additional CSS classes applied to inactive page tabs. */
    classNamePageTabsInactive?: string;
    /** Additional CSS classes applied to the header element. */
    classNameHeader?: string;
    /** Additional CSS classes applied to the sidebar element. */
    classNameSidebar?: string;
    /** Additional CSS classes applied to the active sidebar link. */
    classNameSidebarActiveLink?: string;
    /** Additional CSS classes applied to inactive sidebar links. */
    classNameSidebarInactiveLink?: string;
    /** Additional CSS classes applied to the image within the header. */
    classNameImage?: string;
    /** Additional CSS classes applied to the root layout element. */
    className?: string;
};
export default function FinchAppLayout({
    routes,
    headerTitle,
    headerLogoUrl,
    headerLogoIcon,
    classNameMainContent,
    classNameMainContentScrollContainer,
    classNameMainContentInnerContainer,
    classNamePageTabs,
    classNamePageTabsActive,
    classNamePageTabsInactive,
    classNameHeader,
    classNameHeaderTitle,
    classNameHeaderPageTitle,
    classNameSidebar,
    classNameSidebarActiveLink,
    classNameSidebarInactiveLink,
    classNameImage,
    className,
    ...props
}: FinchAppLayoutProps) {
    const activeRoute = useActiveRoute(routes);
    const showPageTitle = activeRoute?.showPageTitle ?? activeRoute?.path !== '/';
    const pageTitle = showPageTitle ? activeRoute?.label : undefined;

    return (
        <div
            className={cn(
                'grid grid-cols-[6rem_1fr] grid-rows-[auto_1fr] h-screen w-screen',
                className,
            )}
            {...props}
        >
            <FinchSidebar
                routes={routes}
                className={classNameSidebar}
                classNameActiveLink={classNameSidebarActiveLink}
                classNameInactiveLink={classNameSidebarInactiveLink}
            />
            <FinchHeader
                title={headerTitle}
                pageTitle={pageTitle}
                logoUrl={headerLogoUrl}
                logoIcon={headerLogoIcon}
                className={classNameHeader}
                classNameTitle={classNameHeaderTitle}
                classNamePageTitle={classNameHeaderPageTitle}
                classNameImage={classNameImage}
            />
            <FinchMainContent
                routes={routes}
                className={cn('h-[calc(100vh-4rem)]', classNameMainContent)}
                classNameScrollContainer={classNameMainContentScrollContainer}
                classNameInnerContainer={classNameMainContentInnerContainer}
                classNamePageTabs={classNamePageTabs}
                classNamePageTabsActive={classNamePageTabsActive}
                classNamePageTabsInactive={classNamePageTabsInactive}
            />
        </div>
    );
}
