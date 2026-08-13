import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { QSERVER_QUERY_ROOT, qServerQueryRoots, type QServerQueryRootName } from './queryKeys';

/**
 * Which queries each mutation refreshes.
 *
 * Grouped into named **bundles** rather than listing roots per mutation, because the interesting
 * question is "what did this write change" and several mutations answer it identically. Invalidation
 * matches the resource prefix and ignores the scope, so it refreshes that resource on every server —
 * over-invalidating a multi-server app is far cheaper than serving it stale data.
 */
export const QSERVER_INVALIDATION_BUNDLES = {
    /** RE Manager status, and the two endpoints that return the same payload. */
    status: ['status', 'ping', 'root'],
    queue: ['queue', 'queueItem'],
    history: ['history'],
    runs: ['runs', 'runsActive', 'runsOpen', 'runsClosed'],
    /** Allowed/existing plans and devices — reloaded whenever the environment or permissions move. */
    catalogs: ['plansAllowed', 'devicesAllowed', 'plansExisting', 'devicesExisting'],
    permissions: ['permissions'],
    lock: ['lockInfo'],
    auth: ['whoami', 'scopes', 'principals', 'principal', 'apiKeyInfo'],
} as const satisfies Record<string, readonly QServerQueryRootName[]>;

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
export const QSERVER_MUTATION_INVALIDATIONS = {
    // queue writes
    useAddQueueItemMutation: ['queue', 'status'],
    useAddQueueItemBatchMutation: ['queue', 'status'],
    useExecuteQueueItemMutation: ['queue', 'status', 'runs'],
    useUpdateQueueItemMutation: ['queue', 'status'],
    useRemoveQueueItemMutation: ['queue', 'status'],
    useRemoveQueueItemBatchMutation: ['queue', 'status'],
    useMoveQueueItemMutation: ['queue', 'status'],
    useMoveQueueItemBatchMutation: ['queue', 'status'],
    useUploadQueueSpreadsheetMutation: ['queue', 'status'],

    // queue control
    useStartQueueMutation: ['queue', 'status', 'runs'],
    useStopQueueMutation: ['status'],
    useCancelQueueStopMutation: ['status'],
    useClearQueueMutation: ['queue', 'status'],
    useSetQueueModeMutation: ['status'],
    useSetQueueAutostartMutation: ['status'],

    // history
    useClearHistoryMutation: ['history', 'status'],

    // environment
    useOpenEnvironmentMutation: ['status', 'catalogs'],
    useCloseEnvironmentMutation: ['status', 'catalogs', 'runs'],
    useDestroyEnvironmentMutation: ['status', 'catalogs', 'runs', 'queue'],
    useUpdateEnvironmentMutation: ['status', 'catalogs'],

    // run engine
    usePauseREMutation: ['status', 'queue', 'runs'],
    useResumeREMutation: ['status', 'runs'],
    useStopREMutation: ['status', 'queue', 'history', 'runs'],
    useAbortREMutation: ['status', 'queue', 'history', 'runs'],
    useHaltREMutation: ['status', 'queue', 'history', 'runs'],

    // permissions
    useSetPermissionsMutation: ['permissions', 'catalogs', 'status'],
    useReloadPermissionsMutation: ['permissions', 'catalogs', 'status'],

    // functions & scripts
    useExecuteFunctionMutation: ['status'],
    useUploadScriptMutation: ['status', 'catalogs'],

    // lock
    useLockMutation: ['lock', 'status'],
    useUnlockMutation: ['lock', 'status'],

    // console
    useStreamConsoleOutputMutation: [],

    // admin
    useInterruptKernelMutation: ['status'],
    useStopManagerMutation: ['status'],
    useTestKillManagerMutation: ['status'],

    // auth
    useCreateApiKeyMutation: [],
    useCreateApiKeyForPrincipalMutation: ['auth'],
    useRevokeApiKeyMutation: ['auth'],
    useRefreshSessionMutation: ['auth'],
    useRevokeSessionMutation: ['auth'],
    useLogoutMutation: ['auth'],
} as const satisfies Record<string, readonly QServerInvalidationBundleName[]>;

export type QServerMutationHookName = keyof typeof QSERVER_MUTATION_INVALIDATIONS;

/** Expand bundle names to the resource roots they cover, de-duplicated. */
export function resolveInvalidationRoots(
    bundles: readonly QServerInvalidationBundleName[],
): QServerQueryRootName[] {
    const roots = new Set<QServerQueryRootName>();
    for (const bundle of bundles) {
        for (const root of QSERVER_INVALIDATION_BUNDLES[bundle]) roots.add(root);
    }
    return [...roots];
}

/**
 * Invalidate whole resources by name.
 *
 * Awaited by the mutation hooks, so `mutateAsync` resolves only once the affected queries have
 * refetched — a caller can read fresh data immediately afterwards.
 */
export function invalidateQServerRoots(
    queryClient: QueryClient,
    roots: readonly QServerQueryRootName[],
): Promise<void> {
    return Promise.all(
        roots.map((root) => queryClient.invalidateQueries({ queryKey: qServerQueryRoots[root] })),
    ).then(() => undefined);
}

/**
 * Invalidate every queue-server query.
 *
 * The right response to changing the API key or the signed-in principal: auth is read at request
 * time and is deliberately not part of any query key, so a credential change invalidates everything
 * rather than one entry.
 */
export function invalidateAllQServerQueries(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: [QSERVER_QUERY_ROOT] });
}

/** Imperative invalidation, for components that need to refresh outside a mutation. */
export function useQServerInvalidate(): {
    roots: (...names: QServerQueryRootName[]) => Promise<void>;
    bundles: (...names: QServerInvalidationBundleName[]) => Promise<void>;
    all: () => Promise<void>;
} {
    const queryClient = useQueryClient();

    const roots = useCallback(
        (...names: QServerQueryRootName[]) => invalidateQServerRoots(queryClient, names),
        [queryClient],
    );
    const bundles = useCallback(
        (...names: QServerInvalidationBundleName[]) =>
            invalidateQServerRoots(queryClient, resolveInvalidationRoots(names)),
        [queryClient],
    );
    const all = useCallback(() => invalidateAllQServerQueries(queryClient), [queryClient]);

    return useMemo(() => ({ roots, bundles, all }), [roots, bundles, all]);
}
