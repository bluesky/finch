import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { TiledApiProvider } from '../../api/tiled/runtime/TiledApiProvider';
import type { TiledClientLike } from '../../api/tiled/runtime/clientLike';
import type { TiledSearchItem, TiledSearchResult } from '../../api/tiled/types/common';
import { useTiledRunTableColumns } from '../../components/Tiled/hooks/useTiledRunTableColumns';

const RUN_ID = 'run-uid-1';
const COLUMNS = ['seq_num', 'time', 'motor', 'det'];

function searchResult(): TiledSearchResult {
    return {
        data: [],
        error: null,
        links: { self: 'x', first: 'x', last: 'x', next: null, prev: null },
        meta: { count: 0 },
    };
}

/**
 * A client that answers for the run and its primary stream, and reports `COLUMNS` as the structure of
 * whatever table node is asked for.
 */
function makeStub(options: { hasPrimary?: boolean } = {}) {
    const { hasPrimary = true } = options;
    const metadataPaths: string[] = [];

    const stub: Partial<TiledClientLike> = {
        getSearch: (path: string) => {
            if (path.endsWith('/primary') && !hasPrimary) {
                return Promise.reject(new Error('404'));
            }
            return Promise.resolve(searchResult());
        },
        getMetadata: ((path: string) => {
            metadataPaths.push(path);
            // The completion check reads the run node itself; only the table node has columns.
            const structure = path.endsWith('/internal')
                ? { columns: COLUMNS, npartitions: 1, resizable: true, arrow_schema: '' }
                : {};
            return Promise.resolve({
                id: path,
                attributes: { structure, metadata: {} },
            } as unknown as TiledSearchItem);
        }) as TiledClientLike['getMetadata'],
        getBaseUrl: () => 'http://tiled.test:8000/api/v1',
        getInitialPath: () => '',
        getApiKey: () => undefined,
    };

    return { stub: stub as TiledClientLike, metadataPaths };
}

function renderColumns(client: TiledClientLike, runId: string) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <TiledApiProvider client={client}>{children}</TiledApiProvider>
        </QueryClientProvider>
    );
    return renderHook(() => useTiledRunTableColumns(runId), { wrapper });
}

describe('useTiledRunTableColumns', () => {
    it("reads the columns from the run's primary table", async () => {
        const { stub, metadataPaths } = makeStub();

        const { result } = renderColumns(stub, RUN_ID);

        await waitFor(() => expect(result.current.columns).toEqual(COLUMNS));
        // From the table's own structure — no partition of data is fetched to find the column names.
        expect(metadataPaths).toContain(`${RUN_ID}/primary/internal`);
    });

    it('reports no columns until there is a run to read them from', async () => {
        const { stub } = makeStub();

        const { result } = renderColumns(stub, '');

        expect(result.current.columns).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });

    it('reports no columns while the run has no primary stream yet', async () => {
        const { stub } = makeStub({ hasPrimary: false });

        const { result } = renderColumns(stub, RUN_ID);

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.columns).toEqual([]);
    });
});
