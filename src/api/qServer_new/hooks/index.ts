/**
 * TanStack Query hooks for the queue server — one per endpoint, 29 queries and 41 mutations.
 *
 * ```tsx
 * import { useQueueGetQuery, useQueueAddItemMutation } from '@/api/qServer_new';
 *
 * const queue = useQueueGetQuery({ query: { refetchInterval: 1000 } });
 * const add = useQueueAddItemMutation();
 * add.mutate({ item: { name: 'count', item_type: 'plan' } });
 * ```
 *
 * Every hook takes a single optional options object: the endpoint's own argument, `request` for
 * transport overrides, and `query`/`mutation` for TanStack options. Names mirror the client methods
 * (`getStatus` → `useQueueGetStatusQuery`). See `../README.md` for the full contract.
 */

// Shared types and errors
export type {
    QServerHookError,
    QServerMutationHookOptions,
    QServerQueryHookOptions,
} from './types';
export { QServerEndpointUnavailableError, isQServerEndpointUnavailableError } from './errors';

// Client resolution
export { useQServerClient, QSERVER_NON_CORE_METHODS } from './useQServerClient';
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
export type {
    UseQueuePingQueryOptions,
    UseQueueGetRootQueryOptions,
    UseQueueGetStatusQueryOptions,
    UseQueueGetConfigQueryOptions,
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
export type {
    UseQueueGetQueryOptions,
    UseQueueGetItemQueryOptions,
    UseQueueAddItemMutationOptions,
    UseQueueAddItemBatchMutationOptions,
    UseQueueExecuteItemMutationOptions,
    UseQueueUpdateItemMutationOptions,
    UseQueueRemoveItemMutationOptions,
    UseQueueRemoveItemBatchMutationOptions,
    UseQueueMoveItemMutationOptions,
    UseQueueMoveItemBatchMutationOptions,
    UseQueueUploadSpreadsheetMutationOptions,
    UseQueueStartMutationOptions,
    UseQueueStopMutationOptions,
    UseQueueCancelStopMutationOptions,
    UseQueueClearMutationOptions,
    UseQueueSetModeMutationOptions,
    UseQueueSetAutostartMutationOptions,
} from './queueHooks';

export { useQueueGetHistoryQuery, useQueueClearHistoryMutation } from './historyHooks';
export type {
    UseQueueGetHistoryQueryOptions,
    UseQueueClearHistoryMutationOptions,
} from './historyHooks';

export {
    useQueueOpenEnvironmentMutation,
    useQueueCloseEnvironmentMutation,
    useQueueDestroyEnvironmentMutation,
    useQueueUpdateEnvironmentMutation,
} from './environmentHooks';
export type {
    UseQueueOpenEnvironmentMutationOptions,
    UseQueueCloseEnvironmentMutationOptions,
    UseQueueDestroyEnvironmentMutationOptions,
    UseQueueUpdateEnvironmentMutationOptions,
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
export type {
    UseQueuePauseREMutationOptions,
    UseQueueResumeREMutationOptions,
    UseQueueStopREMutationOptions,
    UseQueueAbortREMutationOptions,
    UseQueueHaltREMutationOptions,
    UseQueueGetRunsQueryOptions,
    UseQueueGetRunsActiveQueryOptions,
    UseQueueGetRunsOpenQueryOptions,
    UseQueueGetRunsClosedQueryOptions,
    UseQueueGetREMetadataQueryOptions,
} from './runEngineHooks';

export {
    useQueueGetPlansAllowedQuery,
    useQueueGetDevicesAllowedQuery,
    useQueueGetPlansExistingQuery,
    useQueueGetDevicesExistingQuery,
} from './plansDevicesHooks';
export type {
    UseQueueGetPlansAllowedQueryOptions,
    UseQueueGetDevicesAllowedQueryOptions,
    UseQueueGetPlansExistingQueryOptions,
    UseQueueGetDevicesExistingQueryOptions,
} from './plansDevicesHooks';

export {
    useQueueGetPermissionsQuery,
    useQueueSetPermissionsMutation,
    useQueueReloadPermissionsMutation,
} from './permissionsHooks';
export type {
    UseQueueGetPermissionsQueryOptions,
    UseQueueSetPermissionsMutationOptions,
    UseQueueReloadPermissionsMutationOptions,
} from './permissionsHooks';

export {
    useQueueExecuteFunctionMutation,
    useQueueUploadScriptMutation,
} from './functionsScriptsHooks';
export type {
    UseQueueExecuteFunctionMutationOptions,
    UseQueueUploadScriptMutationOptions,
} from './functionsScriptsHooks';

export { useQueueGetTaskStatusQuery, useQueueGetTaskResultQuery } from './tasksHooks';
export type {
    UseQueueGetTaskStatusQueryOptions,
    UseQueueGetTaskResultQueryOptions,
} from './tasksHooks';

export {
    useQueueLockMutation,
    useQueueUnlockMutation,
    useQueueGetLockInfoQuery,
} from './lockHooks';
export type {
    UseQueueLockMutationOptions,
    UseQueueUnlockMutationOptions,
    UseQueueGetLockInfoQueryOptions,
} from './lockHooks';

export {
    useQueueGetConsoleOutputQuery,
    useQueueGetConsoleOutputUIDQuery,
    useQueueGetConsoleOutputUpdateQuery,
    useQueueStreamConsoleOutputMutation,
} from './consoleHooks';
export type {
    UseQueueGetConsoleOutputQueryOptions,
    UseQueueGetConsoleOutputUIDQueryOptions,
    UseQueueGetConsoleOutputUpdateQueryOptions,
    UseQueueStreamConsoleOutputMutationOptions,
} from './consoleHooks';

export {
    useQueueInterruptKernelMutation,
    useQueueStopManagerMutation,
    useQueueTestKillManagerMutation,
    useQueueTestServerSleepQuery,
} from './adminHooks';
export type {
    UseQueueInterruptKernelMutationOptions,
    UseQueueStopManagerMutationOptions,
    UseQueueTestKillManagerMutationOptions,
    UseQueueTestServerSleepQueryOptions,
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
    UseQueueWhoamiQueryOptions,
    UseQueueGetScopesQueryOptions,
    UseQueueListPrincipalsQueryOptions,
    UseQueueGetPrincipalQueryOptions,
    UseQueueGetCurrentApiKeyInfoQueryOptions,
    UseQueueCreateApiKeyMutationOptions,
    UseQueueCreateApiKeyForPrincipalMutationOptions,
    UseQueueRevokeApiKeyMutationOptions,
    UseQueueRefreshSessionMutationOptions,
    UseQueueRevokeSessionMutationOptions,
    UseQueueLogoutMutationOptions,
    QueueCreateApiKeyForPrincipalVariables,
    QueueRevokeApiKeyVariables,
    QueueRevokeSessionVariables,
} from './authHooks';

// #endregion
