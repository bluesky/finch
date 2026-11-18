import { useContext, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientContext, QueryClientProvider } from '@tanstack/react-query';

/**
 * Gives the viewer a TanStack `QueryClient` without requiring the app to provide one.
 *
 * Inside an app that already has a `QueryClientProvider`, this renders its children unchanged, so the
 * viewer shares that cache (and its invalidation) with every other Finch Tiled hook. Outside one, it
 * creates a private client so `<TiledFinder>` keeps working as a drop-in component.
 *
 * The private client does not retry and does not refetch on window focus, matching how the viewer
 * behaved before it used TanStack Query. An app-provided client keeps its own defaults.
 */
export default function TiledFinderQueryBoundary({ children }: { children: ReactNode }) {
    const existing = useContext(QueryClientContext);
    const fallback = useRef<QueryClient | null>(null);

    if (existing) return <>{children}</>;

    if (!fallback.current) {
        fallback.current = new QueryClient({
            defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
        });
    }
    return <QueryClientProvider client={fallback.current}>{children}</QueryClientProvider>;
}
