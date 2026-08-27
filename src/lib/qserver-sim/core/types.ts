import type { QServerSim } from './QServerSim';
import type { ConsoleOutputMessage } from '@/api/qServer/types/console';
import type { HistoryItem } from '@/api/qServer/types/history';
import type { LockInfo } from '@/api/qServer/types/lock';
import type { Device, Plan } from '@/api/qServer/types/plansDevices';
import type { PlanQueueMode } from '@/api/qServer/types/status';
import type { QueueItem, RunningQueueItem } from '@/api/qServer/types/queue';
import type { RunsActiveListItem } from '@/api/qServer/types/runEngine';
import type { TaskState } from '@/api/qServer/types/tasks';

/**
 * Types for the queue-server simulator.
 *
 * Every wire shape is imported from `@/api/qServer/types/*` — the sim produces the real
 * response types and never redeclares them. Only sim-internal bookkeeping is defined here.
 */

export type Unsubscribe = () => void;

/** `manager_state` values the sim produces (a subset of bluesky-queueserver's MState). */
export type SimManagerState =
    | 'initializing'
    | 'idle'
    | 'paused'
    | 'creating_environment'
    | 'starting_queue'
    | 'executing_queue'
    | 'executing_task'
    | 'closing_environment'
    | 'destroying_environment';

/** `re_state` values the sim produces (a subset of the bluesky RunEngine states). */
export type SimReState =
    | 'idle'
    | 'running'
    | 'paused'
    | 'aborting'
    | 'stopping'
    | 'halting'
    | 'panicked';

/** `worker_environment_state` values the sim produces. */
export type SimEnvironmentState =
    | 'closed'
    | 'initializing'
    | 'idle'
    | 'executing_plan'
    | 'executing_task'
    | 'closing';

/** Whether the running plan came off the queue or from a one-shot `queue/item/execute`. */
export type SimRunOrigin = 'queue' | 'execute';

/** Exit statuses the sim writes into a history item's `result`. */
export type SimExitStatus = 'completed' | 'failed' | 'stopped' | 'abort' | 'halted';

/** The plan currently on the Run Engine, plus sim-only progress bookkeeping. */
export interface SimRunningSlot {
    /** Exactly what `GET /api/queue/get` reports as `running_item`. */
    item: RunningQueueItem;
    origin: SimRunOrigin;
    /** Simulated milliseconds accumulated so far. Paused time is not counted. */
    elapsedMs: number;
    /** Simulated milliseconds this run needs in total. */
    durationMs: number;
    paused: boolean;
    runUid: string;
    scanId: number;
    /** Armed at dequeue time from `failNextRun`; decides the terminal result. */
    willFail: boolean;
}

export interface SimTask {
    task_uid: string;
    status: TaskState;
    /** Simulated ms until the task completes. `0` means it already has. */
    remainingMs: number;
    result?: {
        success: boolean;
        msg: string;
        return_value?: unknown;
        traceback?: string;
        time_start: number;
        time_stop?: number;
    };
}

/** A console line plus the uid `console_output_update` needs to deliver incrementally. */
export type SimConsoleMessage = ConsoleOutputMessage & { uid: string };

/**
 * Every uid the real server bumps when the corresponding data changes.
 *
 * These matter more than they look: the legacy UI only refetches the queue and history when
 * `plan_queue_uid` / `plan_history_uid` change, so the bump rules in `QServerSim` are a
 * behavioural contract, not cosmetics.
 */
export interface QServerSimUids {
    plan_queue_uid: string;
    plan_history_uid: string;
    run_list_uid: string;
    task_results_uid: string;
    lock_info_uid: string;
    devices_allowed_uid: string;
    plans_allowed_uid: string;
    devices_existing_uid: string;
    plans_existing_uid: string;
    console_output_uid: string;
}

/** Internal countdowns, in simulated ms. Driven by `advance()`, never by `setTimeout`. */
export interface SimPendingTimers {
    /** > 0 while the environment is opening. */
    environmentOpenMs: number;
    /** > 0 while the environment is closing. */
    environmentCloseMs: number;
}

export interface QServerSimState {
    /** Reported as `status.msg`, e.g. `'RE Manager v0.0.21'`. */
    version: string;

    plansAllowed: Record<string, Plan>;
    devicesAllowed: Record<string, Device>;

    queue: QueueItem[];
    history: HistoryItem[];
    running: SimRunningSlot | null;

    managerState: SimManagerState;
    reState: SimReState | null;
    environmentState: SimEnvironmentState;
    queueStopPending: boolean;
    pausePending: boolean;
    queueAutostartEnabled: boolean;
    queueMode: PlanQueueMode;

