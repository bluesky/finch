import { describe, expect, it } from 'vitest';
import {
    buildArraySlice,
    computeDownsampleSteps,
    getDisplayShape,
} from '../../api/tiled/client/arraySlicing';
import { parseJsonSequence, resolveFormat, TILED_FORMATS } from '../../api/tiled/client/formats';
import { buildDistinctParams, buildSearchOptionParams } from '../../api/tiled/client/searchParams';
import {
    encodeTiledPath,
    formatIndexTuple,
    normalizeTiledBaseUrl,
    normalizeTiledPath,
    resolveTiledPath,
    tiledOriginFromBaseUrl,
} from '../../api/tiled/client/urlUtils';
import { TiledApiError, toTiledApiError } from '../../api/tiled/types/errors';
import type { ArrayStructure } from '../../api/tiled/types/structures';

/**
 * Unit tests for the client's internals — the parts with real logic, as opposed to the endpoint
 * methods, which are thin and are covered end to end by the registry sweep against a live server.
 *
 * Several of these pin behaviour that was verified against Tiled 0.2.15b1 and would otherwise be
 * easy to "simplify" back into a bug.
 */

const arrayStructure = (shape: number[], itemsize = 8): ArrayStructure => ({
    data_type: { endianness: 'little', kind: 'f', itemsize, dt_units: null },
    chunks: [shape],
    shape,
    dims: null,
    resizable: false,
});

describe('path and URL handling', () => {
    it('normalizes paths to bare segments', () => {
        expect(normalizeTiledPath('/scan//primary/')).toBe('scan/primary');
        expect(normalizeTiledPath('')).toBe('');
        expect(normalizeTiledPath('///')).toBe('');
    });

    /**
     * A node path is multi-segment, so its separators must survive encoding.
     *
     * `encodeURIComponent(path)` would turn them into `%2F` and address a single node whose name
     * contains a slash — a different, almost certainly nonexistent node.
     */
    it('encodes each path segment separately, keeping the separators', () => {
        expect(encodeTiledPath('scan/primary')).toBe('scan/primary');
        expect(encodeTiledPath('a b/c#d')).toBe('a%20b/c%23d');
        expect(encodeTiledPath('')).toBe('');
    });

    it('applies the initial path, unless the mode says absolute', () => {
        expect(resolveTiledPath('scan', 'data')).toBe('data/scan');
        expect(resolveTiledPath('scan', '/data/')).toBe('data/scan');
        expect(resolveTiledPath('', 'data')).toBe('data');
        expect(resolveTiledPath('scan', 'data', 'absolute')).toBe('scan');
        expect(resolveTiledPath('scan', '')).toBe('scan');
    });

    it('strips trailing slashes from a base URL', () => {
        expect(normalizeTiledBaseUrl('http://h:8000/api/v1/')).toBe('http://h:8000/api/v1');
    });

    /**
     * The origin is everything before the **last** `/api/v1`.
     *
     * A server mounted under a sub-path is the case that makes "last" matter; a base URL with no
     * version segment is returned unchanged rather than guessed at.
     */
    it('derives the origin behind an api base URL', () => {
        expect(tiledOriginFromBaseUrl('http://h:8000/api/v1')).toBe('http://h:8000');
        expect(tiledOriginFromBaseUrl('https://h/tiled/api/v1')).toBe('https://h/tiled');
        expect(tiledOriginFromBaseUrl('http://h:8000')).toBe('http://h:8000');
    });

    it('formats index tuples the way the block/offset/shape parameters want', () => {
        expect(formatIndexTuple([0, 2])).toBe('0,2');
        expect(formatIndexTuple([])).toBe('');
    });
});

