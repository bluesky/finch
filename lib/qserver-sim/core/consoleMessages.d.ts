import { QueueItem, RunningQueueItem } from '../../../api/qServer/types/queue';
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
export declare const SIM_LOGGERS: {
    readonly manager: "bluesky_queueserver.manager.manager";
    readonly startManager: "bluesky_queueserver.manager.start_manager";
    readonly worker: "bluesky_queueserver.manager.worker";
    readonly profileOps: "bluesky_queueserver.manager.profile_ops";
    readonly planMonitoring: "bluesky_queueserver.manager.plan_monitoring";
};
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
export declare const SIM_CONSOLE: {
    readonly startingQueue: "Starting queue processing ...";
    readonly queueEmpty: "Queue is empty.";
    readonly noItemsLeft: "No items are left in the queue.";
    readonly queueEmptyNothingToProcess: "Queue is empty. Nothing to process.";
    readonly queueStopRequested: "Queue stop is requested ...";
    readonly queueStopped: "Queue is stopped.";
    readonly queueStoppedAfterFailure: "Queue processing is stopped due to plan failure.";
    readonly clearingQueue: "Clearing the queue ...";
    readonly clearingHistory: "Clearing the history ...";
    readonly processingNextItem: (remaining: number) => string;
    readonly itemAdded: (item: QueueItem, qsize: number) => string;
    readonly removingItem: "Removing item from the queue ...";
    readonly planExited: (planState: string) => string;
    readonly planFailed: (msg: string) => string;
    readonly pausing: (option: string) => string;
    readonly paused: "Run Engine is paused.";
    readonly resuming: "Resuming the paused plan ...";
    readonly closingEnvironment: "Closing existing RE environment ...";
    readonly environmentClosed: "RE environment is closed.";
    readonly destroyingEnvironment: "Destroying the RE environment ...";
    readonly environmentDestroyed: "RE environment is destroyed.";
};
/**
 * The substrings `QSConsole`'s watcher keys off.
 *
 * A test drives the transition behind each one and asserts it still appears, so rewording a
 * message cannot silently stop a consumer from refetching.
 */
export declare const LEGACY_CONSOLE_PREFIXES: readonly ["Starting queue processing", "Processing the next queue item", "Starting the plan", "Item added: success=True", "Removing item from the queue", "Clearing the queue", "Queue is empty", "The plan failed"];
/**
 * The first half of opening an environment: the request is accepted and the worker starts.
 *
 * Split from the second half because the two land at different times — `environmentOpenMs` apart —
 * and a console viewer should show the gap the way a real server does.
 */
export declare function environmentOpenBeginSequence(): SimConsoleLine[];
/**
 * The second half: startup code loads and the Run Engine comes up.
 *
 * Abridged — the real server also logs every startup file it reads, which says nothing about
 * simulated state.
 */
export declare function environmentOpenFinishSequence(startupDir?: string): SimConsoleLine[];
/**
 * Starting a plan: the item dictionary, the worker handoff, then the scan identifiers bluesky
 * prints unprefixed.
 */
export declare function planStartSequence(options: {
    item: RunningQueueItem;
    scanId: number;
    runUid: string;
    timeLabel: string;
}): SimConsoleLine[];
/**
 * Finishing a run: the run closes, then the worker reports the plan state.
 *
 * The `generator …` summary line only appears when a plan ran to completion, so it is omitted for
 * a failure, abort or halt.
 */
export declare function planEndSequence(options: {
    runUid: string;
    planState: string;
    scanId: number;
    planName: string;
    failed?: boolean;
}): SimConsoleLine[];
/** `[I 2026-08-13 09:53:55,127 bluesky_queueserver.manager.manager] ` */
export declare function formatConsolePrefix(timeMs: number, line: SimConsoleLine): string;
/** `2026-08-13 09:53:55,127` — local time, comma before milliseconds, as Python's logging does. */
export declare function formatConsoleTimestamp(timeMs: number): string;
/** `HH:mm:ss`, the format bluesky uses for a scan's start time. */
export declare function formatClockTime(timeMs: number): string;
//# sourceMappingURL=consoleMessages.d.ts.map