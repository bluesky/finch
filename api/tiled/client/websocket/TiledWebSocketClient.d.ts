import { TiledSubscription } from './TiledSubscription';
import { TiledSubscriptionOptions, TiledWebSocketClientOptions } from './types';
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
export declare class TiledWebSocketClient {
    private readonly options;
    constructor(options: TiledWebSocketClientOptions);
    /** Create a subscription to `path`. It does not connect until `connect()` is called. */
    subscribe(path: string, options?: TiledSubscriptionOptions): TiledSubscription;
}
//# sourceMappingURL=TiledWebSocketClient.d.ts.map