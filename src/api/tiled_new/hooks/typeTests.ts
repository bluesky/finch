/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ArrayStructure, TableStructure, TiledSearchItem } from '../types/common';
import type {
    TiledArrayJSONOptions,
    TiledArrayReturnType,
    TiledTableEndpoint,
    TiledTableReturnType,
} from '../types/packageAliases';
import { useTiledArrayAsJSONQuery, useTiledArrayAsPngQuery } from './arrayHooks';
import { useTiledMetadataQuery } from './metadataHooks';
import {
    useTiledSearchByFullTextQuery,
    useTiledSearchBySpecsQuery,
    useTiledSearchQuery,
} from './searchHooks';
import { useTiledTablePartitionAsJSONQuery } from './tableHooks';

/**
 * Compile-time assertions for the Tiled hook call shapes.
 *
 * This file is never imported and never runs — it exists so `tsc` checks the guarantees the hooks
 * promise. It lives here rather than in `src/testing/` because `tsconfig.json` excludes that folder,
 * so a `@ts-expect-error` in a test file would never be verified by `npm run build`.
 *
 * Each `@ts-expect-error` below *must* keep erroring; if one of them ever compiles, `tsc` fails with
 * "unused '@ts-expect-error' directive" and this file tells you which guarantee broke.
 */

declare function expectType<T>(value: T): void;

/** The derived aliases must still line up with the package's own literal unions. */
const arrayFormats: TiledArrayReturnType[] = ['JSON', 'PNG', 'BUFFER', 'IMAGE_PATH'];
const tableFormats: TiledTableReturnType[] = ['JSON', 'JSON_SEQ'];
const tableEndpoints: TiledTableEndpoint[] = ['partition', 'full'];
// @ts-expect-error 'CSV' is not an array format the package supports
const notAnArrayFormat: TiledArrayReturnType = 'CSV';
// The array options must still carry both the endpoint and the transport fields.
const arrayOptions: TiledArrayJSONOptions = {
    stack: [0],
    baseUrl: 'http://x/api/v1',
    apiKey: null,
};

// Named as hooks because they call hooks: that satisfies `rules-of-hooks` honestly, rather than
// disabling the rule for a file whose whole purpose is to be type-checked.
function useCallShapeChecks(): void {
    // Position 2 is request options, not TanStack options — the legacy call shape.
    // @ts-expect-error refetchInterval belongs in the fourth parameter
    useTiledSearchQuery('experiments', undefined, { refetchInterval: 1000 });
    useTiledSearchQuery('experiments', undefined, {}, { refetchInterval: 1000 }); // correct

    // The hook owns the key and the fetcher; overriding either would detach the entry from the
    // invalidation map.
    // @ts-expect-error queryKey is not overridable
    useTiledSearchQuery('', undefined, {}, { queryKey: ['whatever'] });
    // @ts-expect-error queryFn is not overridable
    useTiledSearchQuery('', undefined, {}, { queryFn: async () => null });

    // Transport overrides are real and typed.
    useTiledSearchQuery('', undefined, { baseUrl: 'http://other:8000/api/v1', apiKey: null });
    // @ts-expect-error unknown request option
    useTiledSearchQuery('', undefined, { nonsense: true });

    // A convenience search takes its own filter type, not another's and not a bare string.
    useTiledSearchBySpecsQuery('', { include: ['BlueskyRun'], exclude: [] });
    // @ts-expect-error that is a fulltext filter, not a specs filter
    useTiledSearchBySpecsQuery('', { text: 'myrun' });
    // @ts-expect-error `exclude` is required on a specs filter
    useTiledSearchBySpecsQuery('', { include: ['BlueskyRun'] });
    // @ts-expect-error the filter is required
    useTiledSearchByFullTextQuery('');

    // Paths are required — there is no argument-less overload to fall into by accident.
    // @ts-expect-error path is required
    useTiledMetadataQuery();
    // @ts-expect-error arrayPath is required
    useTiledArrayAsJSONQuery();

    // Array options accept both endpoint and transport fields in one object.
    useTiledArrayAsJSONQuery('scan/detector', { stack: [3], maxBytesAllowed: 1_000_000 });
    // @ts-expect-error `partition` is a table option, not an array one
    useTiledArrayAsJSONQuery('scan/detector', { partition: 1 });
}

function useInferenceChecks(): void {
    // `data` is the endpoint's response, with no annotation.
    const search = useTiledSearchQuery('');
    expectType<number | undefined>(search.data?.meta.count);
    // @ts-expect-error a search result is not a metadata item
    expectType<TiledSearchItem<ArrayStructure> | undefined>(search.data);

    // `select` drives the returned type.
    const items = useTiledSearchQuery('', undefined, {}, { select: (result) => result.data });
    expectType<TiledSearchItem<import('../types/common').TiledStructures>[] | undefined>(
        items.data,
    );

    // The metadata hook's structure parameter reaches `data`.
    const array = useTiledMetadataQuery<ArrayStructure>('scan/detector');
    expectType<number[] | undefined>(array.data?.attributes.structure.shape);
    const table = useTiledMetadataQuery<TableStructure>('scan/primary');
    expectType<string[] | undefined>(table.data?.attributes.structure.columns);
    // @ts-expect-error a TableStructure has no `shape`
    expectType<number[] | undefined>(table.data?.attributes.structure.shape);

    // The array JSON hook's response shape is overridable, and defaults to number[][].
    const frame = useTiledArrayAsJSONQuery('scan/detector');
    expectType<number[][] | undefined>(frame.data);
    const cube = useTiledArrayAsJSONQuery<number[][][]>('scan/detector');
    expectType<number[][][] | undefined>(cube.data);

    // A PNG read resolves a Blob, and a column-oriented table read a record of columns.
    const png = useTiledArrayAsPngQuery('scan/detector');
    expectType<Blob | undefined>(png.data);
    const columns = useTiledTablePartitionAsJSONQuery('scan/primary');
    expectType<unknown[] | undefined>(columns.data?.['I0']);

    // Server info can legitimately be null; that is not an error state.
    const info = useTiledSearchQuery('');
    expectType<boolean>(info.isError);
}
