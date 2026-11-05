import { TiledEndpointDescriptor, TiledGraphOperationDescriptor } from '../types/registry';
/**
 * The graph-of-links operations, one per root field of `../graph/schema.graphql`.
 *
 * `call` takes the operation's GraphQL variables as a plain object — the same names the server
 * declares — so a harness can render one JSON editor for any of them.
 *
 * Destructive means "changes or removes something that already exists". Creating an entity or a
 * link only adds; `upsertNamespace` can replace an existing prefix's URI and so re-render every
 * predicate, which is why it is flagged.
 */
export declare const graphEndpointDescriptors: readonly TiledGraphOperationDescriptor[];
/**
 * The GraphQL route itself, as `openapi.json` declares it — two operations, `POST` and `GET`.
 *
 * These are REST descriptors, in `TILED_ENDPOINTS` with the rest of the spec, because since Tiled
 * 0.2.19 the spec lists the route and `TiledRegistry.test.ts` holds every spec operation to a
 * descriptor. They carry a whole GraphQL document; the per-field operations above are the typed view.
 *
 * `POST` runs anything, mutations included, so it is flagged destructive. `GET` runs queries only —
 * the server refuses a mutation sent that way — and needs a `query`, so a read-only sweep skips it.
 */
export declare const graphTransportEndpointDescriptors: readonly TiledEndpointDescriptor[];
//# sourceMappingURL=graphEndpoints.d.ts.map