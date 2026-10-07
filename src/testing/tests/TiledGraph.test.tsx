import fs from 'node:fs';
import path from 'node:path';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import {
    buildSchema,
    isObjectType,
    parse,
    validate,
    type GraphQLObjectType,
    type GraphQLSchema,
} from 'graphql';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    TILED_GRAPH_ENDPOINTS,
    TILED_GRAPH_OPERATIONS,
    TiledApiClient,
    createMemoryTokenStorage,
    isFinchMissingArgumentError,
    isTiledGraphQLError,
    useTiledCreateGraphLinkMutation,
    useTiledGraphEntitiesQuery,
    useTiledGraphEntityQuery,
    useTiledGraphQLQuery,
    type TiledApiError,
} from '../../api/tiled';
import { graphOperationName } from '../../api/tiled/graph/operations';
import {
    TILED_MUTATION_INVALIDATIONS,
    resolveInvalidationRoots,
} from '../../api/tiled/hooks/invalidation';
import { TiledApiProvider } from '../../api/tiled/runtime/TiledApiProvider';
import type { TiledClientLike } from '../../api/tiled/runtime/clientLike';

/**
 * The graph of links: Tiled's experimental entity/link store, over GraphQL at `{origin}/api/graphql`.
 *
 * Three layers, in the order they can break:
 *
 * 1. **The documents against the schema.** `graph/schema.graphql` is the committed SDL; every
 *    document in `graph/operations.ts` must validate against it, and the two must cover the same root
 *    fields. This is the graph's `TiledRegistry.test.ts` — when upstream renames `entityType` to
 *    `kind`, this is what fails, naming the documents.
 * 2. **The transport.** GraphQL reports resolver failures with HTTP 200, the endpoint sits outside
 *    `/api/v1`, and updates are three-state — each easy to get quietly wrong.
 * 3. **The hooks.** Idle guards, one cache root, and every write refreshing it.
 */

const SDL = fs.readFileSync(path.join(__dirname, '../../api/tiled/graph/schema.graphql'), 'utf8');
const schema: GraphQLSchema = buildSchema(SDL);

const rootFields = (type: GraphQLObjectType | null | undefined): string[] =>
    type && isObjectType(type) ? Object.keys(type.getFields()).sort() : [];

describe('documents against the committed schema', () => {
    it('implements every Query and Mutation field, and no other', () => {
        const fromSchema = {
            query: rootFields(schema.getQueryType()),
            mutation: rootFields(schema.getMutationType()),
        };
        const implemented = {
            query: TILED_GRAPH_OPERATIONS.filter((op) => op.kind === 'query')
                .map((op) => op.field)
                .sort(),
            mutation: TILED_GRAPH_OPERATIONS.filter((op) => op.kind === 'mutation')
                .map((op) => op.field)
                .sort(),
        };

        expect(implemented).toEqual(fromSchema);
    });

    it('validates every document', () => {
        for (const operation of TILED_GRAPH_OPERATIONS) {
            const errors = validate(schema, parse(operation.document));
            expect(
                errors.map((error) => error.message),
                operation.name,
            ).toEqual([]);
        }
    });

    it('names each document as the operation list says, selecting the field it claims', () => {
        for (const operation of TILED_GRAPH_OPERATIONS) {
            expect(graphOperationName(operation.document), operation.field).toBe(operation.name);

            const definition = parse(operation.document).definitions.find(
                (node) => node.kind === 'OperationDefinition',
            );
            expect(definition && 'operation' in definition && definition.operation).toBe(
                operation.kind,
            );
            const selected =
                definition && 'selectionSet' in definition
                    ? definition.selectionSet.selections.map((selection) =>
                          'name' in selection ? selection.name.value : null,
                      )
                    : [];
            expect(selected, operation.name).toEqual([operation.field]);
        }
    });
});

