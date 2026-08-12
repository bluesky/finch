import { describe, it, expect } from 'vitest';
import { matchRoutes } from 'react-router';
import {
    buildPageRoutes,
    toRoutePath,
    toTabPath,
} from '../../components/FinchAppLayout/utils/pageRoutes';
import { RouteItem } from '../../types/navigationRouterTypes';

function tabbedRoute(routePath: string, tabPath: string): RouteItem[] {
    return [
        {
            path: routePath,
            label: 'Explorer',
            tabs: [{ path: tabPath, label: 'Live', element: <div /> }],
        },
    ];
}

function matchedPaths(routes: RouteItem[], url: string) {
    return matchRoutes(buildPageRoutes(routes), url)?.map((match) => match.route.path);
}

describe('toRoutePath', () => {
    it('gives a route path one leading slash and no trailing one', () => {
        expect(['data', '/data', '/data/', '//data//'].map(toRoutePath)).toEqual([
            '/data',
            '/data',
            '/data',
            '/data',
        ]);
    });

    it('collapses repeated slashes inside a route path', () => {
        expect(toRoutePath('/data//archive')).toBe('/data/archive');
    });

    it('leaves the root path as a single slash', () => {
        expect(toRoutePath('/')).toBe('/');
    });
});

describe('toTabPath', () => {
    it('nests a tab beneath its route however either path was written', () => {
        const urls = [
            { basePath: '/explorer', tab: { path: 'live', label: 'Live' } },
            { basePath: '/explorer', tab: { path: '/live', label: 'Live' } },
            { basePath: 'explorer/', tab: { path: '/live/', label: 'Live' } },
        ].map(toTabPath);
        expect(urls).toEqual(['/explorer/live', '/explorer/live', '/explorer/live']);
    });

    it('collapses repeated slashes inside a tab path', () => {
        expect(
            toTabPath({ basePath: '/explorer', tab: { path: 'live//detail', label: 'Live' } }),
        ).toBe('/explorer/live/detail');
    });

    it('hides a root route tab behind the reserved dash segment', () => {
        expect(toTabPath({ basePath: '/', tab: { path: 'live', label: 'Live' } })).toBe('/-/live');
    });

    it('rejects a tab whose path holds no segment', () => {
        expect(() =>
            toTabPath({ basePath: '/explorer', tab: { path: '/', label: 'Live' } }),
        ).toThrow(/needs a path segment/);
    });
});

describe('buildPageRoutes', () => {
    it('matches a route however its own path was written', () => {
        for (const routePath of ['explorer', '/explorer', '/explorer/']) {
            expect(matchedPaths(tabbedRoute(routePath, 'live'), '/explorer/live')).toEqual([
                '/explorer',
                'live',
            ]);
        }
    });

    it('matches a tab however its path was written', () => {
        for (const tabPath of ['live', '/live', '/live/']) {
            expect(matchedPaths(tabbedRoute('/explorer', tabPath), '/explorer/live')).toEqual([
                '/explorer',
                'live',
            ]);
        }
    });

    it('matches a tab whose path holds repeated slashes', () => {
        expect(
            matchedPaths(tabbedRoute('/explorer', 'live//detail'), '/explorer/live/detail'),
        ).toEqual(['/explorer', 'live/detail']);
    });

    it('does not leak the route path into a tab that repeats it', () => {
        expect(matchedPaths(tabbedRoute('/test', '/testing'), '/test/testing')).toEqual([
            '/test',
            'testing',
        ]);
    });

    it('matches a root route tab beneath the reserved dash segment', () => {
        expect(matchedPaths(tabbedRoute('/', 'live'), '/-/live')).toEqual(['/', '-/live']);
    });

    it('leaves urls outside the dash segment to the rest of the app', () => {
        const routes = [...tabbedRoute('/', 'live'), ...tabbedRoute('/data', 'recent')];
        expect(matchedPaths(routes, '/data/recent')).toEqual(['/data', 'recent']);
        expect(matchedPaths(routes, '/nowhere')).toBeUndefined();
    });

    it('catches an unknown url beneath the dash segment', () => {
        expect(matchedPaths(tabbedRoute('/', 'live'), '/-/bogus')).toEqual(['/', '-/*']);
    });

    it('rejects a tab whose path holds no segment', () => {
        for (const tabPath of ['', '/', '//']) {
            expect(() => buildPageRoutes(tabbedRoute('/explorer', tabPath))).toThrow(
                /needs a path segment/,
            );
        }
    });

    it('rejects two tabs of a route that resolve to the same url', () => {
        const routes: RouteItem[] = [
            {
                path: '/explorer',
                label: 'Explorer',
                tabs: [
                    { path: 'live', label: 'Live', element: <div /> },
                    { path: '/live/', label: 'Also live', element: <div /> },
                ],
            },
        ];
        expect(() => buildPageRoutes(routes)).toThrow(
            /Two pages both resolve to "\/explorer\/live": the "Live" tab of "\/explorer" and the "Also live" tab of "\/explorer"/,
        );
    });

    it('rejects two routes that resolve to the same path', () => {
        const routes: RouteItem[] = [
            { path: 'data', label: 'Data', element: <div /> },
            { path: '/data/', label: 'Archive', element: <div /> },
        ];
        expect(() => buildPageRoutes(routes)).toThrow(
            /Two pages both resolve to "\/data": the route "Data" and the route "Archive"/,
        );
    });

    it('matches a route and its tab however the url was cased', () => {
        expect(matchedPaths(tabbedRoute('/explorer', 'live'), '/Explorer/LIVE')).toEqual([
            '/explorer',
            'live',
        ]);
    });

    it('rejects two routes whose paths differ only by case', () => {
        const routes: RouteItem[] = [
            { path: '/data', label: 'Data', element: <div /> },
            { path: '/Data', label: 'Archive', element: <div /> },
        ];
        expect(() => buildPageRoutes(routes)).toThrow(
            /Two pages both resolve to "\/data": the route "Data" and the route "Archive"\. Urls ignore case, so "\/Data" is the same url\./,
        );
    });

    it('rejects a route that lands on another route tab url', () => {
        const routes: RouteItem[] = [
            ...tabbedRoute('/explorer', 'live'),
            { path: '/explorer/live', label: 'Live page', element: <div /> },
        ];
        expect(() => buildPageRoutes(routes)).toThrow(
            /Two pages both resolve to "\/explorer\/live": the "Live" tab of "\/explorer" and the route "Live page"/,
        );
    });

    it('rejects a route that lands on a root route tab url', () => {
        const routes: RouteItem[] = [
            ...tabbedRoute('/', 'live'),
            { path: '/-/live', label: 'Other', element: <div /> },
        ];
        expect(() => buildPageRoutes(routes)).toThrow(
            /Two pages both resolve to "\/-\/live": the "Live" tab of "\/" and the route "Other"/,
        );
    });

    it('rejects two tabbed routes that both catch unknown urls', () => {
        const routes = [...tabbedRoute('/', 'live'), ...tabbedRoute('/-', 'daily')];
        expect(() => buildPageRoutes(routes)).toThrow(
            /Two pages both resolve to "\/-\/\*": the fallback of "\/" and the fallback of "\/-"/,
        );
    });

    it('keeps a route beneath the dash segment that takes no tab url', () => {
        const routes: RouteItem[] = [
            ...tabbedRoute('/', 'live'),
            { path: '/-/reports', label: 'Reports', element: <div /> },
        ];
        expect(matchedPaths(routes, '/-/reports')).toEqual(['/-/reports']);
    });
});
