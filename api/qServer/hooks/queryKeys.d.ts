import { FinchQueryScope } from '../../shared/queryKeys';
import { ConsoleOutputBody, ConsoleOutputUpdateBody } from '../types/console';
import { PlansDevicesBody } from '../types/plansDevices';
import { GetQueueItemBody } from '../types/queue';
import { GetRunsBody } from '../types/runEngine';
import { TaskBody } from '../types/tasks';
import { TestServerSleepBody } from '../types/admin';
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
export declare const QSERVER_QUERY_ROOT: "qserver";
export { INJECTED_CLIENT_SCOPE } from '../../shared/queryKeys';
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
export declare const qServerQueryRoots: {
    readonly ping: readonly ["qserver", "ping"];
    readonly root: readonly ["qserver", "root"];
    readonly status: readonly ["qserver", "status"];
    readonly config: readonly ["qserver", "config"];
    readonly queue: readonly ["qserver", "queue"];
    readonly queueItem: readonly ["qserver", "queueItem"];
    readonly history: readonly ["qserver", "history"];
    readonly runs: readonly ["qserver", "runs"];
    readonly runsActive: readonly ["qserver", "runsActive"];
    readonly runsOpen: readonly ["qserver", "runsOpen"];
    readonly runsClosed: readonly ["qserver", "runsClosed"];
    readonly reMetadata: readonly ["qserver", "reMetadata"];
    readonly plansAllowed: readonly ["qserver", "plansAllowed"];
    readonly devicesAllowed: readonly ["qserver", "devicesAllowed"];
    readonly plansExisting: readonly ["qserver", "plansExisting"];
    readonly devicesExisting: readonly ["qserver", "devicesExisting"];
    readonly permissions: readonly ["qserver", "permissions"];
    readonly taskStatus: readonly ["qserver", "taskStatus"];
    readonly taskResult: readonly ["qserver", "taskResult"];
    readonly lockInfo: readonly ["qserver", "lockInfo"];
    readonly consoleOutput: readonly ["qserver", "consoleOutput"];
    readonly consoleOutputUid: readonly ["qserver", "consoleOutputUid"];
    readonly consoleOutputUpdate: readonly ["qserver", "consoleOutputUpdate"];
    readonly testServerSleep: readonly ["qserver", "testServerSleep"];
    readonly whoami: readonly ["qserver", "whoami"];
    readonly scopes: readonly ["qserver", "scopes"];
    readonly principals: readonly ["qserver", "principals"];
    readonly principal: readonly ["qserver", "principal"];
    readonly apiKeyInfo: readonly ["qserver", "apiKeyInfo"];
};
export type QServerQueryRootName = keyof typeof qServerQueryRoots;
/** Every resource prefix, for bulk invalidation helpers. */
export declare const QSERVER_QUERY_ROOT_NAMES: QServerQueryRootName[];
/**
 * Key builders, one per query hook.
 *
 * Each takes the scope first and the endpoint's own argument second, so the argument type is
 * exactly the one the client method accepts.
 */
export declare const qServerQueryKeys: {
    readonly ping: (scope: QServerQueryScope) => readonly ["qserver", "ping", null, FinchQueryScope];
    readonly root: (scope: QServerQueryScope) => readonly ["qserver", "root", null, FinchQueryScope];
    readonly status: (scope: QServerQueryScope) => readonly ["qserver", "status", null, FinchQueryScope];
    readonly config: (scope: QServerQueryScope) => readonly ["qserver", "config", null, FinchQueryScope];
    readonly queue: (scope: QServerQueryScope) => readonly ["qserver", "queue", null, FinchQueryScope];
    readonly queueItem: (scope: QServerQueryScope, body?: GetQueueItemBody) => readonly ["qserver", "queueItem", import('../types/queue').QueueItemAddress | null, FinchQueryScope];
    readonly history: (scope: QServerQueryScope) => readonly ["qserver", "history", null, FinchQueryScope];
    readonly runs: (scope: QServerQueryScope, body?: GetRunsBody) => readonly ["qserver", "runs", GetRunsBody | null, FinchQueryScope];
    readonly runsActive: (scope: QServerQueryScope) => readonly ["qserver", "runsActive", null, FinchQueryScope];
    readonly runsOpen: (scope: QServerQueryScope) => readonly ["qserver", "runsOpen", null, FinchQueryScope];
    readonly runsClosed: (scope: QServerQueryScope) => readonly ["qserver", "runsClosed", null, FinchQueryScope];
    readonly reMetadata: (scope: QServerQueryScope) => readonly ["qserver", "reMetadata", null, FinchQueryScope];
    readonly plansAllowed: (scope: QServerQueryScope, body?: PlansDevicesBody) => readonly ["qserver", "plansAllowed", PlansDevicesBody | null, FinchQueryScope];
    readonly devicesAllowed: (scope: QServerQueryScope, body?: PlansDevicesBody) => readonly ["qserver", "devicesAllowed", PlansDevicesBody | null, FinchQueryScope];
    readonly plansExisting: (scope: QServerQueryScope, body?: PlansDevicesBody) => readonly ["qserver", "plansExisting", PlansDevicesBody | null, FinchQueryScope];
    readonly devicesExisting: (scope: QServerQueryScope, body?: PlansDevicesBody) => readonly ["qserver", "devicesExisting", PlansDevicesBody | null, FinchQueryScope];
    readonly permissions: (scope: QServerQueryScope) => readonly ["qserver", "permissions", null, FinchQueryScope];
    readonly taskStatus: (scope: QServerQueryScope, body?: TaskBody) => readonly ["qserver", "taskStatus", TaskBody | null, FinchQueryScope];
    readonly taskResult: (scope: QServerQueryScope, body?: TaskBody) => readonly ["qserver", "taskResult", TaskBody | null, FinchQueryScope];
    readonly lockInfo: (scope: QServerQueryScope) => readonly ["qserver", "lockInfo", null, FinchQueryScope];
    readonly consoleOutput: (scope: QServerQueryScope, body?: ConsoleOutputBody) => readonly ["qserver", "consoleOutput", ConsoleOutputBody | null, FinchQueryScope];
    readonly consoleOutputUid: (scope: QServerQueryScope) => readonly ["qserver", "consoleOutputUid", null, FinchQueryScope];
    readonly consoleOutputUpdate: (scope: QServerQueryScope, body?: ConsoleOutputUpdateBody) => readonly ["qserver", "consoleOutputUpdate", ConsoleOutputUpdateBody | null, FinchQueryScope];
    readonly testServerSleep: (scope: QServerQueryScope, body?: TestServerSleepBody) => readonly ["qserver", "testServerSleep", TestServerSleepBody | null, FinchQueryScope];
    readonly whoami: (scope: QServerQueryScope) => readonly ["qserver", "whoami", null, FinchQueryScope];
    readonly scopes: (scope: QServerQueryScope) => readonly ["qserver", "scopes", null, FinchQueryScope];
    readonly principals: (scope: QServerQueryScope) => readonly ["qserver", "principals", null, FinchQueryScope];
    readonly principal: (scope: QServerQueryScope, uuid?: string) => readonly ["qserver", "principal", string | null, FinchQueryScope];
    readonly apiKeyInfo: (scope: QServerQueryScope) => readonly ["qserver", "apiKeyInfo", null, FinchQueryScope];
};
/** The key type a given resource produces, for parameterizing `UseQueryOptions`. */
export type QServerQueryKeyFor<N extends QServerQueryRootName> = ReturnType<(typeof qServerQueryKeys)[N]>;
//# sourceMappingURL=queryKeys.d.ts.map