    /** Runs of the current plan; replaced whenever a new plan starts. */
    runList: RunsActiveListItem[];

    /** Bounded ring buffer, oldest first. */
    console: SimConsoleMessage[];

    tasks: Record<string, SimTask>;
    lock: LockInfo;
    lockKey: string | null;

    scanIdCounter: number;
    timers: SimPendingTimers;
    uids: QServerSimUids;
    /** Monotonic counter bumped by every mutation; gates change notification. */
    versionCounter: number;
}

/** Runtime-tunable behaviour. Every field has a default; see `DEFAULT_BEHAVIOR`. */
export interface QServerSimBehaviorOptions {
    /** Simulated run length, in ms. Default 3000. */
    runDurationMs?: number;
    /** Per-plan overrides, e.g. `{ count: 1000, grid_scan: 8000 }`. */
    runDurationByPlan?: Record<string, number>;
    /** Progress and complete runs automatically. Default true. */
    autoCompleteRuns?: boolean;
    /** Arm the next dequeued run to fail. Consumed on dequeue. Default false. */
    failNextRun?: boolean;
    /** Message recorded in the failed run's result. */
    failMessage?: string;
    /** Artificial response latency in ms. Delays the response, never the mutation. */
    latencyMs?: number;
    /** Emit console lines on transitions. Default true. */
    consoleOutput?: boolean;
    /**
     * Prefix lines with `[I <timestamp> <logger>]`, as the real server does. Default true.
     *
     * Consumers that match on message text should strip the bracket block first (which
     * `QSConsole` does); turn this off only if you want bare message bodies.
     */
    consolePrefix?: boolean;
    /** Max console lines retained. Default 1000, matching the server's own bound. */
    consoleBufferSize?: number;
    /** Simulated ms for `environment/open` to become idle. Default 500. */
    environmentOpenMs?: number;
    /** Simulated ms for `environment/close`. Default 250. */
    environmentCloseMs?: number;
    /** Tick interval of the live loop, in ms. Default 100. */
    tickMs?: number;
    /** Reported as `status.msg`. */
    version?: string;
    /** Stamped onto accepted queue items. */
    user?: string;
    userGroup?: string;
    /** Reject items whose plan name is not in the allowed list. Default true. */
    validatePlanNames?: boolean;
}

/** Behaviour with every default resolved. */
export type ResolvedBehavior = Required<
    Omit<QServerSimBehaviorOptions, 'runDurationByPlan' | 'failMessage'>
> & {
    runDurationByPlan: Record<string, number>;
    failMessage: string;
};

/** Awaited by the client seams when `latencyMs > 0`. Injectable so tests keep control. */
export type SimDelay = (ms: number) => Promise<void>;

/** Seeds the running slot at construction, used by the `running`/`paused` scenarios. */
export interface SimRunningSeed {
    /** Index into the initial queue to start. Default 0. */
    itemIndex?: number;
    /** Simulated ms already elapsed. Default 0. */
    elapsedMs?: number;
    /** Leave the run paused. Default false. */
    paused?: boolean;
}

export interface CreateQServerSimOptions extends QServerSimBehaviorOptions {
    /** Allowed/existing plans, keyed by name. Defaults to `defaultPlans`. Replaces, not merges. */
    plans?: Record<string, Plan>;
    /** Allowed/existing devices, keyed by name. Defaults to `defaultDevices`. */
    devices?: Record<string, Device>;
    queue?: QueueItem[];
    history?: HistoryItem[];
    /** Initial environment state. Default `'idle'` (i.e. open and ready). */
    environmentState?: SimEnvironmentState;
    /** Start a plan at construction time. */
    running?: SimRunningSeed;
    queueMode?: Partial<PlanQueueMode>;
    queueAutostartEnabled?: boolean;
    /** Deterministic randomness. Defaults to `Math.random`. */
    random?: () => number;
    /** Clock, in ms. Defaults to `Date.now`. */
    now?: () => number;
    /** Identifier factory. Defaults to a deterministic per-prefix counter. */
    newUid?: (prefix: string) => string;
    /** Latency implementation. Defaults to a real `setTimeout`. */
    delay?: SimDelay;
}

/** A scenario is a function so that every story and test gets a fresh, unshared sim. */
export type QServerSimScenario = (overrides?: Partial<CreateQServerSimOptions>) => QServerSim;

export interface TickContext {
    /** Clock value at the start of the tick, in ms. */
    time: number;
    /** Elapsed time since the previous tick, in **seconds**. */
    dt: number;
}

export type TickHandler = (context: TickContext) => void;
