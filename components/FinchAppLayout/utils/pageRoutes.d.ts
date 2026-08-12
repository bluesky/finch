import { RouteObject } from 'react-router';
import { RouteItem, RouteTab } from '../../../types/navigationRouterTypes';
/** Renders the page body for a route, or for one of its tabs. */
type PageRenderer = (route: RouteItem, tab?: RouteTab) => React.ReactNode;
/**
 * Normalizes a route path to one leading slash and no trailing one.
 *
 * `"data"`, `"/data"` and `"/data/"` all become `"/data"`, and repeated slashes
 * collapse, so a route behaves the same however its path was written. The root path
 * stays `"/"`.
 */
export declare function toRoutePath(path: string): string;
/**
 * Builds the url of a tab beneath its route, ignoring stray slashes on either path.
 *
 * The tab link, the redirect and the registered route all join the same
 * `toTabChildPath`, so they cannot point at different urls.
 */
export declare function toTabPath({ basePath, tab, }: {
    basePath: string;
    tab: Pick<RouteTab, 'path' | 'label'>;
}): string;
/**
 * Builds the React Router config for a set of Finch routes.
 *
 * A route with `tabs` becomes a parent route whose children are the tabs, plus an
 * index and a catch-all that both redirect to the first tab. `useRoutes` renders
 * this config and `matchRoutes` ranks against it, so the tab strip and the page on
 * screen can never disagree about which route is active.
 *
 * Throws when a tab path holds no segment, and when two pages resolve to the same
 * url. Urls that differ only by case are the same url, since routes match without case.
 *
 * Omit `renderPage` to build the config for matching only.
 */
export declare function buildPageRoutes(routes: RouteItem[], renderPage?: PageRenderer): RouteObject[];
export {};
//# sourceMappingURL=pageRoutes.d.ts.map