describe('array downsampling', () => {
    it('reads the display shape off the last two axes', () => {
        expect(getDisplayShape(arrayStructure([10, 20]))).toEqual({
            height: 10,
            width: 20,
            channels: 1,
        });
        expect(getDisplayShape(arrayStructure([5, 10, 20]))).toEqual({
            height: 10,
            width: 20,
            channels: 1,
        });
    });

    it('treats a trailing 3-axis as RGB when asked', () => {
        expect(getDisplayShape(arrayStructure([10, 20, 3]), { isRGB: true })).toEqual({
            height: 10,
            width: 20,
            channels: 3,
        });
        expect(
            getDisplayShape(arrayStructure([3, 10, 20]), { isRGB: true, channelFirst: true }),
        ).toEqual({ height: 10, width: 20, channels: 3 });
    });

    it('prefers an explicit ratio over the byte budget', () => {
        const steps = computeDownsampleSteps(arrayStructure([10000, 10000]), {
            downSampleRatio: 4,
            maxBytesAllowed: 1,
        });
        expect(steps).toEqual({ stepX: 4, stepY: 4 });
    });

    it('strides both axes to fit the byte budget', () => {
        // 100×100 float64 = 80 000 bytes; a 20 000-byte budget is 4× over, so sqrt(4) = 2.
        expect(
            computeDownsampleSteps(arrayStructure([100, 100]), { maxBytesAllowed: 20_000 }),
        ).toEqual({ stepX: 2, stepY: 2 });
    });

    it('does not downsample what already fits', () => {
        expect(
            computeDownsampleSteps(arrayStructure([10, 10]), { maxBytesAllowed: 1_000_000 }),
        ).toEqual({ stepX: 1, stepY: 1 });
    });

    /**
     * A structure that is not an array structure must not reach the arithmetic.
     *
     * Found by sweeping the endpoint registry against a live server: pointing an array read at a
     * table fetched the table's structure, which has no `shape`, and `shape.length` threw a
     * `TypeError` from inside the downsampling maths — three layers from the mistake and nothing
     * like the real error. Treating it as "no structure" sends the request and lets the server
     * answer with the 404 that actually explains the problem.
     */
    it('ignores a structure that is not an array structure', () => {
        const tableStructure = {
            arrow_schema: 'x',
            npartitions: 1,
            columns: ['a'],
            resizable: false,
        } as unknown as ArrayStructure;

        expect(() => buildArraySlice({ structure: tableStructure })).not.toThrow();
        expect(buildArraySlice({ structure: tableStructure })).toBe('::1,::1');
        expect(computeDownsampleSteps(tableStructure, {})).toEqual({ stepX: 1, stepY: 1 });
    });

    it('builds slices with stack indices and RGB axes', () => {
        expect(buildArraySlice({})).toBe('::1,::1');
        expect(buildArraySlice({ stack: [5] })).toBe('5,::1,::1');
        expect(buildArraySlice({ isRGB: true })).toBe('::1,::1,:');
        expect(buildArraySlice({ isRGB: true, channelFirst: true })).toBe(':,::1,::1');
    });
});

describe('formats', () => {
    it('resolves a format name or a raw media type to the same spec', () => {
        expect(resolveFormat('PNG')).toEqual(TILED_FORMATS.PNG);
        expect(resolveFormat('image/png')).toEqual(TILED_FORMATS.PNG);
    });

    /**
     * An unknown media type is passed through rather than rejected.
     *
     * A server may support a format this table does not name — `About.formats` lists several this
     * client has no entry for — and handing back bytes is more useful than refusing.
     */
    it('passes an unknown media type through as bytes', () => {
        expect(resolveFormat('application/x-weird')).toEqual({
            accept: 'application/x-weird',
            responseType: 'blob',
        });
    });

    it('parses a newline-delimited JSON sequence', () => {
        expect(parseJsonSequence('{"a":1}\n{"a":2}\n')).toEqual([{ a: 1 }, { a: 2 }]);
        expect(parseJsonSequence('')).toEqual([]);
    });

    /** Tiled prefixes records with RFC 7464 separators on some routes. */
    it('strips record separators', () => {
        expect(parseJsonSequence('\x1e{"a":1}\n\x1e{"a":2}')).toEqual([{ a: 1 }, { a: 2 }]);
    });

    it('tolerates a body axios already parsed', () => {
        expect(parseJsonSequence([{ a: 1 }])).toEqual([{ a: 1 }]);
        expect(parseJsonSequence({ a: 1 })).toEqual([{ a: 1 }]);
        expect(() => parseJsonSequence(42)).toThrow();
    });
});

