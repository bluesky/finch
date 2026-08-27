/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AssertTrue, ConformsToFinchHttpRequestOptions } from '../../shared/requestOptions';
import type {
    ArrayStructure,
    TableStructure,
    TiledRequestOptions,
    TiledSearchItem,
} from '../types/common';
import type {
    TiledArrayJSONEndpointOptions,
    TiledArrayJSONOptions,
    TiledArrayReturnType,
    TiledPackageClient,
    TiledTableEndpoint,
    TiledTableJSONEndpointOptions,
    TiledTableReturnType,
} from '../types/packageAliases';
import { useTiledArrayAsJSONQuery, useTiledArrayAsPngQuery } from './arrayHooks';
import { useTiledMetadataQuery } from './metadataHooks';
import {
    useTiledSearchByFullTextQuery,
    useTiledSearchByMetadataEqualsQuery,
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

/**
 * `TiledRequestOptions` honours the cross-backend contract in `@/api/shared/requestOptions`.
 *
 * This one matters more than its queue-server counterpart, because the type is not ours — it comes
 * from `@blueskyproject/tiled`. The day the package renames `apiKey`, drops `signal`, or narrows
 * either, this assertion fails and names the drift. Without it, "`requestOptions` means the same thing
 * on both backends" would quietly stop being true on a dependency bump.
 *
 * `TClient` is `TiledPackageClient`, which is itself derived from this very field — so the `client`
 * leg is a tautology and only its *presence* is checked. That is deliberate: the package does not
 * export the type, and pinning `client` to a hand-written shape would assert our guess about the
 * package rather than the contract. `baseUrl`, `apiKey` (including its `| null`) and `signal` are
 * checked for real, and they are what the contract is about.
 */
type _TiledOptionsConform = AssertTrue<
    ConformsToFinchHttpRequestOptions<TiledRequestOptions, TiledPackageClient>
>;

/**
 * The endpoint-options slot carries **no** transport fields.
 *
 * This is what keeps the array/table slot split honest over time. If the package moves `stack` into
 * `TiledRequestOptions`, or someone re-merges the two slots, `keyof TiledArrayJSONEndpointOptions`
 * becomes a subset of `keyof TiledRequestOptions` and this fails.
 */
type _NoTransportInArrayOptions = AssertTrue<
    keyof TiledArrayJSONEndpointOptions extends keyof TiledRequestOptions ? false : true
>;
type _NoTransportInTableOptions = AssertTrue<
    keyof TiledTableJSONEndpointOptions extends keyof TiledRequestOptions ? false : true
>;

/** …and conversely, the endpoint parameters really did survive the `Omit`. */
const arrayEndpointOptions: TiledArrayJSONEndpointOptions = { stack: [0], isRGB: false };
const tableEndpointOptions: TiledTableJSONEndpointOptions = { partition: 2 };

/** The derived aliases must still line up with the package's own literal unions. */
const arrayFormats: TiledArrayReturnType[] = ['JSON', 'PNG', 'BUFFER', 'IMAGE_PATH'];
const tableFormats: TiledTableReturnType[] = ['JSON', 'JSON_SEQ'];
const tableEndpoints: TiledTableEndpoint[] = ['partition', 'full'];
// @ts-expect-error 'CSV' is not an array format the package supports
const notAnArrayFormat: TiledArrayReturnType = 'CSV';
// The *package's* option type still merges the two, which is why the hooks have to split them.
const arrayOptions: TiledArrayJSONOptions = {
    stack: [0],
    baseUrl: 'http://x/api/v1',
    apiKey: null,
};

// Named as hooks because they call hooks: that satisfies `rules-of-hooks` honestly, rather than
// disabling the rule for a file whose whole purpose is to be type-checked.
function useCallShapeChecks(): void {
    // TanStack options come before transport, on this backend exactly as on the queue server.
    useTiledSearchQuery('experiments', undefined, { refetchInterval: 1000 });
    // Both directions of the slot order are pinned — see the queue server's equivalent for why.
    // @ts-expect-error requestOptions is the last slot; queryOptions comes before it
    useTiledSearchQuery('experiments', undefined, { baseUrl: 'http://other:8000/api/v1' });
    // @ts-expect-error refetchInterval is a TanStack option, not transport
    useTiledSearchQuery('experiments', undefined, undefined, { refetchInterval: 1000 });

    // The hook owns the key and the fetcher; overriding either would detach the entry from the
    // invalidation map.
    // @ts-expect-error queryKey is not overridable
    useTiledSearchQuery('', undefined, { queryKey: ['whatever'] });
    // @ts-expect-error queryFn is not overridable
    useTiledSearchQuery('', undefined, { queryFn: async () => null });

    // Transport overrides are real and typed, in the last slot.
    useTiledSearchQuery('', undefined, undefined, {
        baseUrl: 'http://other:8000/api/v1',
        apiKey: null,
    });
    // @ts-expect-error unknown request option
    useTiledSearchQuery('', undefined, undefined, { nonsense: true });

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

    // The array slot takes the endpoint's own parameters, and only those.
    useTiledArrayAsJSONQuery('scan/detector', { stack: [3], maxBytesAllowed: 1_000_000 });
    // @ts-expect-error `partition` is a table option, not an array one
    useTiledArrayAsJSONQuery('scan/detector', { partition: 1 });
    // @ts-expect-error transport belongs in `requestOptions`, the slot after `queryOptions`
    useTiledArrayAsJSONQuery('scan/detector', { stack: [3], baseUrl: 'http://other:8000/api/v1' });
    // correct: endpoint, TanStack, transport
    useTiledArrayAsJSONQuery(
        'scan/detector',
        { stack: [3] },
        { staleTime: 5_000 },
        { baseUrl: 'http://other:8000/api/v1' },
    );
    // @ts-expect-error the table slot rejects an array option
    useTiledTablePartitionAsJSONQuery('scan/primary', { stack: [0] });

    // Filter values are real values, JSON-encoded by the hook — never hand-quoted.
    useTiledSearchByMetadataEqualsQuery('', { key: 'start.plan_name', value: 'xas_scan' });
    useTiledSearchByMetadataEqualsQuery('', { key: 'start.scan_id', value: 5 });
    useTiledSearchByMetadataEqualsQuery('', { key: 'start.ok', value: true });
    useTiledSearchByMetadataEqualsQuery('', { key: 'start.tag', value: null });
    useTiledSearchQuery('', {
        searchFilters: {
            contains: { key: 'start.plan_name', value: 'xas_scan' },
            in: { key: 'start.scan_id', value: [1, 2] },
        },
    });
    // @ts-expect-error a filter value is a value, not an arbitrary object
    useTiledSearchByMetadataEqualsQuery('', { key: 'start.plan_name', value: { nested: true } });
    // @ts-expect-error `in` takes a list of values, not a single one
    useTiledSearchQuery('', { searchFilters: { in: { key: 'start.scan_id', value: 1 } } });
    // The string-valued filters stay strings — widening them would break them server-side.
    // @ts-expect-error fulltext takes text, not a JSON value
    useTiledSearchQuery('', { searchFilters: { fulltext: { text: 5 } } });
}

function useInferenceChecks(): void {
    // `data` is the endpoint's response, with no annotation.
    const search = useTiledSearchQuery('');
    expectType<number | undefined>(search.data?.meta.count);
    // @ts-expect-error a search result is not a metadata item
    expectType<TiledSearchItem<ArrayStructure> | undefined>(search.data);

    // `select` drives the returned type.
    const items = useTiledSearchQuery('', undefined, { select: (result) => result.data });
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
