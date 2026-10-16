import { TiledApiClient } from '../client/TiledApiClient';
import { TiledHttpMethod } from './errors';
import { TiledOperationId, TiledSpecPath } from './generatedAliases';
/**
 * Machine-readable descriptions of every operation the client implements.
 *
 * The registry exists so that generic consumers — the manual test harness, the docs, and the
 * coverage test that diffs it against `openapi.json` — can enumerate the API without a
 * hand-maintained list going stale. `call` carries the invocation itself, which keeps heterogeneous
 * method signatures out of the harness.
 *
 * Copied in structure from [`qServer/types/registry.ts`](../../qServer/types/registry.ts), with two
 * additions Tiled needs: `operationId`, because Tiled's spec has meaningful operation ids where the
 * queue server's are noise, and `pathParam`, because almost every Tiled route is addressed by a node
 * path rather than by a scalar.
 */
/** Domain groupings used by the registry, the docs and the manual test harness. */
export type TiledEndpointGroup = 'info' | 'search' | 'metadata' | 'array' | 'ragged' | 'table' | 'container' | 'node' | 'awkward' | 'management' | 'asset' | 'webhooks' | 'auth' | 'zarr' | 'graph';
export interface TiledEndpointParam {
    name: string;
    in: 'path' | 'query';
    required: boolean;
    description?: string;
}
/** Everything a caller needs to supply to invoke an arbitrary endpoint generically. */
export interface TiledEndpointInvocation {
    /** The node path, for the routes addressed by one. */
    path?: string;
    /** JSON request body. */
    payload?: Record<string, unknown> | unknown[];
    /** Query and scalar path parameter values, keyed by parameter name. */
    params?: Record<string, string>;
    /** For the binary write endpoints. */
    file?: File | Blob | null;
}
/**
 * Read a generic invocation's payload as a specific body type.
 *
 * The harness hands over free-form JSON that a human typed, so this is an assertion by construction;
 * the server performs the real validation and answers 422 when it is wrong.
 */
export declare function payloadAs<T>(input: TiledEndpointInvocation): T;
/** Read a numeric parameter from a generic invocation. */
export declare function numberParam(input: TiledEndpointInvocation, name: string, fallback?: number): number;
/** Read a comma-separated index tuple (`block`, `offset`, `shape`) from a generic invocation. */
export declare function tupleParam(input: TiledEndpointInvocation, name: string): number[];
/** Machine-readable description of a single operation. */
export interface TiledEndpointDescriptor {
    /** Stable id, `<group>.<name>`, e.g. `'metadata.create'`. */
    id: string;
    group: TiledEndpointGroup;
    method: TiledHttpMethod;
    /** Spec path, including `{placeholder}` segments. */
    path: TiledSpecPath;
    /**
     * The spec's operation id.
     *
     * `null` for the auth routes, which are genuinely absent from `openapi.json` — see
     * `../README.md`. The coverage test treats a `null` here as "deliberately unmatched" rather than
     * as a gap, and fails if a non-auth descriptor claims one.
     */
    operationId: TiledOperationId | null;
    /** Name of the corresponding `TiledApiClient` method. */
    fn: keyof TiledApiClient;
    summary: string;
    /** Takes a Tiled node path, which the harness should offer a tree picker for. */
    pathParam?: boolean;
    /** Sends a binary body rather than JSON. */
    binary?: boolean;
    /** Returns bytes rather than JSON — the harness should offer a download, not a JSON viewer. */
    binaryResponse?: boolean;
    /** Changes server state in a way a tester should confirm first. */
    destructive?: boolean;
    /**
     * Does not change server state, despite not being a `GET`.
     *
     * Four endpoints are reads with a request body: `POST /table/full`, `POST /table/partition`,
     * `POST /container/full` and `POST /awkward/buffers` all take a selection list too long for a
     * query string and return data. The harness may run these freely, and their hooks are queries
     * rather than mutations.
     */
    readOnly?: boolean;
    /** Builds a URL rather than making a request; `call` resolves immediately. */
    synchronous?: boolean;
    params?: TiledEndpointParam[];
    /** Prefilled body for the manual test harness. */
    sampleBody?: Record<string, unknown> | unknown[];
    /** Invoke this endpoint on a client. */
    call: (client: TiledApiClient, input: TiledEndpointInvocation) => Promise<unknown>;
}
/**
 * Machine-readable description of one graph-of-links operation.
 *
 * A separate shape from {@link TiledEndpointDescriptor}, which is tied to `openapi.json` through its
 * spec `path` and `operationId`: every graph operation is the same `POST /api/graphql`, and is
 * identified by the root GraphQL field it selects instead. `TiledGraph.test.tsx` diffs these against
 * `../graph/schema.graphql` the way `TiledRegistry.test.ts` diffs the REST registry against the spec.
 */
export interface TiledGraphOperationDescriptor {
    /** Stable id, `graph.<field>`, e.g. `'graph.createLink'`. */
    id: string;
    group: 'graph';
    kind: 'query' | 'mutation';
    /** The root `Query` / `Mutation` field, as `schema.graphql` names it. */
    field: string;
    /** Name of the corresponding `TiledApiClient` method. */
    fn: keyof TiledApiClient;
    summary: string;
    /** Changes or removes something that already exists — the harness should confirm first. */
    destructive?: boolean;
    /** Prefilled variables for a manual harness. */
    sampleVariables?: Record<string, unknown>;
    /** Invoke this operation on a client, with the operation's own variables. */
    call: (client: TiledApiClient, variables: Record<string, unknown>) => Promise<unknown>;
}
//# sourceMappingURL=registry.d.ts.map