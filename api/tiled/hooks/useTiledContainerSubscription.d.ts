import { ContainerChildCreatedMessage, ContainerChildMetadataUpdatedMessage, ContainerSchemaMessage } from '../client/websocket/types';
import { UseTiledSubscriptionOptions, UseTiledSubscriptionResult } from './useTiledSubscription';
export interface UseTiledContainerSubscriptionOptions extends Omit<UseTiledSubscriptionOptions, 'onMessage' | 'trackLastMessage'> {
    /** Sent on every (re)connection, so it doubles as an "is live" signal. */
    onSchema?: (message: ContainerSchemaMessage) => void;
    /** A direct child was created, e.g. a Bluesky run starting under the root. */
    onChildCreated?: (message: ContainerChildCreatedMessage) => void;
    /** A direct child's metadata changed, e.g. a Bluesky run gaining `metadata.stop`. */
    onChildMetadataUpdated?: (message: ContainerChildMetadataUpdatedMessage) => void;
}
export type UseTiledContainerSubscriptionResult = Omit<UseTiledSubscriptionResult, 'lastMessage'>;
/**
 * Watch a container for direct-child changes.
 *
 * ```tsx
 * const invalidate = useTiledInvalidate();
 * useTiledContainerSubscription('', {
 *     onChildCreated: () => invalidate.roots('search'),
 *     onChildMetadataUpdated: ({ key, metadata }) => {
 *         if (metadata.stop) console.log('run finished', key);
 *     },
 * });
 * ```
 *
 * Only **direct** children are reported. A table or array further down sends nothing to its ancestors,
 * so subscribe to it with `useTiledTableSubscription` or `useTiledArraySubscription`. The hook never
 * re-renders per message; react to events through the callbacks.
 */
export declare function useTiledContainerSubscription(path: string, options?: UseTiledContainerSubscriptionOptions): UseTiledContainerSubscriptionResult;
//# sourceMappingURL=useTiledContainerSubscription.d.ts.map