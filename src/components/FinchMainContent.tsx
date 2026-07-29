import { useRoutes } from 'react-router';
import FinchPageTabs from '@/components/FinchPageTabs';
import { useActiveRoute } from '@/hooks/useActiveRoute';
import { buildPageRoutes } from '@/lib/pageRoutes';
import { cn } from '@/lib/utils';

import { RouteItem, RouteTab } from '@/types/navigationRouterTypes';

export type FinchMainContentProps = {
    /** Route definitions used to render the matched page component via React Router. */
    routes: RouteItem[];
    /** Additional CSS classes applied to the main outer element. */
    className?: string;
    /** Additional CSS classes applied to the scrolling element that holds the page padding. */
    classNameScrollContainer?: string;
    /** Additional CSS classes applied to the inner element directly rendering the route element. */
    classNameInnerContainer?: string;
    /** Additional CSS classes applied to the page tab strip. */
    classNamePageTabs?: string;
    /** Additional CSS classes applied to the active page tab. */
    classNamePageTabsActive?: string;
    /** Additional CSS classes applied to inactive page tabs. */
    classNamePageTabsInactive?: string;
};
export default function FinchMainContent({
    routes,
    className,
    classNameScrollContainer,
    classNameInnerContainer,
    classNamePageTabs,
    classNamePageTabsActive,
    classNamePageTabsInactive,
    ...props
}: FinchMainContentProps) {
    const activeRoute = useActiveRoute(routes);

    const page = (route: RouteItem, tab?: RouteTab) => {
        const item = tab ?? route;
        const isBackgroundTransparent =
            tab?.isBackgroundTransparent ?? route.isBackgroundTransparent;
        return (
            <section
                className={cn(
                    isBackgroundTransparent ? 'bg-transparent text-white' : 'bg-white',
                    'w-full h-full rounded-md',
                    classNameInnerContainer,
                    route.classNameContainer,
                    tab?.classNameContainer,
                )}
            >
                {item.element}
            </section>
        );
    };

    const pages = useRoutes(buildPageRoutes(routes, page));

    return (
        <main
            className={cn('bg-sky-900 h-full w-full flex flex-col overflow-hidden', className)}
            {...props}
        >
            {activeRoute?.tabs?.length ? (
                <FinchPageTabs
                    basePath={activeRoute.path}
                    tabs={activeRoute.tabs}
                    className={classNamePageTabs}
                    classNameActiveTab={classNamePageTabsActive}
                    classNameInactiveTab={classNamePageTabsInactive}
                />
            ) : null}
            <div className={cn('flex-1 min-h-0 overflow-y-auto p-8', classNameScrollContainer)}>
                {pages}
            </div>
        </main>
    );
}
