import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getSearchResults, TiledSearchConfig } from '@blueskyproject/tiled';
import { useTiledApiUrls } from 'src/utils/apiUtils';

async function searchById(config: TiledSearchConfig): Promise<unknown | null> {
    try {
        return await getSearchResults(config);
    } catch {
        return null;
    }
}

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
};

export const useTiledWriterMultiScatterPlot = (
    blueskyRunIds: string[],
    options: UseTiledWriterMultiScatterPlotOptions = {},
): UseTiledWriterMultiScatterPlotReturn => {
    const { httpBaseUrl, apiKey: rawApiKey } = useTiledApiUrls();
    const baseUrl = options.tiledBaseUrl ?? httpBaseUrl;
    const apiKey = rawApiKey ?? undefined;

    const primaryQueries = useQueries({
        queries: blueskyRunIds.map((id) => ({
            queryKey: ['tiled', 'searchById', baseUrl, { path: `${id}/primary` }],
            queryFn: () => searchById({ baseUrl, apiKey, path: `${id}/primary` }),
            enabled: !!id?.trim(),
            retry: false,
        })),
    });

    const tiledPaths = useMemo(
        () =>
            blueskyRunIds.map((id, i) => {
                const primaryFound = primaryQueries[i]?.isSuccess && !!primaryQueries[i]?.data;
                return primaryFound ? `${id}/primary/internal` : null;
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
