import { TiledSocketFactory } from '../../api/tiled';
import { TiledConnectionConfig } from '../devtools/TiledConnectionBar';
import { SubscriptionMode } from './modes';
export interface SubscriptionPanelProps {
    initialPath: string;
    initialMode: SubscriptionMode;
    connection: TiledConnectionConfig;
    onRemove: () => void;
    /** Open another panel, e.g. on a child a container subscription just reported. */
    onSubscribeChild: (path: string, mode: SubscriptionMode) => void;
    /** Overrides the browser `WebSocket`; for tests. */
    socketFactory?: TiledSocketFactory;
}
/**
 * One subscription: pick a hook, set its options, subscribe, and watch what arrives.
 *
 * Options are staged and only take effect on Subscribe, the same way the connection bar stages its
 * edits, because changing `start` or a reconnect option opens a new socket.
 */
export default function SubscriptionPanel({ initialPath, initialMode, connection, onRemove, onSubscribeChild, socketFactory, }: SubscriptionPanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SubscriptionPanel.d.ts.map