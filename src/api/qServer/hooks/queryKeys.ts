import type { FinchQueryScope } from '@/api/shared/queryKeys';
import type { ConsoleOutputBody, ConsoleOutputUpdateBody } from '../types/console';
import type { PlansDevicesBody } from '../types/plansDevices';
import type { GetQueueItemBody } from '../types/queue';
import type { GetRunsBody } from '../types/runEngine';
import type { TaskBody } from '../types/tasks';
import type { TestServerSleepBody } from '../types/admin';

/**
 * Query keys for the queue-server hooks.
 *
 * Every key has the four-element shape every Finch backend uses — see
 * `@/api/shared/queryKeys` for why the scope is last and why args normalize to `null`:
 *
 * ```
 * [ 'qserver', <resource>, <args | null>, <scope> ]
 * ```
 *
 * The queue-server specifics: `getQueue()` and `getQueue({})` are the same request and share one
 * entry (object args are safe — TanStack's key hash is key-order stable), and seven roots are marked
 * "legacy" below because they match the keys the retired `src/api/qServer/hooks.ts` used, so an
 * existing `invalidateQueries` call keeps working.
 *
 * Call `invalidateAllQServerQueries` after changing the API key or the principal: auth is read at
 * request time and is deliberately absent from every key.
 */
export const QSERVER_QUERY_ROOT = 'qserver' as const;

export { INJECTED_CLIENT_SCOPE } from '@/api/shared/queryKeys';

/**
 * Which server a cached entry belongs to. Always the last element of a key.
 *
 * A base URL is enough to identify a queue server, so this is the shared scope unchanged — unlike
 * Tiled, which also needs the path prefix.
 */
export type QServerQueryScope = FinchQueryScope;

/**
 * The resource prefix of every query hook — one entry per query, 29 in total.
 *
 * The seven marked "legacy" match the keys `src/api/qServer/hooks.ts` uses, so an existing
 * `invalidateQueries` call keeps working against the new hooks.
 */
export const qServerQueryRoots = {
    // status
    ping: [QSERVER_QUERY_ROOT, 'ping'],
    root: [QSERVER_QUERY_ROOT, 'root'],
    status: [QSERVER_QUERY_ROOT, 'status'], // legacy
    config: [QSERVER_QUERY_ROOT, 'config'],

    // queue & history
    queue: [QSERVER_QUERY_ROOT, 'queue'], // legacy
    queueItem: [QSERVER_QUERY_ROOT, 'queueItem'], // legacy
    history: [QSERVER_QUERY_ROOT, 'history'], // legacy

    // run engine
    runs: [QSERVER_QUERY_ROOT, 'runs'],
    runsActive: [QSERVER_QUERY_ROOT, 'runsActive'], // legacy
    runsOpen: [QSERVER_QUERY_ROOT, 'runsOpen'],
    runsClosed: [QSERVER_QUERY_ROOT, 'runsClosed'],
    reMetadata: [QSERVER_QUERY_ROOT, 'reMetadata'],

    // catalogs
    plansAllowed: [QSERVER_QUERY_ROOT, 'plansAllowed'], // legacy
    devicesAllowed: [QSERVER_QUERY_ROOT, 'devicesAllowed'], // legacy
    plansExisting: [QSERVER_QUERY_ROOT, 'plansExisting'],
    devicesExisting: [QSERVER_QUERY_ROOT, 'devicesExisting'],

    // permissions
    permissions: [QSERVER_QUERY_ROOT, 'permissions'],

    // tasks
    taskStatus: [QSERVER_QUERY_ROOT, 'taskStatus'],
    taskResult: [QSERVER_QUERY_ROOT, 'taskResult'],

    // lock
    lockInfo: [QSERVER_QUERY_ROOT, 'lockInfo'],

    // console
    consoleOutput: [QSERVER_QUERY_ROOT, 'consoleOutput'],
    consoleOutputUid: [QSERVER_QUERY_ROOT, 'consoleOutputUid'],
    consoleOutputUpdate: [QSERVER_QUERY_ROOT, 'consoleOutputUpdate'],

    // admin
    testServerSleep: [QSERVER_QUERY_ROOT, 'testServerSleep'],

    // auth
    whoami: [QSERVER_QUERY_ROOT, 'whoami'],
    scopes: [QSERVER_QUERY_ROOT, 'scopes'],
    principals: [QSERVER_QUERY_ROOT, 'principals'],
    principal: [QSERVER_QUERY_ROOT, 'principal'],
    apiKeyInfo: [QSERVER_QUERY_ROOT, 'apiKeyInfo'],
} as const satisfies Record<string, readonly [typeof QSERVER_QUERY_ROOT, string]>;

export type QServerQueryRootName = keyof typeof qServerQueryRoots;