describe('search options', () => {
    it('maps camelCase options to the spec parameter names', () => {
        expect(
            buildSearchOptionParams({
                pageOffset: 10,
                pageLimit: 5,
                sort: 'start.time',
                selectMetadata: 'start',
                maxDepth: 2,
                omitLinks: true,
                includeDataSources: false,
                fields: ['specs'],
            }),
        ).toEqual({
            'page[offset]': 10,
            'page[limit]': 5,
            sort: 'start.time',
            select_metadata: 'start',
            max_depth: 2,
            omit_links: true,
            include_data_sources: false,
            fields: ['specs'],
        });
    });

    /** Cursor pagination was in the spec all along and the package never sent it. */
    it('supports cursor pagination', () => {
        expect(buildSearchOptionParams({ pageCursor: 7 })).toEqual({ 'page[cursor]': 7 });
    });

    it('omits what was not asked for', () => {
        expect(buildSearchOptionParams({})).toEqual({});
        expect(buildSearchOptionParams(undefined)).toEqual({});
        expect(buildSearchOptionParams({ fields: [] })).toEqual({});
    });

    it('builds distinct facets alongside the shared filters', () => {
        expect(
            buildDistinctParams({
                structureFamilies: true,
                counts: true,
                metadata: ['start.plan_name'],
                searchFilters: { fulltext: { text: 'x' } },
            }),
        ).toEqual({
            structure_families: true,
            counts: true,
            metadata: ['start.plan_name'],
            'filter[fulltext][condition][text]': 'x',
        });
    });
});

describe('errors', () => {
    it('reads FastAPI validation detail into a named error', () => {
        const error = toTiledApiError(
            {
                isAxiosError: true,
                message: 'Request failed',
                response: {
                    status: 422,
                    data: { detail: [{ loc: ['body', 'specs'], msg: 'field required' }] },
                },
            },
            'POST',
            '/metadata/x',
        );

        expect(error).toBeInstanceOf(TiledApiError);
        const apiError = error as TiledApiError;
        expect(apiError.status).toBe(422);
        expect(apiError.isValidationError).toBe(true);
        expect(apiError.validationErrors).toHaveLength(1);
        expect(apiError.message).toContain('body.specs: field required');
    });

    it("reads Tiled's own error envelope", () => {
        const error = toTiledApiError(
            {
                isAxiosError: true,
                message: 'Request failed',
                response: { status: 404, data: { detail: 'No such entry' } },
            },
            'GET',
            '/metadata/x',
        ) as TiledApiError;

        expect(error.status).toBe(404);
        expect(error.isValidationError).toBe(false);
        expect(error.message).toBe('GET /metadata/x failed with 404: No such entry');
    });

    /**
     * A cancelled request is not an API failure.
     *
     * Wrapping it would hide the `AbortError` name that TanStack checks for, turning an unmount
     * into a rendered error state.
     */
    it('lets an AbortError through untouched', () => {
        const abort = new Error('aborted');
        abort.name = 'AbortError';
        expect(toTiledApiError(abort, 'GET', '/x')).toBe(abort);
    });

    it('describes a network failure with no status', () => {
        const error = toTiledApiError(
            { isAxiosError: true, message: 'Network Error', response: undefined },
            'GET',
            '/x',
        ) as TiledApiError;
        expect(error.status).toBeUndefined();
        expect(error.message).toBe('GET /x failed: Network Error');
    });
});
