import HubHeader from '@/components/HubHeader';
import HubMainContent from '@/components/HubMainContent';
import HubSidebar from '@/components/HubSidebar';
import { cn } from '@/lib/utils';

import { RouteItem } from '@/types/navigationRouterTypes';

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
    /** Additional CSS classes applied to the image within the header. */
    classNameImage?: string;
    /** Additional CSS classes applied to the root layout element. */
    className?: string;
};
export default function HubAppLayout({
    routes,
    headerTitle,
    headerLogoUrl,
    headerLogoIcon,
    classNameMainContent,
    classNameMainContentInnerContainer,
    classNameHeader,
    classNameHeaderTitle,
    classNameSidebar,
    classNameSidebarActiveLink,
    classNameSidebarInactiveLink,
    classNameImage,
    className,
    ...props
}: HubAppLayoutProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-[6rem_1fr] grid-rows-[auto_1fr] h-screen w-screen',
                className,
            )}
            {...props}
        >
            <HubSidebar
                routes={routes}
                className={classNameSidebar}
                classNameActiveLink={classNameSidebarActiveLink}
                classNameInactiveLink={classNameSidebarInactiveLink}
            />
            <HubHeader
                title={headerTitle}
                logoUrl={headerLogoUrl}
                logoIcon={headerLogoIcon}
                className={classNameHeader}
                classNameTitle={classNameHeaderTitle}
                classNameImage={classNameImage}
            />
            <HubMainContent
                routes={routes}
                className={cn('h-[calc(100vh-4rem)]', classNameMainContent)}
                classNameInnerContainer={classNameMainContentInnerContainer}
            />
        </div>
    );
}
