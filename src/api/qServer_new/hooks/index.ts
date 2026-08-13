/**
 * TanStack Query hooks for the queue server — one per endpoint, 29 queries and 41 mutations.
 *
 * ```tsx
 * import { useGetQueueQuery, useAddQueueItemMutation } from '@/api/qServer_new';
 *
 * const queue = useGetQueueQuery({ query: { refetchInterval: 1000 } });
 * const add = useAddQueueItemMutation();
 * add.mutate({ item: { name: 'count', item_type: 'plan' } });
 * ```
 *
 * Every hook takes a single optional options object: the endpoint's own argument, `request` for
 * transport overrides, and `query`/`mutation` for TanStack options. Names mirror the client methods
 * (`getStatus` → `useGetStatusQuery`). See `../README.md` for the full contract.
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

export { usePingQuery, useGetRootQuery, useGetStatusQuery, useGetConfigQuery } from './statusHooks';
export type {
    UsePingQueryOptions,
    UseGetRootQueryOptions,
    UseGetStatusQueryOptions,
    UseGetConfigQueryOptions,
} from './statusHooks';

export {
    useGetQueueQuery,
    useGetQueueItemQuery,
    useAddQueueItemMutation,
    useAddQueueItemBatchMutation,
    useExecuteQueueItemMutation,
    useUpdateQueueItemMutation,
    useRemoveQueueItemMutation,
    useRemoveQueueItemBatchMutation,
    useMoveQueueItemMutation,
    useMoveQueueItemBatchMutation,
    useUploadQueueSpreadsheetMutation,
    useStartQueueMutation,
    useStopQueueMutation,
    useCancelQueueStopMutation,
    useClearQueueMutation,
    useSetQueueModeMutation,
    useSetQueueAutostartMutation,
} from './queueHooks';
export type {
    UseGetQueueQueryOptions,
    UseGetQueueItemQueryOptions,
    UseAddQueueItemMutationOptions,
    UseAddQueueItemBatchMutationOptions,
    UseExecuteQueueItemMutationOptions,
    UseUpdateQueueItemMutationOptions,
    UseRemoveQueueItemMutationOptions,
    UseRemoveQueueItemBatchMutationOptions,
    UseMoveQueueItemMutationOptions,
    UseMoveQueueItemBatchMutationOptions,
    UseUploadQueueSpreadsheetMutationOptions,
    UseStartQueueMutationOptions,
    UseStopQueueMutationOptions,
    UseCancelQueueStopMutationOptions,
    UseClearQueueMutationOptions,
    UseSetQueueModeMutationOptions,
    UseSetQueueAutostartMutationOptions,
} from './queueHooks';

export { useGetQueueHistoryQuery, useClearHistoryMutation } from './historyHooks';
export type {
    UseGetQueueHistoryQueryOptions,
    UseClearHistoryMutationOptions,
} from './historyHooks';

export {
    useOpenEnvironmentMutation,
    useCloseEnvironmentMutation,
    useDestroyEnvironmentMutation,
    useUpdateEnvironmentMutation,
} from './environmentHooks';
export type {
    UseOpenEnvironmentMutationOptions,
    UseCloseEnvironmentMutationOptions,
    UseDestroyEnvironmentMutationOptions,
    UseUpdateEnvironmentMutationOptions,
} from './environmentHooks';

export {
    usePauseREMutation,
    useResumeREMutation,
    useStopREMutation,
    useAbortREMutation,
    useHaltREMutation,
    useGetRunsQuery,
    useGetRunsActiveQuery,
    useGetRunsOpenQuery,
    useGetRunsClosedQuery,
    useGetREMetadataQuery,
} from './runEngineHooks';
export type {
    UsePauseREMutationOptions,
    UseResumeREMutationOptions,
    UseStopREMutationOptions,
    UseAbortREMutationOptions,
    UseHaltREMutationOptions,
    UseGetRunsQueryOptions,
    UseGetRunsActiveQueryOptions,
    UseGetRunsOpenQueryOptions,
    UseGetRunsClosedQueryOptions,
    UseGetREMetadataQueryOptions,
} from './runEngineHooks';

export {
    useGetPlansAllowedQuery,
    useGetDevicesAllowedQuery,
    useGetPlansExistingQuery,
    useGetDevicesExistingQuery,
} from './plansDevicesHooks';
export type {
    UseGetPlansAllowedQueryOptions,
    UseGetDevicesAllowedQueryOptions,
    UseGetPlansExistingQueryOptions,
    UseGetDevicesExistingQueryOptions,
} from './plansDevicesHooks';

export {
    useGetPermissionsQuery,
    useSetPermissionsMutation,
    useReloadPermissionsMutation,
} from './permissionsHooks';
export type {
    UseGetPermissionsQueryOptions,
    UseSetPermissionsMutationOptions,
    UseReloadPermissionsMutationOptions,
} from './permissionsHooks';

export { useExecuteFunctionMutation, useUploadScriptMutation } from './functionsScriptsHooks';
export type {
    UseExecuteFunctionMutationOptions,
    UseUploadScriptMutationOptions,
} from './functionsScriptsHooks';

export { useGetTaskStatusQuery, useGetTaskResultQuery } from './tasksHooks';
export type { UseGetTaskStatusQueryOptions, UseGetTaskResultQueryOptions } from './tasksHooks';

export { useLockMutation, useUnlockMutation, useGetLockInfoQuery } from './lockHooks';
export type {
    UseLockMutationOptions,
    UseUnlockMutationOptions,
    UseGetLockInfoQueryOptions,
} from './lockHooks';

export {
    useGetConsoleOutputQuery,
    useGetConsoleOutputUIDQuery,
    useGetConsoleOutputUpdateQuery,
    useStreamConsoleOutputMutation,
} from './consoleHooks';
export type {
    UseGetConsoleOutputQueryOptions,
    UseGetConsoleOutputUIDQueryOptions,
    UseGetConsoleOutputUpdateQueryOptions,
    UseStreamConsoleOutputMutationOptions,
} from './consoleHooks';

export {
    useInterruptKernelMutation,
    useStopManagerMutation,
    useTestKillManagerMutation,
    useTestServerSleepQuery,
} from './adminHooks';
export type {
    UseInterruptKernelMutationOptions,
    UseStopManagerMutationOptions,
    UseTestKillManagerMutationOptions,
    UseTestServerSleepQueryOptions,
} from './adminHooks';

export {
    useWhoamiQuery,
    useGetScopesQuery,
    useListPrincipalsQuery,
    useGetPrincipalQuery,
    useGetCurrentApiKeyInfoQuery,
    useCreateApiKeyMutation,
    useCreateApiKeyForPrincipalMutation,
    useRevokeApiKeyMutation,
    useRefreshSessionMutation,
    useRevokeSessionMutation,
    useLogoutMutation,
} from './authHooks';
export type {
    UseWhoamiQueryOptions,
    UseGetScopesQueryOptions,
    UseListPrincipalsQueryOptions,
    UseGetPrincipalQueryOptions,
    UseGetCurrentApiKeyInfoQueryOptions,
    UseCreateApiKeyMutationOptions,
    UseCreateApiKeyForPrincipalMutationOptions,
    UseRevokeApiKeyMutationOptions,
    UseRefreshSessionMutationOptions,
    UseRevokeSessionMutationOptions,
    UseLogoutMutationOptions,
    CreateApiKeyForPrincipalVariables,
    RevokeApiKeyVariables,
    RevokeSessionVariables,
} from './authHooks';

// #endregion
