import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getTiledSearch, tiledQueryKeys, useTiledQueryScope } from '@/api/tiled';
import { useTiledApiUrls } from 'src/utils/apiUtils';
import { cleanTiledInitialPath } from 'src/components/Tiled/utils/tiledUtils';

type UseTiledWriterMultiScatterPlotReturn = {
    /** Resolved Tiled paths, one per run ID. `null` while the path is still being located. */
    tiledPaths: (string | null)[];
    /** `true` while any path is still being resolved. */
    isLoading: boolean;
    /** Per-run error/status messages. Empty array when all paths resolved successfully. */
    errors: (string | null)[];
};

type UseTiledWriterMultiScatterPlotOptions = {
    /** The base URL for the Tiled server, e.g. `http://localhost:8000/api/v1`. */
    tiledBaseUrl?: string;
    /** The initial path to use for the Tiled search, e.g. `beamline531`. */
    initialPath?: string;
};

export const useTiledWriterMultiScatterPlot = (
    blueskyRunIds: string[],
    options: UseTiledWriterMultiScatterPlotOptions = {},
): UseTiledWriterMultiScatterPlotReturn => {
    const { httpBaseUrl, apiKey: rawApiKey } = useTiledApiUrls();
    const baseUrl = options.tiledBaseUrl ?? httpBaseUrl;
    const apiKey = rawApiKey ?? undefined;
    const startPath =
        options.initialPath && options.initialPath.trim()
            ? `${cleanTiledInitialPath(options.initialPath)}/`
            : '';

    // One query per run, so this cannot use the search hook — but it uses the same key factory and
    // the same request function, so its entries sit alongside the hooks' in the cache and are
    // refreshed by the same `['tiled','search']` invalidation. (The old hand-written key,
    // `['tiled','searchById',baseUrl,{path}]`, matched nothing else in the app.)
    const scope = useTiledQueryScope({ baseUrl, initialPath: '' });
    const primaryQueries = useQueries({
        queries: blueskyRunIds.map((id) => ({
            queryKey: tiledQueryKeys.search(scope, {
                searchPath: `${startPath}${id}/primary`,
                config: null,
            }),
            queryFn: () =>
                getTiledSearch(`${startPath}${id}/primary`, undefined, { baseUrl, apiKey }),
            enabled: !!id?.trim(),
            retry: false,
        })),
    });

    const tiledPaths = useMemo(
        () =>
            blueskyRunIds.map((id, i) => {
                const primaryFound = primaryQueries[i]?.isSuccess && !!primaryQueries[i]?.data;
                return primaryFound ? `${startPath}${id}/primary/internal` : null;
            }),
        [blueskyRunIds, primaryQueries],
    );

    const isLoading = primaryQueries.some((q) => q.isLoading);

    const errors = useMemo(() => {
        const perRun = blueskyRunIds.map((id, i) => {
            if (tiledPaths[i]) return null;
            if (!id?.trim()) return 'No run ID provided';
            return `No data path found for run ${id}`;
        });
        return perRun.every((e) => e === null) ? [] : perRun;
    }, [blueskyRunIds, tiledPaths]);

    return { tiledPaths, isLoading, errors };
};
