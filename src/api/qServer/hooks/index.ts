/**
 * TanStack Query hooks for the queue server — one per endpoint, 29 queries and 41 mutations.
 *
 * ```tsx
 * import { useQueueGetQuery, useQueueAddItemMutation } from '@/api/qServer';
 *
 * const queue = useQueueGetQuery({ refetchInterval: 1000 });
 * const add = useQueueAddItemMutation();
 * add.mutate({ item: { name: 'count', item_type: 'plan' } });
 * ```
 *
 * Arguments are positional and always in the same order: the endpoint's own argument (when it has
 * one), then `queryOptions` / `mutationOptions`, then `requestOptions` — transport last, because it is
 * the rarest thing to pass. Names mirror the client methods under a `useQueue` prefix
 * (`getStatus` → `useQueueGetStatusQuery`). See `../README.md` for the full contract, and
 * `@/api/shared/queryOptions` for the cross-backend convention the Tiled hooks share.
 */

// Shared types and errors
export type { FinchMutationOptions, FinchQueryOptions, QServerHookError } from './types';
export { QServerEndpointUnavailableError, isQServerEndpointUnavailableError } from './errors';
// Raised by the hooks whose argument is positionally required, when a caller forces `enabled: true`
// past the idle guard. Shared across backends, so it is exported from both.
export { FinchMissingArgumentError, isFinchMissingArgumentError } from '@/api/shared/errors';

// Client resolution
export {
    useQServerClient,
    useQServerQueryScope,
    QSERVER_NON_CORE_METHODS,
} from './useQServerClient';
export type { QServerClientResolution } from './useQServerClient';

// Query keys
export {
    INJECTED_CLIENT_SCOPE,
    QSERVER_QUERY_ROOT,
    QSERVER_QUERY_ROOT_NAMES,
    qServerQueryKeys,
    qServerQueryRoots,
} from './queryKeys';
export type { QServerQueryKeyFor, QServerQueryRootName, QServerQueryScope } from './queryKeys';

// Invalidation
export {
    QSERVER_INVALIDATION_BUNDLES,
    QSERVER_MUTATION_INVALIDATIONS,
    invalidateAllQServerQueries,
    invalidateQServerRoots,
    resolveInvalidationRoots,
    useQServerInvalidate,
} from './invalidation';
export type { QServerInvalidationBundleName, QServerMutationHookName } from './invalidation';

// #region hooks

export {
    useQueuePingQuery,
    useQueueGetRootQuery,
    useQueueGetStatusQuery,
    useQueueGetConfigQuery,
} from './statusHooks';

export {
    useQueueGetQuery,
    useQueueGetItemQuery,
    useQueueAddItemMutation,
    useQueueAddItemBatchMutation,
    useQueueExecuteItemMutation,
    useQueueUpdateItemMutation,
    useQueueRemoveItemMutation,
    useQueueRemoveItemBatchMutation,
    useQueueMoveItemMutation,
    useQueueMoveItemBatchMutation,
    useQueueUploadSpreadsheetMutation,
    useQueueStartMutation,
    useQueueStopMutation,
    useQueueCancelStopMutation,
    useQueueClearMutation,
    useQueueSetModeMutation,
    useQueueSetAutostartMutation,
} from './queueHooks';

export { useQueueGetHistoryQuery, useQueueClearHistoryMutation } from './historyHooks';

export {
    useQueueOpenEnvironmentMutation,
    useQueueCloseEnvironmentMutation,
    useQueueDestroyEnvironmentMutation,
    useQueueUpdateEnvironmentMutation,
} from './environmentHooks';

export {
    useQueuePauseREMutation,
    useQueueResumeREMutation,
    useQueueStopREMutation,
    useQueueAbortREMutation,
    useQueueHaltREMutation,
    useQueueGetRunsQuery,
    useQueueGetRunsActiveQuery,
    useQueueGetRunsOpenQuery,
    useQueueGetRunsClosedQuery,
    useQueueGetREMetadataQuery,
} from './runEngineHooks';

export {
    useQueueGetPlansAllowedQuery,
    useQueueGetDevicesAllowedQuery,
    useQueueGetPlansExistingQuery,
    useQueueGetDevicesExistingQuery,
} from './plansDevicesHooks';

export {
    useQueueGetPermissionsQuery,
    useQueueSetPermissionsMutation,
    useQueueReloadPermissionsMutation,
} from './permissionsHooks';

export {
    useQueueExecuteFunctionMutation,
    useQueueUploadScriptMutation,
} from './functionsScriptsHooks';

export { useQueueGetTaskStatusQuery, useQueueGetTaskResultQuery } from './tasksHooks';

export {
    useQueueLockMutation,
    useQueueUnlockMutation,
    useQueueGetLockInfoQuery,
} from './lockHooks';

export {
    useQueueGetConsoleOutputQuery,
    useQueueGetConsoleOutputUIDQuery,
    useQueueGetConsoleOutputUpdateQuery,
    useQueueStreamConsoleOutputMutation,
} from './consoleHooks';

export {
    useQueueInterruptKernelMutation,
    useQueueStopManagerMutation,
    useQueueTestKillManagerMutation,
    useQueueTestServerSleepQuery,
} from './adminHooks';

export {
    useQueueWhoamiQuery,
    useQueueGetScopesQuery,
    useQueueListPrincipalsQuery,
    useQueueGetPrincipalQuery,
    useQueueGetCurrentApiKeyInfoQuery,
    useQueueCreateApiKeyMutation,
    useQueueCreateApiKeyForPrincipalMutation,
    useQueueRevokeApiKeyMutation,
    useQueueRefreshSessionMutation,
    useQueueRevokeSessionMutation,
    useQueueLogoutMutation,
} from './authHooks';
export type {
    QueueCreateApiKeyForPrincipalVariables,
    QueueRevokeApiKeyVariables,
    QueueRevokeSessionVariables,
} from './authHooks';

// #endregion
