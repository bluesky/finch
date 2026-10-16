import { TiledGraphOperationDescriptor } from '../types/registry';
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
//# sourceMappingURL=graphEndpoints.d.ts.map