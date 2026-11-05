import axios from 'axios';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TiledApiClient } from '../../api/tiled/client/TiledApiClient';
import { TiledApiError } from '../../api/tiled/types/errors';

/**
 * End-to-end against a real Tiled server, for the surface Tiled 0.2.19 added or changed. Skipped
 * unless `TILED_LIVE_URL` is set:
 *
 *     TILED_LIVE_URL=http://localhost:8000/api/v1 TILED_LIVE_API_KEY=secret \
 *         npx vitest run TiledApi.live
 *
 * Needs a catalog-backed server (for the graph route and deep search) with `expose_raw_assets` left
 * on. Writes go under a throwaway key in `TILED_LIVE_PARENT` (default: the root), deleted afterwards.
 */
const LIVE_URL = process.env.TILED_LIVE_URL;
const API_KEY = process.env.TILED_LIVE_API_KEY;
const PARENT = process.env.TILED_LIVE_PARENT ?? '';
const KEY = `api-live-${Date.now()}`;
const NODE = PARENT ? `${PARENT}/${KEY}` : KEY;

const http = new TiledApiClient({
    baseUrl: LIVE_URL,
    apiKey: API_KEY ?? null,
    client: axios.create({ adapter: 'http' }),
});

const container = (id: string, extra: Record<string, unknown> = {}) =>
    ({
        id,
        structure_family: 'container',
        metadata: {},
        specs: [],
        data_sources: [],
        ...extra,
    }) as never;

/** Reject with the TiledApiError a call produced, or fail if it resolved. */
async function rejection(promise: Promise<unknown>): Promise<TiledApiError> {
    try {
        await promise;
    } catch (error) {
        expect(error).toBeInstanceOf(TiledApiError);
        return error as TiledApiError;
    }
    throw new Error('expected a rejection');
}

describe.skipIf(!LIVE_URL)('Tiled 0.2.19 surface, live', () => {
    beforeAll(async () => {
        // NODE ─┬─ inner ── arr (array, color: red)
        //       └─ leaf (container)
        await http.createNode(PARENT, container(KEY, { access_tags: [] }));
        await http.createNode(NODE, container('inner'));
        await http.createNode(NODE, container('leaf'));
        await http.createNode(`${NODE}/inner`, {
            id: 'arr',
            structure_family: 'array',
            metadata: { color: 'red' },
            specs: [],
            data_sources: [
                {
                    structure_family: 'array',
                    structure: {
                        data_type: { endianness: 'little', kind: 'f', itemsize: 8, dt_units: null },
                        chunks: [[3]],
                        shape: [3],
                        dims: null,
                        resizable: false,
                    },
                    mimetype: 'application/x-zarr',
                    parameters: {},
                    assets: [],
                    management: 'writable',
                },
            ],
        } as never);
        await http.putArrayFull(`${NODE}/inner/arr`, new Float64Array([1, 2, 3]).buffer);
    });

    afterAll(async () => {
        if (LIVE_URL) await http.deleteNode(NODE, { recursive: true, external_only: false });
    });

    it('reports access_tags, not access_blob', async () => {
        const node = await http.getMetadata(NODE);
        expect(node.attributes.access_tags).toEqual([]);
        expect(node.attributes).not.toHaveProperty('access_blob');
        expect(node.links.search_deep).toContain('/search-deep/');
    });

    it('accepts access_tags in a merge patch', async () => {
        await expect(http.patchMetadataMerge(NODE, { access_tags: [] })).resolves.toBeDefined();
    });

    it('sends the access-tags filter under the name the server accepts', async () => {
        const result = await http.getSearch(NODE, {
            searchFilters: { accessTags: { tags: ['no-such-tag'] } },
        });
        expect(result.data).toEqual([]);
    });

    it('searches every descendant, not just children', async () => {
        const shallow = await http.getSearch(NODE);
        const deep = await http.getSearchDeep(NODE);

        expect(shallow.data.map((item) => item.id).sort()).toEqual(['inner', 'leaf']);
        expect(deep.data.map((item) => item.id).sort()).toEqual(['arr', 'inner', 'leaf']);
        const arr = deep.data.find((item) => item.id === 'arr');
        expect(arr?.attributes.ancestors.slice(-2)).toEqual([KEY, 'inner']);
    });

    it('applies maxDepth and filters to a deep search', async () => {
        const one = await http.getSearchDeep(NODE, { searchOptions: { maxDepth: 1 } });
        expect(one.data.map((item) => item.id).sort()).toEqual(['inner', 'leaf']);

        const red = await http.getSearchDeep(NODE, {
            searchFilters: { eq: { key: 'color', value: 'red' } },
        });
        expect(red.data.map((item) => item.id)).toEqual(['arr']);
    });

    it('refuses to sort a deep search', async () => {
        const error = await rejection(
            http.getSearchDeep(NODE, { searchOptions: { sort: 'color' } }),
        );
        expect(error.status).toBe(400);
    });

    it('runs a GraphQL query over GET, and refuses a mutation that way', async () => {
        await expect(http.graphqlGet('{ namespaces { prefix uri } }')).resolves.toHaveProperty(
            'namespaces',
        );
        await expect(
            http.graphqlGet('query ($id: ID!) { entity(id: $id) { id } }', {
                id: '00000000-0000-0000-0000-000000000000',
            }),
        ).resolves.toEqual({ entity: null });

        const error = await rejection(
            http.graphqlGet('mutation { deleteNamespace(prefix: "finch-never-registered") }'),
        );
        expect(error.status).toBe(400);
    });

    it('reports GraphQL errors from a GET the same way as from a POST', async () => {
        const viaGet = await rejection(http.graphqlGet('{ noSuchField }'));
        const viaPost = await rejection(http.graphql('{ noSuchField }'));
        expect(viaGet.graphqlErrors).toHaveLength(1);
        expect(viaGet.graphqlErrors).toEqual(viaPost.graphqlErrors);
        expect(viaGet.method).toBe('GET');
    });

    it('deletes an asset only when told the data may go', async () => {
        const arrPath = `${NODE}/inner/arr`;
        // The asset id lives on the data source, which a search returns when asked.
        const listing = await http.getSearch(`${NODE}/inner`, {
            searchOptions: { includeDataSources: true },
        });
        const [source] = listing.data[0].attributes.data_sources as { assets: { id: number }[] }[];
        const { id } = source.assets[0];

        expect((await rejection(http.deleteAsset(arrPath, { id }))).status).toBe(409);
        expect((await rejection(http.deleteAsset(arrPath, { id: 999999 }))).status).toBe(404);
        await expect(http.deleteAsset(arrPath, { id, external_only: false })).resolves.toEqual({
            asset_deleted: true,
            data_deleted: true,
        });
        expect(
            (await rejection(http.deleteAsset(arrPath, { id, external_only: false }))).status,
        ).toBe(404);
    });
});
