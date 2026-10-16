import { TiledEndpointDescriptor } from '../types/registry';
export declare const metadataWriteEndpointDescriptors: readonly TiledEndpointDescriptor[];
export declare const arrayWriteEndpointDescriptors: readonly TiledEndpointDescriptor[];
export declare const raggedWriteEndpointDescriptors: readonly TiledEndpointDescriptor[];
export declare const tableWriteEndpointDescriptors: readonly TiledEndpointDescriptor[];
export declare const nodeWriteEndpointDescriptors: readonly TiledEndpointDescriptor[];
export declare const awkwardWriteEndpointDescriptors: readonly TiledEndpointDescriptor[];
export declare const managementWriteEndpointDescriptors: readonly TiledEndpointDescriptor[];
export declare const webhookWriteEndpointDescriptors: readonly TiledEndpointDescriptor[];
/**
 * Auth endpoints.
 *
 * `operationId: null` throughout — these routes are genuinely absent from `openapi.json`, because
 * Tiled generates the spec without its auth router. The coverage test knows this and treats a null
 * operation id as deliberate rather than as a gap. The URLs are resolved at call time from
 * `About.authentication.links`; on a server with auth disabled every one of them fails with a
 * `TiledApiError` saying so.
 */
export declare const authEndpointDescriptors: readonly TiledEndpointDescriptor[];
/**
 * Zarr.
 *
 * URL builders, not fetchers — these routes exist to be handed to zarr.js or xarray, which do their
 * own chunk fetching. `synchronous: true` tells the harness to show the URL rather than to await a
 * response. The ten spec paths collapse to two entries because a zarr reader is given a node's base
 * URL and derives `.zattrs`, `.zgroup`, `zarr.json` and the chunk paths itself; the coverage test
 * lists the other eight as covered-by-these.
 */
export declare const zarrEndpointDescriptors: readonly TiledEndpointDescriptor[];
//# sourceMappingURL=writeEndpoints.d.ts.map