describe('graph registry', () => {
    it('has one descriptor per operation, each naming a real client method', () => {
        const client = new TiledApiClient({ baseUrl: 'http://example.test/api/v1' });
        expect(TILED_GRAPH_ENDPOINTS.map((endpoint) => endpoint.field).sort()).toEqual(
            TILED_GRAPH_OPERATIONS.map((operation) => operation.field).sort(),
        );

        const ids = TILED_GRAPH_ENDPOINTS.map((endpoint) => endpoint.id);
        expect(new Set(ids).size).toBe(ids.length);

        for (const endpoint of TILED_GRAPH_ENDPOINTS) {
            expect(endpoint.id).toBe(`graph.${endpoint.field}`);
            expect(
                typeof (client as unknown as Record<string, unknown>)[endpoint.fn],
                endpoint.id,
            ).toBe('function');
            const operation = TILED_GRAPH_OPERATIONS.find((op) => op.field === endpoint.field);
            expect(endpoint.kind, endpoint.id).toBe(operation?.kind);
        }
    });

    it('flags every mutation as destructive except the two that only add', () => {
        const nonDestructive = TILED_GRAPH_ENDPOINTS.filter(
            (endpoint) => endpoint.kind === 'mutation' && !endpoint.destructive,
        ).map((endpoint) => endpoint.id);

        expect(nonDestructive.sort()).toEqual(['graph.createEntity', 'graph.createLink']);
        for (const endpoint of TILED_GRAPH_ENDPOINTS.filter((e) => e.kind === 'query')) {
            expect(endpoint.destructive, endpoint.id).toBeFalsy();
        }
    });
});

// #region transport

const BASE = 'http://tiled.test:8000/api/v1';

interface Reply {
    status?: number;
    body: unknown;
}

function respond(config: InternalAxiosRequestConfig, reply: Reply): Promise<AxiosResponse> {
    const status = reply.status ?? 200;
    const response = {
        data: reply.body,
        status,
        statusText: '',
        headers: {},
        config,
    } as AxiosResponse;
    // A custom adapter must reject failing statuses itself; axios settles only inside its own.
    if (status >= 400) {
        return Promise.reject(
            new AxiosError(
                `Request failed with status code ${status}`,
                String(status),
                config,
                null,
                response,
            ),
        );
    }
    return Promise.resolve(response);
}

/** A client over a stub adapter that answers each request with the next reply in `replies`. */
function makeClient(...replies: Reply[]) {
    const seen: InternalAxiosRequestConfig[] = [];
    const transport = axios.create({
        adapter: (config) => {
            seen.push(config as InternalAxiosRequestConfig);
            const reply = replies[Math.min(seen.length - 1, replies.length - 1)];
            return respond(config as InternalAxiosRequestConfig, reply);
        },
    });
    const storage = createMemoryTokenStorage();
    storage.write({ accessToken: 'stored-access', refreshToken: 'stored-refresh' });
    const client = new TiledApiClient({
        baseUrl: BASE,
        apiKey: 'client-key',
        client: transport,
        tokenStorage: storage,
    });

    /** The JSON body of the n-th request — axios has serialised it by the time the adapter runs. */
    const bodyOf = (index = 0): { query: string; variables: Record<string, unknown> } =>
        JSON.parse(seen[index].data as string);

    return { client, seen, bodyOf };
}

const ENTITY = {
    id: '7',
    isNodeBound: true,
    entityType: 'sample',
    name: 'S001',
    uri: null,
    properties: null,
    createdAt: '2026-10-05T00:00:00',
};

