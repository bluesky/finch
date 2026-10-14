import { TiledSubscription } from './TiledSubscription';
import type { TiledSubscriptionOptions, TiledWebSocketClientOptions } from './types';

/**
 * Holds one server's URL and credentials and creates subscriptions against it.
 *
 * ```ts
 * const client = new TiledWebSocketClient({ baseUrl: 'http://localhost:8000/api/v1', apiKey: 'secret' });
 * const sub = client.subscribe('run-id/primary/internal');
 * sub.onMessage((message) => console.log(message));
 * sub.connect();
 * ```
 *
 * Each subscription owns its own socket, because Tiled's route serves one node per connection. The
 * client does not multiplex subscriptions or track them; disconnecting each one is up to the caller.
 */
export class TiledWebSocketClient {
    private readonly options: TiledWebSocketClientOptions;

    constructor(options: TiledWebSocketClientOptions) {
        this.options = options;
    }

    /** Create a subscription to `path`. It does not connect until `connect()` is called. */
    subscribe(path: string, options: TiledSubscriptionOptions = {}): TiledSubscription {
        return new TiledSubscription({ ...this.options, ...options, path });
    }
}
