import { useEffect, useMemo, useRef } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import {
    isTiledApiError,
    resolveTiledPath,
    useTiledClient,
    useTiledMetadataQuery,
    useTiledSearchQuery,
    type TiledSearchConfig,
} from '@/api/tiled';
import type { TiledSearchItem, TiledSearchResult, TiledStructures } from './types';

/**
 * What one column of the browser shows. The browser keeps a list of these, not fetched results; each
 * column reads its own data through Finch's query hooks.
 *
 * - `search` lists a container (optionally filtered) — `useTiledSearchQuery`.
 * - `item` shows a single node looked up by path — `useTiledMetadataQuery`. Used by search-by-id.
 *
 * `revision` changes when the browser wants the column refetched even though its request did not
 * change (the home button, for example), so newly written runs appear.
 */
export type TiledColumnRequest =
    | {
          kind: 'search';
          path: string;
          config: TiledSearchConfig;
          /** The unfiltered top-level listing; its failure means the server is unreachable. */
          isRoot?: boolean;
          revision?: number;
      }
    | { kind: 'item'; path: string; revision?: number };

/** A search-shaped column holding just `items`, for the single-node lookup. */
const singleItemColumn = (items: TiledSearchItem<TiledStructures>[]): TiledSearchResult => ({
    data: items,
    links: {
        self: '?page[offset]=0&page[limit]=1',
        first: '?page[offset]=0&page[limit]=1',
        last: '?page[offset]=0&page[limit]=1',
        next: null,
        prev: null,
    },
    meta: { count: items.length },
    error: null,
});

export type TiledColumnResult = {
    /** The column's contents, or `undefined` before the first response. */
    result: TiledSearchResult | undefined;
    /** True while there is nothing to show yet, or while a new page/filter replaces old contents. */
    isLoading: boolean;
    /** True only while there is nothing to show yet: the first response has not arrived. */
    isFirstLoad: boolean;
    /** The URL this column reads, without query parameters — for the loading message. */
    requestUrl: string;
    /** Failed attempts so far for the current request. */
    failureCount: number;
};

/**
 * Retry once, and only failures that might go away: network errors, timeouts and 5xx. A 4xx (401 most of all)
 * is the server's answer, so it is surfaced at once — otherwise an app QueryClient's default of three
 * retries with backoff holds the viewer on a spinner for several seconds before the login appears.
 */
const retryTransientFailures = (failureCount: number, error: unknown) => {
    const status = isTiledApiError(error) ? error.status : undefined;
    if (status !== undefined && status < 500) return false;
    return failureCount < 1;
};

/**
 * Read one column through Finch's hooks.
 *
 * Both hooks are always called (hooks cannot be conditional) and the one that does not match the
 * request is disabled. A search keeps the previous page on screen while the next loads. A failed
 * single-node lookup shows an empty column, as "no such id" is an expected answer.
 *
 * @param request The column to read.
 * @param onError Called with a failed search's error, e.g. to route a 401 to the login screen.
 */
export function useTiledColumnResult(
    request: TiledColumnRequest,
    onError?: (error: unknown) => void,
): TiledColumnResult {
    const isSearch = request.kind === 'search';

    const search = useTiledSearchQuery(
        isSearch ? request.path : '',
        isSearch ? request.config : undefined,
        { enabled: isSearch, placeholderData: keepPreviousData, retry: retryTransientFailures },
    );
    const item = useTiledMetadataQuery(isSearch ? '' : request.path, {
        enabled: !isSearch,
        retry: retryTransientFailures,
    });

    const result = useMemo(() => {
        if (isSearch) return search.data;
        if (item.data) return singleItemColumn([item.data]);
        if (item.isError) return singleItemColumn([]);
        return undefined;
    }, [isSearch, search.data, item.data, item.isError]);

    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;
    useEffect(() => {
        if (isSearch && search.error) onErrorRef.current?.(search.error);
    }, [isSearch, search.error]);

    // Refetch when asked to, without changing what the column is.
    const active = isSearch ? search : item;
    const refetchRef = useRef(active.refetch);
    refetchRef.current = active.refetch;
    const seenRevision = useRef(request.revision);
    useEffect(() => {
        if (request.revision === seenRevision.current) return;
        seenRevision.current = request.revision;
        void refetchRef.current();
    }, [request.revision]);

    const { client } = useTiledClient();
    const resolvedPath = resolveTiledPath(request.path, client.getInitialPath());
    const requestUrl = `${client.getBaseUrl()}/${isSearch ? 'search' : 'metadata'}/${resolvedPath}`;

    const failed = isSearch && search.isError;
    const isFirstLoad = result === undefined && !failed;
    const isLoading = isFirstLoad || (isSearch && search.isPlaceholderData);
    return { result, isLoading, isFirstLoad, requestUrl, failureCount: active.failureCount };
}
