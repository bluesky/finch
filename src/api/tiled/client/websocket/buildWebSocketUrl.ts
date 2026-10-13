import { encodeTiledPath, normalizeTiledBaseUrl } from '../urlUtils';
import type { TiledSubscriptionOptions } from './types';

/** The streaming route, relative to the API root (`…/api/v1`). Not in `openapi.json`. */
export const TILED_STREAM_PATH = '/stream/single/';

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
export function buildTiledWebSocketUrl(
    apiUrl: string,
    path: string,
    options: Pick<TiledSubscriptionOptions, 'envelopeFormat' | 'start'> = {},
): string {
    const url = new URL(normalizeTiledBaseUrl(apiUrl));
    if (url.protocol === 'https:') url.protocol = 'wss:';
    else if (url.protocol === 'http:') url.protocol = 'ws:';

    url.pathname = `${url.pathname.replace(/\/+$/, '')}${TILED_STREAM_PATH}${encodeTiledPath(path)}`;
    url.search = '';
    url.hash = '';
    url.searchParams.set('envelope_format', options.envelopeFormat ?? 'json');
    if (options.start !== undefined) url.searchParams.set('start', String(options.start));

    return url.toString();
}
