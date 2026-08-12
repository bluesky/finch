import type { QServerEndpoints } from '@/api/qServer_new/types/clientSurface';

/**
 * The queue-server operations Finch's UI actually calls.
 *
 * A `Pick` of the full 70-operation surface, so `QServerApiClient` satisfies it structurally for
 * free — and so does the simulator client in `@/lib/qserver-sim`. That is what lets a provider
 * hand either one to a component without either side knowing the other exists.
 *
 * Deliberately not the whole surface: auth, permissions, admin, function/script execution,
 * spreadsheet upload and the streaming console are not simulated, and leaving them out turns
 * "the sim can't do that" into a compile error rather than a runtime surprise in a story.
 *
 * Add an entry here only alongside a matching route in `@/lib/qserver-sim` — a test asserts the
 * two lists agree.
 */
export type QServerClientLike = Pick<
    QServerEndpoints,
    // status
    | 'ping'
    | 'getRoot'
    | 'getStatus'
    // queue reads
    | 'getQueue'
    | 'getQueueItem'
    // queue writes
    | 'addQueueItem'
    | 'addQueueItemBatch'
    | 'executeQueueItem'
    | 'updateQueueItem'
    | 'removeQueueItem'
    | 'removeQueueItemBatch'
    | 'moveQueueItem'
    // queue control
    | 'startQueue'
    | 'stopQueue'
    | 'cancelQueueStop'
    | 'clearQueue'
    | 'setQueueMode'
    | 'setQueueAutostart'
    // history
    | 'getQueueHistory'
    | 'clearHistory'
    // environment
    | 'openEnvironment'
    | 'closeEnvironment'
    | 'destroyEnvironment'
    // run engine
    | 'pauseRE'
    | 'resumeRE'
    | 'stopRE'
    | 'abortRE'
    | 'haltRE'
    | 'getRuns'
    | 'getRunsActive'
    | 'getRunsOpen'
    | 'getRunsClosed'
    // catalogs
    | 'getPlansAllowed'
    | 'getDevicesAllowed'
    | 'getPlansExisting'
    | 'getDevicesExisting'
    // console
    | 'getConsoleOutput'
    | 'getConsoleOutputUID'
    | 'getConsoleOutputUpdate'
    // tasks
    | 'getTaskStatus'
    | 'getTaskResult'
    // lock
    | 'lock'
    | 'unlock'
    | 'getLockInfo'
>;

/** The method names of {@link QServerClientLike}, for the sim's coverage test. */
export const QSERVER_CLIENT_LIKE_METHODS: readonly (keyof QServerClientLike)[] = [
    'ping',
    'getRoot',
    'getStatus',
    'getQueue',
    'getQueueItem',
    'addQueueItem',
    'addQueueItemBatch',
    'executeQueueItem',
    'updateQueueItem',
    'removeQueueItem',
    'removeQueueItemBatch',
    'moveQueueItem',
    'startQueue',
    'stopQueue',
    'cancelQueueStop',
    'clearQueue',
    'setQueueMode',
    'setQueueAutostart',
    'getQueueHistory',
    'clearHistory',
    'openEnvironment',
    'closeEnvironment',
    'destroyEnvironment',
    'pauseRE',
    'resumeRE',
    'stopRE',
    'abortRE',
    'haltRE',
    'getRuns',
    'getRunsActive',
    'getRunsOpen',
    'getRunsClosed',
    'getPlansAllowed',
    'getDevicesAllowed',
    'getPlansExisting',
    'getDevicesExisting',
    'getConsoleOutput',
    'getConsoleOutputUID',
    'getConsoleOutputUpdate',
    'getTaskStatus',
    'getTaskResult',
    'lock',
    'unlock',
    'getLockInfo',
];
