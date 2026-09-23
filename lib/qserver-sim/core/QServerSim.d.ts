import { GetConsoleOutputUpdateResponse } from '../../../api/qServer/types/console';
import { ClearHistoryResponse } from '../../../api/qServer/types/history';
import { GetLockInfoResponse, LockBody, LockResponse } from '../../../api/qServer/types/lock';
import { Device, Plan } from '../../../api/qServer/types/plansDevices';
import { AddQueueItemBatchBody, AddQueueItemBody, ExecuteQueueItemBody, GetQueueItemResponse, MoveQueueItemBody, PostItemAddResponse, PostItemBatchResponse, QueueClearResponse, QueueItemAddress, QueueStartResponse, RemoveQueueItemBatchBody, UpdateQueueItemBody } from '../../../api/qServer/types/queue';
import { GetRunsResponse, RunListOption, ReControlResponse } from '../../../api/qServer/types/runEngine';
import { GetStatusResponse, PlanQueueMode } from '../../../api/qServer/types/status';
import { QServerSuccessResponse } from '../../../api/qServer/types/common';
import { EnvironmentResponse } from '../../../api/qServer/types/environment';
import { CreateQServerSimOptions, QServerSimBehaviorOptions, QServerSimState, ResolvedBehavior, SimConsoleMessage, Unsubscribe } from './types';
/**
 * A simulated Bluesky queue server.
 *
 * Models domain behaviour rather than canned endpoint responses: items move from the queue to
 * the Run Engine, progress over simulated time, and land in history with a real `Result`.
 * Everything the HTTP layer does goes through these same methods, so a story driving the sim
 * directly and a component talking to it over the client see one consistent state machine.
 *
 * Nothing ticks until `start()` is called; tests instead step time with `advance(ms)`.
 */
