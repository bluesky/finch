import FinchHeader from './FinchHeader';
import FinchMainContent from './FinchMainContent';
import FinchSidebar from './FinchSidebar';
import { useActiveRoute } from './hooks/useActiveRoute';
import { useFullscreen } from './hooks/useFullscreen';
import { cn } from '@/lib/utils';

import { RouteItem } from '@/types/navigationRouterTypes';

export type FinchAppLayoutProps = {
    /** Route definitions used to populate the sidebar navigation and render the main content area. */
    routes: RouteItem[];
    /** Title text displayed in the header. */
    headerTitle?: string;
    /**
     * Whether the active route's label appears in the header, for every route.
     * A route's own `showPageTitle` overrides this. Defaults to `true`.
     */
    showPageTitle?: boolean;
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
    /**
     * Whether adding `?fullscreen` to the url hides the sidebar and header so the page
     * fills the window. Escape leaves fullscreen. Defaults to `true`.
     */
    allowFullscreen?: boolean;
};
export default function FinchAppLayout({
    routes,
    headerTitle,
    showPageTitle,
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
    allowFullscreen = true,
    ...props
}: FinchAppLayoutProps) {
    const activeRoute = useActiveRoute(routes);
    const fullscreen = useFullscreen({ listenForExitKey: allowFullscreen });
    const isFullscreen = allowFullscreen && fullscreen.isFullscreen;
    const isPageTitleShown = activeRoute?.showPageTitle ?? showPageTitle ?? true;
    const pageTitle = isPageTitleShown ? activeRoute?.label : undefined;

    return (
        <div
            className={cn(
                'grid h-screen w-screen',
                isFullscreen
                    ? 'grid-cols-1 grid-rows-1'
                    : 'grid-cols-[6rem_1fr] grid-rows-[auto_1fr]',
                className,
            )}
            data-fullscreen={isFullscreen || undefined}
            {...props}
        >
            {!isFullscreen && (
                <>
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
                </>
            )}
            <FinchMainContent
                routes={routes}
                className={cn(
                    isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]',
                    classNameMainContent,
                )}
                classNameScrollContainer={classNameMainContentScrollContainer}
                classNameInnerContainer={classNameMainContentInnerContainer}
                classNamePageTabs={classNamePageTabs}
                classNamePageTabsActive={classNamePageTabsActive}
                classNamePageTabsInactive={classNamePageTabsInactive}
            />
        </div>
    );
}
