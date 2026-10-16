import { TiledSubscriptionOptions } from './types';
/** The streaming route, relative to the API root (`…/api/v1`). Not in `openapi.json`. */
export declare const TILED_STREAM_PATH = "/stream/single/";
/**
 * Build the websocket URL for one node from the HTTP API URL.
 *
 * `http://host:8000/api/v1` + `'run/primary'` → `ws://host:8000/api/v1/stream/single/run/primary?envelope_format=json`.
 *
 * - The trailing slash on `/stream/single/` is required. The server routes the root container only as
 *   `/stream/single/`, and answers the slashless form with a 403.
 * - Each path segment is encoded separately (`encodeTiledPath`), so `/` keeps separating segments while
 *   `?`, `#` and spaces inside a key are escaped.
 * - Credentials never go in the URL. Tiled reads a websocket API key only from the `Authorization`
 *   header, which a browser cannot set, so `TiledSubscription` sends them as the first frame instead.
 */
export declare function buildTiledWebSocketUrl(apiUrl: string, path: string, options?: Pick<TiledSubscriptionOptions, 'envelopeFormat' | 'start'>): string;
//# sourceMappingURL=buildWebSocketUrl.d.ts.map