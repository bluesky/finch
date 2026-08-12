import { RouteItem } from '../../../types/navigationRouterTypes';
/**
 * Returns the route matching the current location, if any.
 *
 * Ranking runs against the same config `FinchMainContent` renders, so the answer
 * always agrees with the page on screen. The config is rebuilt only when `routes`
 * changes, since three components call this hook on every navigation.
 */
export declare function useActiveRoute(routes: RouteItem[]): RouteItem | undefined;
//# sourceMappingURL=useActiveRoute.d.ts.map