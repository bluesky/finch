import type { QueueItem, RunningQueueItem } from '@/api/qServer/types/queue';

/**
 * The console output the simulator emits.
 *
 * Wording, logger names and the `[I <timestamp> <logger>]` prefix are copied from real
 * `/api/console_output/ws` traffic — see
 * [`references/console_output_ws.txt`](../../../api/qServer/references/console_output_ws.txt).
 * Matching the real thing matters for two reasons: a console viewer built against the sim looks
 * like one built against a server, and `src/components/QServer/QSConsole.tsx` keys off literal
 * substrings of these messages to decide when to refetch the queue and history.
 *
 * `QSConsole` splits the bracket prefix off before matching, so the substring contract applies to
 * the message *body*; `LEGACY_CONSOLE_PREFIXES` lists the bodies that must keep their leading text.
 */

/** Logger names the real server reports lines under. */
export const SIM_LOGGERS = {
    manager: 'bluesky_queueserver.manager.manager',
    startManager: 'bluesky_queueserver.manager.start_manager',
    worker: 'bluesky_queueserver.manager.worker',
    profileOps: 'bluesky_queueserver.manager.profile_ops',
    planMonitoring: 'bluesky_queueserver.manager.plan_monitoring',
} as const;

/** One console line, before the bracket prefix is applied. */
export interface SimConsoleLine {
    text: string;
    /** Logger for the bracket prefix. Defaults to the manager logger. */
    logger?: string;
    /** Log level letter in the prefix. Defaults to `'I'`. */
    level?: 'I' | 'W' | 'E';
    /**
     * Emit with no bracket prefix. Bluesky's own output — scan ids, stream names, the live table —
     * arrives unprefixed, and reproducing that is what makes the viewer look real.
     */
    bare?: boolean;
}

/** Single-line messages. Bodies only; the prefix is applied when they are emitted. */
export const SIM_CONSOLE = {
    // Queue control
    startingQueue: 'Starting queue processing ...',
    queueEmpty: 'Queue is empty.',
    noItemsLeft: 'No items are left in the queue.',
    queueEmptyNothingToProcess: 'Queue is empty. Nothing to process.',
    queueStopRequested: 'Queue stop is requested ...',
    queueStopped: 'Queue is stopped.',
    queueStoppedAfterFailure: 'Queue processing is stopped due to plan failure.',
    clearingQueue: 'Clearing the queue ...',
    clearingHistory: 'Clearing the history ...',

    // Item lifecycle
    processingNextItem: (remaining: number) =>
        `Processing the next queue item: ${remaining} plans are left in the queue.`,
    itemAdded: (item: QueueItem, qsize: number) =>
        `Item added: success=True item_type='${item.item_type}' name='${item.name}' ` +
        `item_uid='${item.item_uid}' qsize=${qsize}.`,
    removingItem: 'Removing item from the queue ...',

    // Run outcomes
    planExited: (planState: string) => `The plan was exited. Plan state: ${planState}`,
    planFailed: (msg: string) => `The plan failed: ${msg}`,

    // Run engine control
    pausing: (option: string) => `Pausing the queue (option='${option}') ...`,
    paused: 'Run Engine is paused.',
    resuming: 'Resuming the paused plan ...',

    // Environment
    closingEnvironment: 'Closing existing RE environment ...',
    environmentClosed: 'RE environment is closed.',
    destroyingEnvironment: 'Destroying the RE environment ...',
    environmentDestroyed: 'RE environment is destroyed.',
} as const;

/**
 * The substrings `QSConsole`'s watcher keys off.
 *
 * A test drives the transition behind each one and asserts it still appears, so rewording a
 * message cannot silently stop a consumer from refetching.
 */
export const LEGACY_CONSOLE_PREFIXES = [
    'Starting queue processing',
    'Processing the next queue item',
    'Starting the plan',
    'Item added: success=True',
    'Removing item from the queue',
    'Clearing the queue',
    'Queue is empty',
    'The plan failed',
] as const;

const DEFAULT_STARTUP_DIR = '/opt/bluesky/startup_sim';

/**
 * The first half of opening an environment: the request is accepted and the worker starts.
 *
 * Split from the second half because the two land at different times — `environmentOpenMs` apart —
 * and a console viewer should show the gap the way a real server does.
 */
export function environmentOpenBeginSequence(): SimConsoleLine[] {
    return [
        { text: 'Opening the new RE environment ...' },
        { text: 'Starting RE Worker ...', logger: SIM_LOGGERS.startManager },
        { text: 'Waiting for RE worker to start ...' },
    ];
}

/**
 * The second half: startup code loads and the Run Engine comes up.
 *
 * Abridged — the real server also logs every startup file it reads, which says nothing about
 * simulated state.
 */
