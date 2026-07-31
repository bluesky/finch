import { useMemo } from 'react';
import { matchRoutes, useLocation } from 'react-router';

import { buildPageRoutes } from '../utils/pageRoutes';
import { RouteItem } from '@/types/navigationRouterTypes';

/**
 * Returns the route matching the current location, if any.
 *
 * Ranking runs against the same config `FinchMainContent` renders, so the answer
 * always agrees with the page on screen. The config is rebuilt only when `routes`
 * changes, since three components call this hook on every navigation.
 */
export function useActiveRoute(routes: RouteItem[]) {
    const location = useLocation();
    const pageRoutes = useMemo(() => buildPageRoutes(routes), [routes]);
    return matchRoutes(pageRoutes, location)?.[0]?.route.handle as RouteItem | undefined;
}