describe('graph transport', () => {
    afterEach(() => vi.restoreAllMocks());

    it('POSTs the document and variables to /api/graphql on the origin, with credentials', async () => {
        const { client, seen, bodyOf } = makeClient({ body: { data: { entity: ENTITY } } });

        const entity = await client.getGraphEntity('7');

        expect(entity).toEqual(ENTITY);
        expect(seen[0].method).toBe('post');
        // Outside the version segment: the base is the origin, not `/api/v1`.
        expect(seen[0].baseURL).toBe('http://tiled.test:8000');
        expect(seen[0].url).toBe('/api/graphql');
        expect(String(seen[0].headers.Authorization)).toContain('client-key');
        expect(bodyOf().variables).toEqual({ id: '7' });
        expect(bodyOf().query).toContain('query TiledGraphEntity');
    });

    it('leaves unset filters and paging out of the variables, so server defaults apply', async () => {
        const { client, bodyOf } = makeClient({ body: { data: { entities: [] } } });

        await client.getGraphEntities({ entityType: 'project', limit: undefined });

        expect(bodyOf().variables).toEqual({ entityType: 'project' });
    });

    /**
     * The three-state update contract: omitted means untouched, `null` means clear.
     *
     * Normalising one into the other would silently detach every entity a caller only meant to
     * rename — or make it impossible to detach one at all.
     */
    it('sends an explicit null and drops an omitted field in an update', async () => {
        const { client, bodyOf } = makeClient({ body: { data: { updateEntity: ENTITY } } });

        await client.updateGraphEntity('7', { nodePathParts: null, uri: undefined });

        const { input } = bodyOf().variables as { input: Record<string, unknown> };
        expect(input).toEqual({ nodePathParts: null });
        expect('uri' in input).toBe(false);
    });

    it('rejects a 200 that carries errors, with the code attached', async () => {
        const { client } = makeClient({
            body: {
                data: null,
                errors: [
                    {
                        message: "No catalog node at path ['nope']",
                        path: ['createEntity'],
                        extensions: { code: 'NODE_NOT_FOUND' },
                    },
                ],
            },
        });

        const failure = await client
            .createGraphEntity({ entityType: 'sample', name: 'x', nodePathParts: ['nope'] })
            .catch((error: unknown) => error);

        expect(isTiledGraphQLError(failure)).toBe(true);
        const error = failure as TiledApiError;
        expect(error.status).toBe(200);
        expect(error.graphqlCode).toBe('NODE_NOT_FOUND');
        expect(error.message).toBe(
            "TiledGraphCreateEntity failed: No catalog node at path ['nope'] [NODE_NOT_FOUND]",
        );
    });

    it('rejects errors alongside partial data, keeping the data on the error', async () => {
        const body = { data: { entity: ENTITY }, errors: [{ message: 'Not permitted' }] };
        const { client } = makeClient({ body });

        const error = (await client.getGraphEntity('7').catch((e: unknown) => e)) as TiledApiError;

        expect(error.responseBody).toEqual(body);
        expect(error.graphqlCode).toBeUndefined();
    });

    it('reads the GraphQL envelope of a 400', async () => {
        const { client } = makeClient({
            status: 400,
            body: { errors: [{ message: "Cannot query field 'kind' on type 'Entity'." }] },
        });

        const error = (await client
            .graphql('query { entities { kind } }')
            .catch((e: unknown) => e)) as TiledApiError;

        expect(error.status).toBe(400);
        expect(error.graphqlErrors).toHaveLength(1);
        expect(error.message).toContain("Cannot query field 'kind'");
    });

    it('says plainly when the server has no graph router', async () => {
        const { client } = makeClient({ status: 404, body: { detail: 'Not Found' } });

        const error = (await client.getGraphNamespaces().catch((e: unknown) => e)) as TiledApiError;

        expect(error.status).toBe(404);
        expect(error.message).toContain('this server has no graph API');
        expect(error.message).toContain('TiledGraphNamespaces');
    });

    it('rejects a response with neither data nor errors', async () => {
        const { client } = makeClient({ body: {} });
        await expect(client.getGraphNamespaces()).rejects.toThrow('carried no data');
    });

    it('refreshes and retries on a 401, like every other call', async () => {
        const refresh = vi
            .spyOn(axios, 'post')
            .mockResolvedValue({ status: 200, data: { access_token: 'refreshed' } });
        const { client, seen } = makeClient(
            { status: 401, body: { detail: 'expired' } },
            { body: { data: { namespaces: [] } } },
        );

        await expect(client.getGraphNamespaces()).resolves.toEqual([]);

        expect(refresh).toHaveBeenCalledOnce();
        expect(seen).toHaveLength(2);
        expect(seen[1].headers.Authorization).toBe('Bearer refreshed');
    });
});