export function environmentOpenFinishSequence(startupDir = DEFAULT_STARTUP_DIR): SimConsoleLine[] {
    return [
        {
            text: `Loading RE Worker startup code from directory '${startupDir}' ...`,
            logger: SIM_LOGGERS.profileOps,
        },
        { text: 'Startup code was successfully loaded.', logger: SIM_LOGGERS.worker },
        { text: 'Generating lists of allowed plans and devices', logger: SIM_LOGGERS.worker },
        {
            text: 'List of allowed plans and devices was successfully generated',
            logger: SIM_LOGGERS.worker,
        },
        { text: 'Instantiating and configuring Run Engine ...', logger: SIM_LOGGERS.worker },
        { text: 'RE Environment is ready', logger: SIM_LOGGERS.worker },
        { text: 'Worker started successfully.' },
    ];
}

/**
 * Starting a plan: the item dictionary, the worker handoff, then the scan identifiers bluesky
 * prints unprefixed.
 */
export function planStartSequence(options: {
    item: RunningQueueItem;
    scanId: number;
    runUid: string;
    timeLabel: string;
}): SimConsoleLine[] {
    const { item, scanId, runUid, timeLabel } = options;
    return [
        // The real server sends the header and the item dict as one multi-line message.
        { text: `Starting the plan:\n${formatItemDict(item)}.` },
        { text: 'Starting execution of a plan ...', logger: SIM_LOGGERS.worker },
        { text: `Starting a plan '${item.name}'.`, logger: SIM_LOGGERS.worker },
        { text: `Transient Scan ID: ${scanId}     Time: ${timeLabel}`, bare: true },
        { text: `Persistent Unique Scan ID: '${runUid}'`, bare: true },
        { text: `New run was open: '${runUid}'`, logger: SIM_LOGGERS.planMonitoring },
        { text: "New stream: 'primary'", bare: true },
    ];
}

/**
 * Finishing a run: the run closes, then the worker reports the plan state.
 *
 * The `generator …` summary line only appears when a plan ran to completion, so it is omitted for
 * a failure, abort or halt.
 */
export function planEndSequence(options: {
    runUid: string;
    planState: string;
    scanId: number;
    planName: string;
    failed?: boolean;
}): SimConsoleLine[] {
    const { runUid, planState, scanId, planName, failed } = options;
    return [
        { text: `Run was closed: '${runUid}'`, logger: SIM_LOGGERS.planMonitoring },
        ...(failed
            ? []
            : [
                  {
                      text: `generator ${planName} ['${runUid.slice(0, 8)}'] (scan num: ${scanId})`,
                      bare: true,
                  },
              ]),
        { text: SIM_CONSOLE.planExited(planState), logger: SIM_LOGGERS.worker },
    ];
}

/** `[I 2026-08-13 09:53:55,127 bluesky_queueserver.manager.manager] ` */
export function formatConsolePrefix(timeMs: number, line: SimConsoleLine): string {
    const level = line.level ?? 'I';
    const logger = line.logger ?? SIM_LOGGERS.manager;
    return `[${level} ${formatConsoleTimestamp(timeMs)} ${logger}] `;
}

/** `2026-08-13 09:53:55,127` — local time, comma before milliseconds, as Python's logging does. */
export function formatConsoleTimestamp(timeMs: number): string {
    const date = new Date(timeMs);
    const pad = (value: number, width = 2) => String(value).padStart(width, '0');
    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())},` +
        `${pad(date.getMilliseconds(), 3)}`
    );
}

/** `HH:mm:ss`, the format bluesky uses for a scan's start time. */
export function formatClockTime(timeMs: number): string {
    return formatConsoleTimestamp(timeMs).slice(11, 19);
}

/** Render a queue item the way Python's pprint does, since that is what the server logs. */
function formatItemDict(item: RunningQueueItem): string {
    const entries: [string, unknown][] = [
        ['name', item.name],
        ...(item.args ? ([['args', item.args]] as [string, unknown][]) : []),
        ...(item.kwargs ? ([['kwargs', item.kwargs]] as [string, unknown][]) : []),
        ['user', item.user],
        ['user_group', item.user_group],
        ['item_uid', item.item_uid],
    ];

    const lines = entries.map(([key, value], index) => {
        const open = index === 0 ? '{' : ' ';
        const comma = index === entries.length - 1 ? '' : ',';
        return `${open}'${key}': ${pythonRepr(value)}${comma}`;
    });
    return `${lines.join('\n')}}`;
}

function pythonRepr(value: unknown): string {
    if (typeof value === 'string') return `'${value}'`;
    if (Array.isArray(value)) return `[${value.map(pythonRepr).join(', ')}]`;
    if (value && typeof value === 'object') {
        const body = Object.entries(value)
            .map(([key, entry]) => `'${key}': ${pythonRepr(entry)}`)
            .join(', ');
        return `{${body}}`;
    }
    return String(value);
}
