import { TiledSocketFactory } from '../../api/tiled';
export interface TiledWebsocketProps {
    /** Overrides the browser `WebSocket` in every subscription; for tests. */
    socketFactory?: TiledSocketFactory;
}
/**
 * Manual test harness for Tiled's streaming websocket: the subscription hooks, the raw
 * `TiledSubscription`, replay, reconnects, and the TanStack invalidation pattern.
 *
 * Like the query playground, it builds its **own client** from the connection bar and injects it
 * through `TiledApiProvider`, so the hooks here resolve their URL, initial path and API key the same
 * way an app's would. The one thing an injected client does not hand the hooks is an access token,
 * so token auth is tested with the raw `TiledSubscription` mode, which reads the bar directly.
 */
export default function TiledWebsocket({ socketFactory }: TiledWebsocketProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TiledWebsocket.d.ts.map