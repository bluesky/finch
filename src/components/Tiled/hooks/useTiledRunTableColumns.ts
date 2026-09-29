import { useTiledMetadataQuery } from '@/api/tiled';
import type { TableStructure } from '@/api/tiled';
import { useTiledWriterScatterPlot } from './useTiledWriterScatterPlot';

type UseTiledRunTableColumnsReturn = {
    /** Column names of the run's primary table, or `[]` while none is known. */
    columns: string[];
    /** `true` while the run's table is being located or its metadata read. */
    isLoading: boolean;
};

type UseTiledRunTableColumnsOptions = {
    /** When `true`, skips the polling that waits for an ongoing run's data to appear. */
    isRunFinished?: boolean;
    /** The base url for the tiled server, ex) http://localhost:8000/api/v1 */
    tiledBaseUrl?: string;
    /** The initial path to use for the tiled search, ex) beamline531 */
    initialPath?: string;
};

/**
 * The column names of a bluesky run's primary table.
 *
 * Tiled reports them in the table node's own structure, so this is one metadata request rather than a
 * data fetch — no partition is downloaded to find out what the columns are called.
 *
 * The path to that node is resolved by `useTiledWriterScatterPlot`, the same hook the plot uses; both
 * calls share a query cache entry, so asking here costs no extra requests and the columns arrive in
 * step with the data being plotted.
 */
export const useTiledRunTableColumns = (
    blueskyRunId: string,
    options: UseTiledRunTableColumnsOptions = {},
): UseTiledRunTableColumnsReturn => {
    const { isRunFinished, tiledBaseUrl, initialPath } = options;

    const { tiledPath, isLoading: isPathLoading } = useTiledWriterScatterPlot(blueskyRunId, {
        isRunFinished,
        tiledBaseUrl,
        initialPath,
    });

    const columnsQuery = useTiledMetadataQuery<TableStructure, string[]>(
        tiledPath ?? '',
        {
            retry: false,
            // A node that is not a table has no `columns`; report that as "none known" rather than
            // letting `undefined` reach the caller.
            select: (item) => item?.attributes?.structure?.columns ?? [],
        },
        { baseUrl: tiledBaseUrl },
    );

    return {
        columns: columnsQuery.data ?? [],
        isLoading: isPathLoading || columnsQuery.isLoading,
    };
};
