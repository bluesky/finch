import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import { useActiveRoute } from '../../components/FinchAppLayout/hooks/useActiveRoute';
import { RouteItem } from '../../types/navigationRouterTypes';

const withCatchAll: RouteItem[] = [
    { path: '*', label: 'Not found', element: <div /> },
    { path: '/data', label: 'Data', element: <div /> },
];

const withDynamicSibling: RouteItem[] = [
    { path: '/data', label: 'Data', tabs: [{ path: 'live', label: 'Live', element: <div /> }] },
    { path: '/data/:id', label: 'Data Item', element: <div /> },
];

const tabbedRoutes: RouteItem[] = [
    { path: '/data', label: 'Data', tabs: [{ path: 'live', label: 'Live', element: <div /> }] },
];

function activeRouteAt(path: string, routes: RouteItem[]) {
    const { result } = renderHook(() => useActiveRoute(routes), {
        wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>,
    });
    return result.current;
}

describe('useActiveRoute', () => {
    it('ignores a catch-all route when a concrete route matches', () => {
        expect(activeRouteAt('/data', withCatchAll)?.label).toBe('Data');
    });

    it('ranks a tab route above a dynamic sibling that could also match', () => {
        expect(activeRouteAt('/data/live', withDynamicSibling)?.label).toBe('Data');
    });

    it('keeps an unknown tab subpath on its parent route', () => {
        expect(activeRouteAt('/data/typo', tabbedRoutes)?.label).toBe('Data');
    });

    it('returns undefined when no route matches', () => {
        expect(activeRouteAt('/nowhere', tabbedRoutes)).toBeUndefined();
    });
});