export declare class QServerSimulator {
    private state;
    private behavior;
    private readonly scheduler;
    private readonly stateEmitter;
    private readonly statusEmitter;
    private readonly consoleEmitter;
    private readonly randomSource;
    private readonly clock;
    private readonly uidFactory;
    private readonly delayImpl;
    /** Serialized last-emitted status, so progress ticks don't fan out no-op notifications. */
    private lastStatusJson;
    /** Suppresses console output while seeding at construction. */
    private silent;
    constructor(options?: CreateQServerSimOptions);
    private buildInitialState;
    /** Start the live tick loop. Idempotent. */
    start(): void;
    /** Stop the live tick loop. Idempotent. `advance()` still works. */
    stop(): void;
    isRunning(): boolean;
    /**
     * Advance simulated time by one tick.
     *
     * A single tick, not a subdivision: `advance(runDurationMs)` finishes exactly one run and
     * surplus time is not carried into the next one.
     */
    advance(deltaMs: number): void;
    /** Rebuild state from scratch, keeping the same emitters so subscribers stay attached. */
    reset(options?: Partial<CreateQServerSimOptions>): void;
    setBehavior(behavior: Partial<QServerSimBehaviorOptions>): void;
    getState(): QServerSimState;
    getBehavior(): ResolvedBehavior;
    getStatus(): GetStatusResponse;
    subscribeState(listener: (state: QServerSimState) => void): Unsubscribe;
    /** Only fires when the derived status actually changes — progress ticks are silent. */
    subscribeStatus(listener: (status: GetStatusResponse) => void): Unsubscribe;
    /** A stream, so nothing is replayed; read `getState().console` for the backlog. */
    subscribeConsole(listener: (message: SimConsoleMessage) => void): Unsubscribe;
    listenerCounts(): {
        state: number;
        status: number;
        console: number;
    };
    /** Run an HTTP-shaped request through the same dispatcher both client seams use. */
    request(method: 'GET' | 'POST' | 'DELETE', path: string, body?: Record<string, unknown>, query?: Record<string, string>): {
        status: number;
        data: unknown;
    };
    delay(ms: number): Promise<void>;
    newUid(prefix: string): string;
    now(): number;
    random(): number;
    /** Replace the plan catalog and bump the plan uids. */
    setPlans(plans: Record<string, Plan>): void;
    /** Replace the device catalog and bump the device uids. */
    setDevices(devices: Record<string, Device>): void;
    openEnvironment(): EnvironmentResponse;
    closeEnvironment(): EnvironmentResponse;
    /** Unlike `close`, allowed mid-plan: the running plan is discarded as a failure. */
    destroyEnvironment(): EnvironmentResponse;
    private finishEnvironmentOpen;
    private finishEnvironmentClose;
    startQueue(): QueueStartResponse;
    stopQueue(): QServerSuccessResponse;
    cancelQueueStop(): QServerSuccessResponse;
    clearQueue(): QueueClearResponse;
    setQueueMode(mode: Partial<PlanQueueMode>): QServerSuccessResponse;
    setQueueAutostart(enable: boolean): QServerSuccessResponse;
    clearHistory(): ClearHistoryResponse;
    addItem(body: AddQueueItemBody): PostItemAddResponse;
    addItemBatch(body: AddQueueItemBatchBody): PostItemBatchResponse;
    updateItem(body: UpdateQueueItemBody): PostItemAddResponse;
    removeItem(body?: QueueItemAddress): PostItemAddResponse;
    removeItemBatch(body: RemoveQueueItemBatchBody): PostItemBatchResponse;
    moveItem(body: MoveQueueItemBody): PostItemAddResponse;
    getItem(body?: QueueItemAddress): GetQueueItemResponse;
    /** Run an item immediately without ever placing it on the queue. */
    executeItem(body: ExecuteQueueItemBody): PostItemAddResponse;
    /**
     * Pause the Run Engine.
     *
     * Both `'deferred'` and `'immediate'` pause at once — pausing at the next checkpoint is not
     * observable to any UI in this repo, so `pause_pending` is never left true.
     */
    pause(option?: 'deferred' | 'immediate'): ReControlResponse;
    resume(): ReControlResponse;
    /**
     * A clean finish: the plan is marked successful, lands in history, and is not requeued.
     *
     * Like abort and halt, this stops the queue — all three are user-initiated interventions, so
     * the manager returns to idle rather than rolling on to the next item.
     */
    stopRun(): ReControlResponse;
    /** Aborted plans are marked failed and returned to the front of the queue. */
    abortRun(): ReControlResponse;
    /** Like abort, but skips the plan's cleanup handlers; only the exit status differs. */
    haltRun(): ReControlResponse;
    getRuns(option?: RunListOption): GetRunsResponse;
    /**
     * Force a failure without waiting for a run to progress.
     *
     * Exists so the legacy console watcher's `'The plan failed'` branch can be exercised from a
     * story or test without contriving a full run.
     */
    panic(msg?: string): void;
    private requirePaused;
    /**
     * Recent console text, newest last.
     *
     * Messages already carry their own trailing newline, so they are concatenated rather than
     * joined. `nlines` counts rendered *lines*, not messages — a single message can span several
     * (the item dictionary logged when a plan starts is one), and that is what the real endpoint
     * counts too.
     */
    getConsoleText(nlines?: number): string;
    /** Messages appended after `lastMsgUid`, for `console_output_update`. */
    getConsoleSince(lastMsgUid?: string): GetConsoleOutputUpdateResponse;
    /**
     * Append one console line.
     *
     * A bare string is emitted under the manager logger, matching the majority of real output;
     * pass a `SimConsoleLine` to change the logger, the level, or to skip the bracket prefix the
     * way bluesky's own output does.
     */
    private console;
    /** Append a whole sequence of lines, in order. */
    private consoleLines;
    lock(body: LockBody): LockResponse;
    unlock(lockKey?: string): LockResponse;
    getLockInfo(): GetLockInfoResponse;
    private lockResponse;
    /** Move the front queue item onto the Run Engine. */
    private dequeueNext;
    private beginRun;
    /**
     * The single exit path for every way a run can end: completion, stop, abort, halt, a
     * destroyed environment, or `panic()`.
     */
    private finishRun;
    /** What happens after a run ends. */
    private decideNext;
    private goIdle;
    private tick;
    private validateItem;
    private stampItem;
    /** Resolve a `{uid}` or `{pos}` address to a queue index, or `null` if unresolvable. */
    private resolveIndex;
    private bump;
    /**
     * Publish a state change.
     *
     * State subscribers always fire; status subscribers only when the derived status actually
     * differs, so a run progressing does not push a status frame every tick.
     */
    private notify;
}
/** The public type of a simulator instance. */
export type QServerSim = QServerSimulator;
/**
 * Build a simulator.
 *
 * ```ts
 * const sim = createQServerSim({
 *     plans: { count: plan({ name: 'count' }) },
 *     queue: [queueItem({ name: 'count' })],
 *     behavior: { runDurationMs: 1500 },
 * });
 * ```
 *
 * Prefer a scenario (`defaultQServer()`) unless you need a bespoke setup.
 */
export declare function createQServerSim(options?: CreateQServerSimOptions): QServerSim;
//# sourceMappingURL=QServerSim.d.ts.map