// #endregion

// #region hooks

function makeStub() {
    const calls: { method: string; args: unknown[] }[] = [];
    const record =
        <T,>(method: string, result: T) =>
        (...args: unknown[]) => {
            calls.push({ method, args });
            return Promise.resolve(result);
        };

    const stub = {
        graphql: record('graphql', { entity: ENTITY }),
        getGraphEntity: record('getGraphEntity', ENTITY),
        getGraphEntities: record('getGraphEntities', [ENTITY]),
        createGraphLink: record('createGraphLink', { id: '9' }),
        getBaseUrl: () => BASE,
        getInitialPath: () => '',
        getApiKey: () => null,
    };
    return { client: stub as unknown as TiledClientLike, calls };
}

function makeWrapper(client: TiledClientLike) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <TiledApiProvider client={client}>{children}</TiledApiProvider>
        </QueryClientProvider>
    );
    return { queryClient, wrapper };
}

describe('graph hooks', () => {
    it('idles an id-addressed read while the id is empty', () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper(client);

        const { result } = renderHook(() => useTiledGraphEntityQuery(undefined), { wrapper });

        expect(result.current.fetchStatus).toBe('idle');
        expect(calls).toEqual([]);
    });

    it('raises a named error rather than sending an empty id when forced', async () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper(client);

        const { result } = renderHook(() => useTiledGraphEntityQuery('', { enabled: true }), {
            wrapper,
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(isFinchMissingArgumentError(result.current.error)).toBe(true);
        expect(calls).toEqual([]);
    });

    it('idles a raw query while the document is blank, and runs it once given', async () => {
        const { client, calls } = makeStub();
        const { wrapper } = makeWrapper(client);

        const { result, rerender } = renderHook(
            ({ document }: { document: string }) => useTiledGraphQLQuery(document, { id: '7' }),
            { wrapper, initialProps: { document: '   ' } },
        );
        expect(result.current.fetchStatus).toBe('idle');

        rerender({ document: 'query ($id: ID!) { entity(id: $id) { name } }' });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(calls).toEqual([
            {
                method: 'graphql',
                args: [
                    'query ($id: ID!) { entity(id: $id) { name } }',
                    { id: '7' },
                    expect.anything(),
                ],
            },
        ]);
    });

    it('keys every graph read under one root, with no filters and empty filters as one entry', async () => {
        const { client, calls } = makeStub();
        const { wrapper, queryClient } = makeWrapper(client);

        const first = renderHook(() => useTiledGraphEntitiesQuery(), { wrapper });
        await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
        const second = renderHook(
            () => useTiledGraphEntitiesQuery({ entityType: undefined }, { staleTime: Infinity }),
            { wrapper },
        );
        await waitFor(() => expect(second.result.current.isSuccess).toBe(true));

        const entries = queryClient.getQueryCache().findAll({ queryKey: ['tiled', 'graph'] });
        expect(entries).toHaveLength(1);
        expect(entries[0].queryKey[2]).toEqual({ op: 'entities', filters: {} });
        expect(calls.filter((call) => call.method === 'getGraphEntities')).toHaveLength(1);
    });

    it('refreshes every graph read after a graph write', async () => {
        const { client } = makeStub();
        const { wrapper, queryClient } = makeWrapper(client);
        const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useTiledCreateGraphLinkMutation(), { wrapper });
        await result.current.mutateAsync({
            subjectId: '7',
            predicate: 'schema:isPartOf',
            objectId: '1',
        });

        expect(invalidate).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ['tiled', 'graph'] }),
        );
    });

    /** The server deletes the entities bound to a catalog node along with the node. */
    it('refreshes the graph when a catalog node is deleted', () => {
        expect(
            resolveInvalidationRoots(TILED_MUTATION_INVALIDATIONS.useTiledDeleteNodeMutation),
        ).toContain('graph');
    });
});

// #endregion
