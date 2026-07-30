import { Navigate } from 'react-router';

import type { RouteObject } from 'react-router';
import { RouteItem, RouteTab } from '@/types/navigationRouterTypes';

/** Renders the page body for a route, or for one of its tabs. */
type PageRenderer = (route: RouteItem, tab?: RouteTab) => React.ReactNode;

function trimSlashes(path: string) {
    return path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
}

/**
 * Normalizes a route path to one leading slash and no trailing one.
 *
 * `"data"`, `"/data"` and `"/data/"` all become `"/data"`, and repeated slashes
 * collapse, so a route behaves the same however its path was written. The root path
 * stays `"/"`.
 */
export function toRoutePath(path: string) {
    return `/${trimSlashes(path)}`;
}

/**
 * Prefix that the root route's tabs sit behind.
 *
 * The root has no segment of its own, so its tabs hide behind a reserved `-` rather
 * than taking top-level urls, where they would shadow other routes.
 */
function toTabPrefix(routePath: string) {
    return routePath === '/' ? '-/' : '';
}

/** The path a tab registers beneath its route. */
function toTabChildPath(tab: Pick<RouteTab, 'path' | 'label'>, routePath: string) {
    const segment = trimSlashes(tab.path);
    if (!segment) {
        throw new Error(
            `Tab "${tab.label}" needs a path segment beneath "${routePath}", such as "overview".`,
        );
    }
    return `${toTabPrefix(routePath)}${segment}`;
}

/** The catch-all a tabbed route registers for urls none of its tabs claim. */
function toTabFallbackPath(routePath: string) {
    return `${toTabPrefix(routePath)}*`;
}

/** Joins a path a route registers beneath itself onto the route's own path. */
function toChildUrl(routePath: string, childPath: string) {
    return toRoutePath(`${routePath}/${childPath}`);
}

/**
 * Builds the url of a tab beneath its route, ignoring stray slashes on either path.
 *
 * The tab link, the redirect and the registered route all join the same
 * `toTabChildPath`, so they cannot point at different urls.
 */
export function toTabPath({
    basePath,
    tab,
}: {
    basePath: string;
    tab: Pick<RouteTab, 'path' | 'label'>;
}) {
    const routePath = toRoutePath(basePath);
    return toChildUrl(routePath, toTabChildPath(tab, routePath));
}

/** A url a route config occupies, and how to name it in an error. */
type Page = { url: string; name: string };

/**
 * The first page that lands on a url an earlier page already took.
 *
 * Keys ignore case because React Router does: `/data` and `/Data` are one url, and only
 * the page declared first would ever render.
 */
function findCollision(pages: Page[]) {
    const seen = new Map<string, Page>();
    for (const page of pages) {
        const key = page.url.toLowerCase();
        const earlier = seen.get(key);
        if (earlier) {
            return { earlier, later: page };
        }
        seen.set(key, page);
    }
}

/**
 * Every url a route occupies: its own path, one per tab, and the tab fallback.
 *
 * Routes and tabs share one url space, so they are collected together and checked
 * against each other.
 */
function toPages(route: RouteItem): Page[] {
    const path = toRoutePath(route.path);
    const page = { url: path, name: `the route "${route.label}"` };
    if (!route.tabs?.length) {
        return [page];
    }
    return [
        page,
        ...route.tabs.map((tab) => ({
            url: toTabPath({ basePath: path, tab }),
            name: `the "${tab.label}" tab of "${path}"`,
        })),
        {
            url: toChildUrl(path, toTabFallbackPath(path)),
            name: `the fallback of "${path}"`,
        },
    ];
}

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
export function buildPageRoutes(routes: RouteItem[], renderPage?: PageRenderer): RouteObject[] {
    const collision = findCollision(routes.flatMap(toPages));
    if (collision) {
        const { earlier, later } = collision;
        const caseNote =
            earlier.url === later.url
                ? ''
                : ` Urls ignore case, so "${later.url}" is the same url.`;
        throw new Error(
            `Two pages both resolve to "${earlier.url}": ${earlier.name} and ${later.name}.` +
                `${caseNote} Give each its own path.`,
        );
    }

    return routes.map((route) => {
        const path = toRoutePath(route.path);
        const tabs = route.tabs;
        if (!tabs?.length) {
            return { path, handle: route, element: renderPage?.(route) };
        }

        const redirectToFirstTab = (
            <Navigate to={toTabPath({ basePath: path, tab: tabs[0] })} replace />
        );

        return {
            path,
            handle: route,
            children: [
                { index: true, element: redirectToFirstTab },
                ...tabs.map((tab) => ({
                    path: toTabChildPath(tab, path),
                    element: renderPage?.(route, tab),
                })),
                { path: toTabFallbackPath(path), element: redirectToFirstTab },
            ],
        };
    });
}
