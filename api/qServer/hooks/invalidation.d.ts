import { QueryClient } from '@tanstack/react-query';
import { QServerQueryRootName } from './queryKeys';
/**
 * Which queries each mutation refreshes.
 *
 * Grouped into named **bundles** rather than listing roots per mutation, because the interesting
 * question is "what did this write change" and several mutations answer it identically. Invalidation
 * matches the resource prefix and ignores the scope, so it refreshes that resource on every server —
 * over-invalidating a multi-server app is far cheaper than serving it stale data.
 */
export declare const QSERVER_INVALIDATION_BUNDLES: {
    /** RE Manager status, and the two endpoints that return the same payload. */
    readonly status: readonly ["status", "ping", "root"];
    readonly queue: readonly ["queue", "queueItem"];
    readonly history: readonly ["history"];
    readonly runs: readonly ["runs", "runsActive", "runsOpen", "runsClosed"];
    /** Allowed/existing plans and devices — reloaded whenever the environment or permissions move. */
    readonly catalogs: readonly ["plansAllowed", "devicesAllowed", "plansExisting", "devicesExisting"];
    readonly permissions: readonly ["permissions"];
    readonly lock: readonly ["lockInfo"];
    readonly auth: readonly ["whoami", "scopes", "principals", "principal", "apiKeyInfo"];
};
export type QServerInvalidationBundleName = keyof typeof QSERVER_INVALIDATION_BUNDLES;
/**
 * Bundles each mutation hook invalidates on success.
 *
 * Notable choices, and how they differ from `src/api/qServer/hooks.ts`:
 *
 * - Queue writes no longer invalidate `history` (they cannot change it) but now do invalidate
 *   `status`, which carries `items_in_queue` and `plan_queue_uid`.
 * - `pauseRE` now also refreshes `queue` and `runs`, since pausing changes the running item.
 * - Console and task roots are in no bundle: console output is append-only (served by the socket or
 *   by polling), and task entries are keyed by `task_uid`, so a mutation that *creates* a task has
 *   nothing cached to refresh.
 * - `createApiKey` invalidates nothing: minting a key does not change the *current* key's info.
 */
export declare const QSERVER_MUTATION_INVALIDATIONS: {
    readonly useQueueAddItemMutation: readonly ["queue", "status"];
    readonly useQueueAddItemBatchMutation: readonly ["queue", "status"];
    readonly useQueueExecuteItemMutation: readonly ["queue", "status", "runs"];
    readonly useQueueUpdateItemMutation: readonly ["queue", "status"];
    readonly useQueueRemoveItemMutation: readonly ["queue", "status"];
    readonly useQueueRemoveItemBatchMutation: readonly ["queue", "status"];
    readonly useQueueMoveItemMutation: readonly ["queue", "status"];
    readonly useQueueMoveItemBatchMutation: readonly ["queue", "status"];
    readonly useQueueUploadSpreadsheetMutation: readonly ["queue", "status"];
    readonly useQueueStartMutation: readonly ["queue", "status", "runs"];
    readonly useQueueStopMutation: readonly ["status"];
    readonly useQueueCancelStopMutation: readonly ["status"];
    readonly useQueueClearMutation: readonly ["queue", "status"];
    readonly useQueueSetModeMutation: readonly ["status"];
    readonly useQueueSetAutostartMutation: readonly ["status"];
    readonly useQueueClearHistoryMutation: readonly ["history", "status"];
    readonly useQueueOpenEnvironmentMutation: readonly ["status", "catalogs"];
    readonly useQueueCloseEnvironmentMutation: readonly ["status", "catalogs", "runs"];
    readonly useQueueDestroyEnvironmentMutation: readonly ["status", "catalogs", "runs", "queue"];
    readonly useQueueUpdateEnvironmentMutation: readonly ["status", "catalogs"];
    readonly useQueuePauseREMutation: readonly ["status", "queue", "runs"];
    readonly useQueueResumeREMutation: readonly ["status", "runs"];
    readonly useQueueStopREMutation: readonly ["status", "queue", "history", "runs"];
    readonly useQueueAbortREMutation: readonly ["status", "queue", "history", "runs"];
    readonly useQueueHaltREMutation: readonly ["status", "queue", "history", "runs"];
    readonly useQueueSetPermissionsMutation: readonly ["permissions", "catalogs", "status"];
    readonly useQueueReloadPermissionsMutation: readonly ["permissions", "catalogs", "status"];
    readonly useQueueExecuteFunctionMutation: readonly ["status"];
    readonly useQueueUploadScriptMutation: readonly ["status", "catalogs"];
    readonly useQueueLockMutation: readonly ["lock", "status"];
    readonly useQueueUnlockMutation: readonly ["lock", "status"];
    readonly useQueueStreamConsoleOutputMutation: readonly [];
    readonly useQueueInterruptKernelMutation: readonly ["status"];
    readonly useQueueStopManagerMutation: readonly ["status"];
    readonly useQueueTestKillManagerMutation: readonly ["status"];
    readonly useQueueCreateApiKeyMutation: readonly [];
    readonly useQueueCreateApiKeyForPrincipalMutation: readonly ["auth"];
    readonly useQueueRevokeApiKeyMutation: readonly ["auth"];
    readonly useQueueRefreshSessionMutation: readonly ["auth"];
    readonly useQueueRevokeSessionMutation: readonly ["auth"];
    readonly useQueueLogoutMutation: readonly ["auth"];
};
export type QServerMutationHookName = keyof typeof QSERVER_MUTATION_INVALIDATIONS;
/** Expand bundle names to the resource roots they cover, de-duplicated. */
export declare function resolveInvalidationRoots(bundles: readonly QServerInvalidationBundleName[]): QServerQueryRootName[];
/**
 * Invalidate whole resources by name.
 *
 * Awaited by the mutation hooks, so `mutateAsync` resolves only once the affected queries have
 * refetched — a caller can read fresh data immediately afterwards.
 */
export declare function invalidateQServerRoots(queryClient: QueryClient, roots: readonly QServerQueryRootName[]): Promise<void>;
/**
 * Invalidate every queue-server query.
 *
 * The right response to changing the API key or the signed-in principal: auth is read at request
 * time and is deliberately not part of any query key, so a credential change invalidates everything
 * rather than one entry.
 */
export declare function invalidateAllQServerQueries(queryClient: QueryClient): Promise<void>;
/** Imperative invalidation, for components that need to refresh outside a mutation. */
export declare function useQServerInvalidate(): {
    roots: (...names: QServerQueryRootName[]) => Promise<void>;
    bundles: (...names: QServerInvalidationBundleName[]) => Promise<void>;
    all: () => Promise<void>;
};
//# sourceMappingURL=invalidation.d.ts.map