/** Every resource prefix, for bulk invalidation helpers. */
export const QSERVER_QUERY_ROOT_NAMES = Object.keys(qServerQueryRoots) as QServerQueryRootName[];

/**
 * Key builders, one per query hook.
 *
 * Each takes the scope first and the endpoint's own argument second, so the argument type is
 * exactly the one the client method accepts.
 */
export const qServerQueryKeys = {
    // status
    ping: (scope: QServerQueryScope) => [...qServerQueryRoots.ping, null, scope] as const,
    root: (scope: QServerQueryScope) => [...qServerQueryRoots.root, null, scope] as const,
    status: (scope: QServerQueryScope) => [...qServerQueryRoots.status, null, scope] as const,
    config: (scope: QServerQueryScope) => [...qServerQueryRoots.config, null, scope] as const,

    // queue & history
    queue: (scope: QServerQueryScope) => [...qServerQueryRoots.queue, null, scope] as const,
    queueItem: (scope: QServerQueryScope, body?: GetQueueItemBody) =>
        [...qServerQueryRoots.queueItem, body ?? null, scope] as const,
    history: (scope: QServerQueryScope) => [...qServerQueryRoots.history, null, scope] as const,

    // run engine
    runs: (scope: QServerQueryScope, body?: GetRunsBody) =>
        [...qServerQueryRoots.runs, body ?? null, scope] as const,
    runsActive: (scope: QServerQueryScope) =>
        [...qServerQueryRoots.runsActive, null, scope] as const,
    runsOpen: (scope: QServerQueryScope) => [...qServerQueryRoots.runsOpen, null, scope] as const,
    runsClosed: (scope: QServerQueryScope) =>
        [...qServerQueryRoots.runsClosed, null, scope] as const,
    reMetadata: (scope: QServerQueryScope) =>
        [...qServerQueryRoots.reMetadata, null, scope] as const,

    // catalogs
    plansAllowed: (scope: QServerQueryScope, body?: PlansDevicesBody) =>
        [...qServerQueryRoots.plansAllowed, body ?? null, scope] as const,
    devicesAllowed: (scope: QServerQueryScope, body?: PlansDevicesBody) =>
        [...qServerQueryRoots.devicesAllowed, body ?? null, scope] as const,
    plansExisting: (scope: QServerQueryScope, body?: PlansDevicesBody) =>
        [...qServerQueryRoots.plansExisting, body ?? null, scope] as const,
    devicesExisting: (scope: QServerQueryScope, body?: PlansDevicesBody) =>
        [...qServerQueryRoots.devicesExisting, body ?? null, scope] as const,

    // permissions
    permissions: (scope: QServerQueryScope) =>
        [...qServerQueryRoots.permissions, null, scope] as const,

    // tasks
    taskStatus: (scope: QServerQueryScope, body?: TaskBody) =>
        [...qServerQueryRoots.taskStatus, body ?? null, scope] as const,
    taskResult: (scope: QServerQueryScope, body?: TaskBody) =>
        [...qServerQueryRoots.taskResult, body ?? null, scope] as const,

    // lock
    lockInfo: (scope: QServerQueryScope) => [...qServerQueryRoots.lockInfo, null, scope] as const,

    // console
    consoleOutput: (scope: QServerQueryScope, body?: ConsoleOutputBody) =>
        [...qServerQueryRoots.consoleOutput, body ?? null, scope] as const,
    consoleOutputUid: (scope: QServerQueryScope) =>
        [...qServerQueryRoots.consoleOutputUid, null, scope] as const,
    consoleOutputUpdate: (scope: QServerQueryScope, body?: ConsoleOutputUpdateBody) =>
        [...qServerQueryRoots.consoleOutputUpdate, body ?? null, scope] as const,

    // admin
    testServerSleep: (scope: QServerQueryScope, body?: TestServerSleepBody) =>
        [...qServerQueryRoots.testServerSleep, body ?? null, scope] as const,

    // auth
    whoami: (scope: QServerQueryScope) => [...qServerQueryRoots.whoami, null, scope] as const,
    scopes: (scope: QServerQueryScope) => [...qServerQueryRoots.scopes, null, scope] as const,
    principals: (scope: QServerQueryScope) =>
        [...qServerQueryRoots.principals, null, scope] as const,
    principal: (scope: QServerQueryScope, uuid?: string) =>
        [...qServerQueryRoots.principal, uuid ?? null, scope] as const,
    apiKeyInfo: (scope: QServerQueryScope) =>
        [...qServerQueryRoots.apiKeyInfo, null, scope] as const,
} as const;

/** The key type a given resource produces, for parameterizing `UseQueryOptions`. */
export type QServerQueryKeyFor<N extends QServerQueryRootName> = ReturnType<
    (typeof qServerQueryKeys)[N]
>;
