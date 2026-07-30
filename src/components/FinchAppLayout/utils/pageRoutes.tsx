import { Navigate, resolvePath } from 'react-router';

import type { RouteObject } from 'react-router';
import { RouteItem, RouteTab } from '@/types/navigationRouterTypes';

/** Renders the page body for a route, or for one of its tabs. */
export type PageRenderer = (route: RouteItem, tab?: RouteTab) => React.ReactNode;

/**
 * Builds the React Router config for a set of Finch routes.
 *
 * A route with `tabs` becomes a parent route whose children are the tabs, plus an
 * index and a catch-all that both redirect to the first tab. `useRoutes` renders
 * this config and `matchRoutes` ranks against it, so the tab strip and the page on
 * screen can never disagree about which route is active.
 *
 * Omit `renderPage` to build the config for matching only.
 */
export function buildPageRoutes(routes: RouteItem[], renderPage?: PageRenderer): RouteObject[] {
    return routes.map((route) => {
        const tabs = route.tabs;
        if (!tabs?.length) {
            return { path: route.path, handle: route, element: renderPage?.(route) };
        }

        const redirectToFirstTab = <Navigate to={resolvePath(tabs[0].path, route.path)} replace />;
        return {
            path: route.path,
            handle: route,
            children: [
                { index: true, element: redirectToFirstTab },
                ...tabs.map((tab) => ({ path: tab.path, element: renderPage?.(route, tab) })),
                { path: '*', element: redirectToFirstTab },
            ],
        };
    });
}
