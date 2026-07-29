import { matchRoutes, useLocation } from 'react-router';

import { buildPageRoutes } from '@/lib/pageRoutes';
import { RouteItem } from '@/types/navigationRouterTypes';

/**
 * Returns the route matching the current location, if any.
 *
 * Ranking runs against the same config `FinchMainContent` renders, so the answer
 * always agrees with the page on screen.
 */
export function useActiveRoute(routes: RouteItem[]) {
    const location = useLocation();
    const matches = matchRoutes(buildPageRoutes(routes), location);
    return matches?.[0]?.route.handle as RouteItem | undefined;
}
