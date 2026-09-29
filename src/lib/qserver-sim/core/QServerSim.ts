import type { GetConsoleOutputUpdateResponse } from '@/api/qServer/types/console';
import type { ClearHistoryResponse, HistoryItem, Result } from '@/api/qServer/types/history';
import type { GetLockInfoResponse, LockBody, LockResponse } from '@/api/qServer/types/lock';
import type { Device, Plan } from '@/api/qServer/types/plansDevices';
import type {
    AddQueueItemBatchBody,
    AddQueueItemBody,
    BaseQueueItem,
    ExecuteQueueItemBody,
    GetQueueItemResponse,
    MoveQueueItemBody,
    PostItemAddResponse,
    PostItemBatchResponse,
    QueueClearResponse,
    QueueItem,
    QueueItemAddress,
    QueueStartResponse,
    RemoveQueueItemBatchBody,
    UpdateQueueItemBody,
} from '@/api/qServer/types/queue';
import type { GetRunsResponse, RunListOption } from '@/api/qServer/types/runEngine';
import type { GetStatusResponse, PlanQueueMode } from '@/api/qServer/types/status';
import type { QServerSuccessResponse } from '@/api/qServer/types/common';
import type { EnvironmentResponse } from '@/api/qServer/types/environment';
import type { ReControlResponse } from '@/api/qServer/types/runEngine';
import { handleRequest } from '../client/handleRequest';
import { defaultDevices } from '../fixtures/defaultDevices';
import { defaultPlans } from '../fixtures/defaultPlans';
import {
    environmentOpenBeginSequence,
    environmentOpenFinishSequence,
    formatClockTime,
    formatConsolePrefix,
    planEndSequence,
    planStartSequence,
    SIM_CONSOLE,
    SIM_LOGGERS,
    type SimConsoleLine,
} from './consoleMessages';
import { SimEmitter } from './events';
import { SimScheduler } from './scheduler';
import { deriveStatus } from './status';
import type {
    CreateQServerSimOptions,
    QServerSimBehaviorOptions,
    QServerSimState,
    ResolvedBehavior,
    SimConsoleMessage,
    SimDelay,
    SimExitStatus,
    SimRunOrigin,
    SimRunningSlot,
    TickContext,
    Unsubscribe,
} from './types';
import { createCounterUidFactory } from './uid';

const DEFAULT_BEHAVIOR: ResolvedBehavior = {
    runDurationMs: 3000,
    runDurationByPlan: {},
    autoCompleteRuns: true,
    failNextRun: false,
    failMessage: 'Simulated plan failure.',
    latencyMs: 0,
    consoleOutput: true,
    consolePrefix: true,
    consoleBufferSize: 1000,
    environmentOpenMs: 500,
    environmentCloseMs: 250,
    tickMs: 100,
    version: 'RE Manager v0.0.21',
    user: 'UNAUTHENTICATED_SINGLE_USER',
    userGroup: 'primary',
    validatePlanNames: true,
};

const VALID_ITEM_TYPES = ['plan', 'instruction', 'function'];

/** Failure envelope shared by the "you can't do that right now" paths. */
function refuse(msg: string): { success: false; msg: string } {
    return { success: false, msg };
}

function ok(msg = ''): { success: true; msg: string } {
    return { success: true, msg };
}

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
export class QServerSimulator {
    private state: QServerSimState;
    private behavior: ResolvedBehavior;
    private readonly scheduler: SimScheduler;
    private readonly stateEmitter = new SimEmitter<QServerSimState>('state');
    private readonly statusEmitter = new SimEmitter<GetStatusResponse>('status');
    private readonly consoleEmitter = new SimEmitter<SimConsoleMessage>('console');

    private readonly randomSource: () => number;
    private readonly clock: () => number;
    private readonly uidFactory: (prefix: string) => string;
    private readonly delayImpl: SimDelay;

    /** Serialized last-emitted status, so progress ticks don't fan out no-op notifications. */
    private lastStatusJson = '';
    /** Suppresses console output while seeding at construction. */
    private silent = false;

    constructor(options: CreateQServerSimOptions = {}) {
        this.behavior = resolveBehavior(options);
        this.randomSource = options.random ?? Math.random;
        this.clock = options.now ?? Date.now;
        this.uidFactory = options.newUid ?? createCounterUidFactory();
        this.delayImpl =
            options.delay ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
        this.scheduler = new SimScheduler(this.behavior.tickMs, this.clock);
        this.scheduler.onTick((context) => this.tick(context));

        this.state = this.buildInitialState(options);
        this.lastStatusJson = JSON.stringify(deriveStatus(this.state));
    }

    // #region construction & lifecycle

    private buildInitialState(options: CreateQServerSimOptions): QServerSimState {
        // Fixtures are deep-cloned: two sims built from the same default queue must not share
        // (and mutate) one array. This is the whole reason scenarios are functions.
        const queue = clone(options.queue ?? []);
        const history = clone(options.history ?? []);

        const state: QServerSimState = {
            version: this.behavior.version,
            // Default to Finch's catalog so `createQServerSim()` is useful bare — with
            // `validatePlanNames` on, empty catalogs would reject every add.
            plansAllowed: clone(options.plans ?? defaultPlans),
            devicesAllowed: clone(options.devices ?? defaultDevices),
            queue,
            history,
            running: null,
            managerState: 'idle',
            reState: options.environmentState === 'closed' ? null : 'idle',
            environmentState: options.environmentState ?? 'idle',
            queueStopPending: false,
            pausePending: false,
            queueAutostartEnabled: options.queueAutostartEnabled ?? false,
            queueMode: { loop: false, ignore_failures: false, ...options.queueMode },
            runList: [],
            console: [],
            tasks: {},
            lock: { environment: false, queue: false },
            lockKey: null,
            // Continue scan ids past anything the seeded history already used.
            scanIdCounter: highestScanId(history),
            timers: { environmentOpenMs: 0, environmentCloseMs: 0 },
            uids: {
                plan_queue_uid: this.uidFactory('queue-uid'),
                plan_history_uid: this.uidFactory('history-uid'),
                run_list_uid: this.uidFactory('runlist-uid'),
                task_results_uid: this.uidFactory('taskresults-uid'),
                lock_info_uid: this.uidFactory('lock-uid'),
                devices_allowed_uid: this.uidFactory('devices-uid'),
                plans_allowed_uid: this.uidFactory('plans-uid'),
                devices_existing_uid: this.uidFactory('devices-uid'),
                plans_existing_uid: this.uidFactory('plans-uid'),
                console_output_uid: this.uidFactory('console-uid'),
            },
            versionCounter: 0,
        };
        this.state = state;

        if (options.running) {
            // Seed by running the real transition, so seeded state is provably reachable
            // instead of a hand-built slot that can drift from what the machine produces.
            this.silent = true;
            const index = options.running.itemIndex ?? 0;
            if (index > 0)
                state.queue = [...state.queue.slice(index), ...state.queue.slice(0, index)];
            if (state.queue.length > 0) {
                state.managerState = 'starting_queue';
                this.dequeueNext();
                if (state.running) {
                    state.running.elapsedMs = options.running.elapsedMs ?? 0;
                    if (options.running.paused) {
                        state.running.paused = true;
                        state.reState = 'paused';
                        state.managerState = 'paused';
                        state.environmentState = 'executing_plan';
                    }
                }
            }
            this.silent = false;
        }

        return state;
    }

    /** Start the live tick loop. Idempotent. */
    start(): void {
        this.scheduler.setTickMs(this.behavior.tickMs);
        this.scheduler.start();
    }

    /** Stop the live tick loop. Idempotent. `advance()` still works. */
    stop(): void {
        this.scheduler.stop();
    }

    isRunning(): boolean {
        return this.scheduler.isRunning();
    }

    /**
     * Advance simulated time by one tick.
     *
     * A single tick, not a subdivision: `advance(runDurationMs)` finishes exactly one run and
     * surplus time is not carried into the next one.
     */
    advance(deltaMs: number): void {
        this.scheduler.advance(deltaMs);
    }

    /** Rebuild state from scratch, keeping the same emitters so subscribers stay attached. */
    reset(options: Partial<CreateQServerSimOptions> = {}): void {
        this.behavior = resolveBehavior({ ...options });
        this.state = this.buildInitialState(options);
        this.notify();
    }

    setBehavior(behavior: Partial<QServerSimBehaviorOptions>): void {
        this.behavior = { ...this.behavior, ...stripUndefined(behavior) } as ResolvedBehavior;
        this.state.version = this.behavior.version;
        this.scheduler.setTickMs(this.behavior.tickMs);
        this.notify();
    }

    // #endregion

    // #region reads & subscriptions

    getState(): QServerSimState {
        return this.state;
    }

    getBehavior(): ResolvedBehavior {
        return this.behavior;
    }

    getStatus(): GetStatusResponse {
        return deriveStatus(this.state);
    }

    subscribeState(listener: (state: QServerSimState) => void): Unsubscribe {
        return this.stateEmitter.subscribe(listener, () => this.state);
    }

    /** Only fires when the derived status actually changes — progress ticks are silent. */
    subscribeStatus(listener: (status: GetStatusResponse) => void): Unsubscribe {
        return this.statusEmitter.subscribe(listener, () => this.getStatus());
    }

    /** A stream, so nothing is replayed; read `getState().console` for the backlog. */
    subscribeConsole(listener: (message: SimConsoleMessage) => void): Unsubscribe {
        return this.consoleEmitter.subscribe(listener);
    }

    listenerCounts(): { state: number; status: number; console: number } {
        return {
            state: this.stateEmitter.size(),
            status: this.statusEmitter.size(),
            console: this.consoleEmitter.size(),
        };
    }

    // #endregion

    // #region escape hatches

    /** Run an HTTP-shaped request through the same dispatcher both client seams use. */
    request(
        method: 'GET' | 'POST' | 'DELETE',
        path: string,
        body: Record<string, unknown> = {},
        query: Record<string, string> = {},
    ): { status: number; data: unknown } {
        return handleRequest(this, { method, path, body, query });
    }

    delay(ms: number): Promise<void> {
        return this.delayImpl(ms);
    }

    newUid(prefix: string): string {
        return this.uidFactory(prefix);
    }

    now(): number {
        return this.clock();
    }

    random(): number {
        return this.randomSource();
    }

    /** Replace the plan catalog and bump the plan uids. */
    setPlans(plans: Record<string, Plan>): void {
        this.state.plansAllowed = clone(plans);
        this.bump('plans_allowed_uid');
        this.bump('plans_existing_uid');
        this.notify();
    }

    /** Replace the device catalog and bump the device uids. */
    setDevices(devices: Record<string, Device>): void {
        this.state.devicesAllowed = clone(devices);
        this.bump('devices_allowed_uid');
        this.bump('devices_existing_uid');
        this.notify();
    }

    // #endregion

    // #region environment

    openEnvironment(): EnvironmentResponse {
        if (this.state.environmentState !== 'closed') {
            return refuse('RE Worker environment already exists.');
        }
        this.state.environmentState = 'initializing';
        this.state.managerState = 'creating_environment';
        this.state.reState = null;
        this.consoleLines(environmentOpenBeginSequence());

        if (this.behavior.environmentOpenMs <= 0) {
            this.finishEnvironmentOpen();
        } else {
            this.state.timers.environmentOpenMs = this.behavior.environmentOpenMs;
        }
        this.notify();
        return ok();
    }

    closeEnvironment(): EnvironmentResponse {
        if (this.state.environmentState === 'closed') {
            return refuse('RE Worker environment does not exist.');
        }
        if (this.state.running) {
            return refuse(
                'Queue is running. Stop the queue or abort the plan before closing the environment.',
            );
        }
        this.state.environmentState = 'closing';
        this.state.managerState = 'closing_environment';
        this.console(SIM_CONSOLE.closingEnvironment);

        if (this.behavior.environmentCloseMs <= 0) {
            this.finishEnvironmentClose();
        } else {
            this.state.timers.environmentCloseMs = this.behavior.environmentCloseMs;
        }
        this.notify();
        return ok();
    }

    /** Unlike `close`, allowed mid-plan: the running plan is discarded as a failure. */
    destroyEnvironment(): EnvironmentResponse {
        if (this.state.environmentState === 'closed') {
            return refuse('RE Worker environment does not exist.');
        }
        this.console(SIM_CONSOLE.destroyingEnvironment);
        if (this.state.running) {
            // The real server does not put the interrupted item back on the queue.
            this.finishRun('failed', 'RE Worker environment was destroyed.', '', false, {
                continueQueue: false,
            });
        }
        this.state.environmentState = 'closed';
        this.state.managerState = 'idle';
        this.state.reState = null;
        this.state.timers.environmentOpenMs = 0;
        this.state.timers.environmentCloseMs = 0;
        this.console(SIM_CONSOLE.environmentDestroyed);
        this.notify();
        return ok();
    }

    private finishEnvironmentOpen(): void {
        this.state.timers.environmentOpenMs = 0;
        this.state.environmentState = 'idle';
        this.state.managerState = 'idle';
        this.state.reState = 'idle';
        this.consoleLines(environmentOpenFinishSequence());
    }

    private finishEnvironmentClose(): void {
        this.state.timers.environmentCloseMs = 0;
        this.state.environmentState = 'closed';
        this.state.managerState = 'idle';
        this.state.reState = null;
        this.console(SIM_CONSOLE.environmentClosed);
    }

    // #endregion

    // #region queue control

    startQueue(): QueueStartResponse {
        if (this.state.environmentState === 'closed') {
            return {
                ...refuse(
                    'RE Worker environment does not exist. Open the environment before starting the queue.',
                ),
            };
        }
        if (this.state.managerState !== 'idle') {
            return refuse(
                `Failed to start the queue: RE Manager state is '${this.state.managerState}'`,
            );
        }
        if (this.state.queue.length === 0) {
            // Console line matters: the legacy UI keys off the 'Queue is empty' prefix.
            this.console(SIM_CONSOLE.queueEmptyNothingToProcess);
            this.notify();
            return refuse(SIM_CONSOLE.queueEmpty);
        }

        this.state.managerState = 'starting_queue';
        this.console(SIM_CONSOLE.startingQueue);
        this.dequeueNext();
        this.notify();
        return { ...ok(), qsize: this.state.queue.length };
    }

    stopQueue(): QServerSuccessResponse {
        if (this.state.managerState !== 'executing_queue' && this.state.managerState !== 'paused') {
            return refuse('Queue is not running.');
        }
        this.state.queueStopPending = true;
        this.console(SIM_CONSOLE.queueStopRequested);
        this.notify();
        return ok();
    }

    cancelQueueStop(): QServerSuccessResponse {
        if (!this.state.queueStopPending) return refuse('Queue is not scheduled to stop.');
        this.state.queueStopPending = false;
        this.notify();
        return ok();
    }

    clearQueue(): QueueClearResponse {
        this.state.queue = [];
        this.bump('plan_queue_uid');
        this.console(SIM_CONSOLE.clearingQueue);
        this.notify();
        return { ...ok(), qsize: 0 };
    }

    setQueueMode(mode: Partial<PlanQueueMode>): QServerSuccessResponse {
        this.state.queueMode = { ...this.state.queueMode, ...mode };
        this.notify();
        return ok();
    }

    setQueueAutostart(enable: boolean): QServerSuccessResponse {
        this.state.queueAutostartEnabled = enable;
        this.notify();
        return ok();
    }

    clearHistory(): ClearHistoryResponse {
        this.state.history = [];
        this.bump('plan_history_uid');
        this.console(SIM_CONSOLE.clearingHistory);
        this.notify();
        return { ...ok(), plan_history_uid: this.state.uids.plan_history_uid };
    }

    // #endregion

    // #region queue items

    addItem(body: AddQueueItemBody): PostItemAddResponse {
        const validation = this.validateItem(body.item);
        if (!validation.ok) {
            // Mirrors the real failure shape: no uid stamped, qsize null, nothing bumped.
            return { success: false, msg: validation.msg, item: body.item, qsize: null };
        }
        const item = this.stampItem(validation.item, body);
        insertItem(this.state.queue, item, body);
        this.bump('plan_queue_uid');
        this.console(SIM_CONSOLE.itemAdded(item, this.state.queue.length));

        if (
            this.state.queueAutostartEnabled &&
            this.state.managerState === 'idle' &&
            this.state.environmentState !== 'closed'
        ) {
            this.dequeueNext();
        }
        this.notify();
        return { ...ok(), item, qsize: this.state.queue.length };
    }

    addItemBatch(body: AddQueueItemBatchBody): PostItemBatchResponse {
        const items: QueueItem[] = [];
        const results: { success: boolean; msg: string }[] = [];
        let anyAccepted = false;

        for (const raw of body.items ?? []) {
            const validation = this.validateItem(raw);
            if (!validation.ok) {
                results.push({ success: false, msg: validation.msg });
                items.push(raw as QueueItem);
                continue;
            }
            const item = this.stampItem(validation.item, body);
            insertItem(this.state.queue, item, body);
            items.push(item);
            results.push({ success: true, msg: '' });
            this.console(SIM_CONSOLE.itemAdded(item, this.state.queue.length));
            anyAccepted = true;
        }

        if (anyAccepted) this.bump('plan_queue_uid');
        this.notify();
        const success = results.every((result) => result.success);
        return {
            success,
            msg: success ? '' : 'Failed to add all items to the queue.',
            items,
            results,
            qsize: this.state.queue.length,
        };
    }

    updateItem(body: UpdateQueueItemBody): PostItemAddResponse {
        const uid = body.item?.item_uid;
        const index = this.state.queue.findIndex((item) => item.item_uid === uid);
        if (index === -1) {
            return {
                success: false,
                msg: `Failed to update an item: Item with UID '${uid}' is not in the queue.`,
                item: body.item ?? ({} as QueueItem),
                qsize: null,
            };
        }
        const validation = this.validateItem(body.item);
        if (!validation.ok) {
            return { success: false, msg: validation.msg, item: body.item, qsize: null };
        }
        const replaced: QueueItem = {
            ...(validation.item as QueueItem),
            user: body.user ?? this.behavior.user,
            user_group: body.user_group ?? this.behavior.userGroup,
            // `replace` mints a new uid; an update keeps the existing one.
            item_uid: body.replace ? this.uidFactory('item') : uid,
        };
        this.state.queue[index] = replaced;
        this.bump('plan_queue_uid');
        this.notify();
        return { ...ok(), item: replaced, qsize: this.state.queue.length };
    }

    removeItem(body: QueueItemAddress = {}): PostItemAddResponse {
        const index = this.resolveIndex(body);
        if (index === null) {
            return {
                success: false,
                msg: `Failed to remove an item: ${describeAddress(body)} is not in the queue.`,
                item: {} as QueueItem,
                qsize: null,
            };
        }
        const [removed] = this.state.queue.splice(index, 1);
        this.bump('plan_queue_uid');
        this.console(SIM_CONSOLE.removingItem);
        this.notify();
        return { ...ok(), item: removed, qsize: this.state.queue.length };
    }

    removeItemBatch(body: RemoveQueueItemBatchBody): PostItemBatchResponse {
        const items: QueueItem[] = [];
        const results: { success: boolean; msg: string }[] = [];
        let removedAny = false;

        for (const uid of body.uids ?? []) {
            const index = this.state.queue.findIndex((item) => item.item_uid === uid);
            if (index === -1) {
                results.push({
                    success: false,
                    msg: `Item with UID '${uid}' is not in the queue.`,
                });
                continue;
            }
            const [removed] = this.state.queue.splice(index, 1);
            items.push(removed);
            results.push({ success: true, msg: '' });
            this.console(SIM_CONSOLE.removingItem);
            removedAny = true;
        }

        if (removedAny) this.bump('plan_queue_uid');
        this.notify();
        const success = body.ignore_missing ? true : results.every((result) => result.success);
        return {
            success,
            msg: success ? '' : 'Failed to remove all items from the queue.',
            items,
            results,
            qsize: this.state.queue.length,
        };
    }

    moveItem(body: MoveQueueItemBody): PostItemAddResponse {
        const from = this.resolveIndex(body);
        if (from === null) {
            return {
                success: false,
                msg: `Failed to move an item: ${describeAddress(body)} is not in the queue.`,
                item: {} as QueueItem,
                qsize: null,
            };
        }
        const [item] = this.state.queue.splice(from, 1);
        insertItem(this.state.queue, item, {
            pos: body.pos_dest,
            before_uid: body.before_uid,
            after_uid: body.after_uid,
        });
        this.bump('plan_queue_uid');
        this.notify();
        return { ...ok(), item, qsize: this.state.queue.length };
    }

    getItem(body: QueueItemAddress = {}): GetQueueItemResponse {
        const index = this.resolveIndex(body, { defaultToBack: true });
        if (index === null) {
            return {
                success: false,
                msg: `Failed to get an item: ${describeAddress(body)} is not in the queue.`,
                item: {},
            };
        }
        return { ...ok(), item: this.state.queue[index] };
    }

    /** Run an item immediately without ever placing it on the queue. */
    executeItem(body: ExecuteQueueItemBody): PostItemAddResponse {
        if (this.state.environmentState === 'closed') {
            return {
                success: false,
                msg: 'RE Worker environment does not exist. Open the environment before executing an item.',
                item: (body.item ?? {}) as QueueItem,
                qsize: null,
            };
        }
        if (this.state.managerState !== 'idle') {
            return {
                success: false,
                msg: `Failed to execute the item: RE Manager state is '${this.state.managerState}'`,
                item: (body.item ?? {}) as QueueItem,
                qsize: null,
            };
        }
        const validation = this.validateItem(body.item);
        if (!validation.ok) {
            return { success: false, msg: validation.msg, item: body.item, qsize: null };
        }

        const item = this.stampItem(validation.item, body);
        this.beginRun(item, 'execute');
        this.notify();
        return { ...ok(), item, qsize: this.state.queue.length };
    }

    // #endregion

    // #region run engine

    /**
     * Pause the Run Engine.
     *
     * Both `'deferred'` and `'immediate'` pause at once — pausing at the next checkpoint is not
     * observable to any UI in this repo, so `pause_pending` is never left true.
     */
    pause(option: 'deferred' | 'immediate' = 'deferred'): ReControlResponse {
        if (!this.state.running) return refuse('Run Engine is not running. Nothing to pause.');
        if (this.state.running.paused) return refuse('Run Engine is already paused.');

        this.console(SIM_CONSOLE.pausing(option));
        this.state.running.paused = true;
        this.state.reState = 'paused';
        this.state.managerState = 'paused';
        this.state.environmentState = 'executing_plan';
        this.state.pausePending = false;
        this.console(SIM_CONSOLE.paused);
        this.notify();
        return ok();
    }

    resume(): ReControlResponse {
        if (!this.state.running?.paused) {
            return refuse(`Failed to resume: RE Manager state is '${this.state.managerState}'`);
        }
        this.state.running.paused = false;
        this.state.reState = 'running';
        this.state.managerState = 'executing_queue';
        this.state.environmentState = 'executing_plan';
        this.console(SIM_CONSOLE.resuming);
        this.notify();
        return ok();
    }

    /**
     * A clean finish: the plan is marked successful, lands in history, and is not requeued.
     *
     * Like abort and halt, this stops the queue — all three are user-initiated interventions, so
     * the manager returns to idle rather than rolling on to the next item.
     */
    stopRun(): ReControlResponse {
        const guard = this.requirePaused();
        if (guard) return guard;
        this.state.reState = 'stopping';
        this.finishRun('stopped', '', '', false, { continueQueue: false });
        this.notify();
        return ok();
    }

    /** Aborted plans are marked failed and returned to the front of the queue. */
    abortRun(): ReControlResponse {
        const guard = this.requirePaused();
        if (guard) return guard;
        this.state.reState = 'aborting';
        this.finishRun('abort', 'Plan was aborted by the user.', simTraceback('abort'), true, {
            continueQueue: false,
        });
        this.notify();
        return ok();
    }

    /** Like abort, but skips the plan's cleanup handlers; only the exit status differs. */
    haltRun(): ReControlResponse {
        const guard = this.requirePaused();
        if (guard) return guard;
        this.state.reState = 'halting';
        this.finishRun('halted', 'Plan was halted by the user.', simTraceback('halt'), true, {
            continueQueue: false,
        });
        this.notify();
        return ok();
    }

    getRuns(option: RunListOption = 'active'): GetRunsResponse {
        const runList = this.state.runList.filter((run) => {
            if (option === 'open') return run.is_open;
            if (option === 'closed') return !run.is_open;
            return true;
        });
        return {
            ...ok(),
            run_list: runList,
            run_list_uid: this.state.uids.run_list_uid,
        };
    }

    /**
     * Force a failure without waiting for a run to progress.
     *
     * Exists so the legacy console watcher's `'The plan failed'` branch can be exercised from a
     * story or test without contriving a full run.
     */
    panic(msg = 'Simulated Run Engine failure.'): void {
        if (this.state.running) {
            this.finishRun('failed', msg, simTraceback('panic'), false, { continueQueue: false });
        } else {
            this.console({ text: SIM_CONSOLE.planFailed(msg), logger: SIM_LOGGERS.worker });
        }
        this.state.reState = this.state.environmentState === 'closed' ? null : 'panicked';
        this.state.managerState = 'idle';
        this.notify();
    }

    private requirePaused(): ReControlResponse | null {
        if (!this.state.running) return refuse('Run Engine is not running.');
        if (!this.state.running.paused) {
            return refuse(`Run Engine must be paused. Current state: '${this.state.reState}'`);
        }
        return null;
    }

    // #endregion

    // #region console

    /**
     * Recent console text, newest last.
     *
     * Messages already carry their own trailing newline, so they are concatenated rather than
     * joined. `nlines` counts rendered *lines*, not messages — a single message can span several
     * (the item dictionary logged when a plan starts is one), and that is what the real endpoint
     * counts too.
     */
    getConsoleText(nlines?: number): string {
        const text = this.state.console.map((message) => message.msg).join('');
        if (!nlines || nlines <= 0) return text;

        const lines = text.split('\n');
        // The final newline leaves an empty trailing element; drop it before slicing.
        if (lines.at(-1) === '') lines.pop();
        return lines.slice(-nlines).join('\n');
    }

    /** Messages appended after `lastMsgUid`, for `console_output_update`. */
    getConsoleSince(lastMsgUid?: string): GetConsoleOutputUpdateResponse {
        const buffer = this.state.console;
        const index = lastMsgUid ? buffer.findIndex((message) => message.uid === lastMsgUid) : -1;
        const messages = index === -1 ? buffer : buffer.slice(index + 1);
        return {
            ...ok(),
            last_msg_uid: this.state.uids.console_output_uid,
            console_output_msgs: messages.map(({ time, msg }) => ({ time, msg })),
        };
    }

    /**
     * Append one console line.
     *
     * A bare string is emitted under the manager logger, matching the majority of real output;
     * pass a `SimConsoleLine` to change the logger, the level, or to skip the bracket prefix the
     * way bluesky's own output does.
     */
    private console(line: string | SimConsoleLine): void {
        if (this.silent || !this.behavior.consoleOutput) return;

        const entry: SimConsoleLine = typeof line === 'string' ? { text: line } : line;
        const timeMs = this.clock();
        const prefix =
            this.behavior.consolePrefix && !entry.bare ? formatConsolePrefix(timeMs, entry) : '';

        const message: SimConsoleMessage = {
            time: timeMs / 1000,
            msg: `${prefix}${entry.text}\n`,
            uid: this.uidFactory('console-msg'),
        };
        this.state.console.push(message);
        if (this.state.console.length > this.behavior.consoleBufferSize) {
            this.state.console.splice(
                0,
                this.state.console.length - this.behavior.consoleBufferSize,
            );
        }
        this.state.uids.console_output_uid = message.uid;
        this.consoleEmitter.emit(message);
    }

    /** Append a whole sequence of lines, in order. */
    private consoleLines(lines: SimConsoleLine[]): void {
        for (const line of lines) this.console(line);
    }

    // #endregion

    // #region locks

    lock(body: LockBody): LockResponse {
        if (!body?.lock_key) {
            return {
                success: false,
                msg: 'Failed to lock: the lock key is not specified.',
                lock_info: this.state.lock,
                lock_info_uid: this.state.uids.lock_info_uid,
            };
        }
        this.state.lockKey = body.lock_key;
        this.state.lock = {
            environment: body.environment ?? false,
            queue: body.queue ?? false,
            user: body.user ?? this.behavior.user,
            time: this.clock() / 1000,
            time_str: new Date(this.clock()).toISOString(),
            note: body.note ?? null,
            emergency_lock_key_is_set: false,
        };
        this.bump('lock_info_uid');
        this.notify();
        return this.lockResponse();
    }

    unlock(lockKey?: string): LockResponse {
        if (!this.state.lockKey) {
            return { ...this.lockResponse(), success: false, msg: 'Nothing is locked.' };
        }
        if (lockKey !== this.state.lockKey) {
            return { ...this.lockResponse(), success: false, msg: 'Invalid lock key.' };
        }
        this.state.lockKey = null;
        this.state.lock = { environment: false, queue: false };
        this.bump('lock_info_uid');
        this.notify();
        return this.lockResponse();
    }

    getLockInfo(): GetLockInfoResponse {
        return this.lockResponse();
    }

    private lockResponse(): LockResponse {
        return {
            ...ok(),
            lock_info: this.state.lock,
            lock_info_uid: this.state.uids.lock_info_uid,
        };
    }

    // #endregion

    // #region internals: the run lifecycle

    /** Move the front queue item onto the Run Engine. */
    private dequeueNext(): void {
        const item = this.state.queue.shift();
        if (!item) {
            this.goIdle();
            this.bump('plan_queue_uid');
            return;
        }
        this.console(SIM_CONSOLE.processingNextItem(this.state.queue.length));
        this.beginRun(item, 'queue');
    }

    private beginRun(item: QueueItem, origin: SimRunOrigin): void {
        const durationMs =
            this.behavior.runDurationByPlan[item.name] ?? this.behavior.runDurationMs;
        const slot: SimRunningSlot = {
            // `time_start` is in seconds, matching the server's `time.time()`.
            item: { ...item, properties: { time_start: this.clock() / 1000 } },
            origin,
            elapsedMs: 0,
            durationMs,
            paused: false,
            runUid: this.uidFactory('run'),
            scanId: ++this.state.scanIdCounter,
            willFail: this.behavior.failNextRun,
        };
        // `failNextRun` is a one-shot arm, consumed as soon as a run picks it up.
        if (this.behavior.failNextRun) this.behavior = { ...this.behavior, failNextRun: false };

        this.state.running = slot;
        this.state.managerState = 'executing_queue';
        this.state.reState = 'running';
        this.state.environmentState = 'executing_plan';
        this.state.runList = [
            { uid: slot.runUid, scan_id: slot.scanId, is_open: true, exit_status: null },
        ];
        this.bump('run_list_uid');
        this.bump('plan_queue_uid');
        this.consoleLines(
            planStartSequence({
                item: slot.item,
                scanId: slot.scanId,
                runUid: slot.runUid,
                timeLabel: formatClockTime(this.clock()),
            }),
        );
    }

    /**
     * The single exit path for every way a run can end: completion, stop, abort, halt, a
     * destroyed environment, or `panic()`.
     */
    private finishRun(
        exitStatus: SimExitStatus,
        msg: string,
        traceback: string,
        requeue: boolean,
        options: { continueQueue?: boolean } = {},
    ): void {
        const slot = this.state.running;
        if (!slot) return;

        const { properties: _properties, ...bareItem } = slot.item;
        const result: Result = {
            exit_status: exitStatus,
            run_uids: [slot.runUid],
            scan_ids: [slot.scanId],
            time_start: slot.item.properties.time_start,
            time_stop: this.clock() / 1000,
            msg,
            traceback,
        };
        const historyItem: HistoryItem = { ...bareItem, result };
        this.state.history.push(historyItem);
        this.bump('plan_history_uid');

        this.state.runList = [
            {
                uid: slot.runUid,
                scan_id: slot.scanId,
                is_open: false,
                exit_status: exitStatus === 'completed' ? 'success' : 'fail',
            },
        ];
        this.bump('run_list_uid');

        const failed = exitStatus !== 'completed' && exitStatus !== 'stopped';
        const shouldRequeue =
            requeue && slot.origin === 'queue' && !this.state.queueMode.ignore_failures;
        if (shouldRequeue) this.state.queue.unshift(bareItem as QueueItem);
        else if (
            exitStatus === 'completed' &&
            this.state.queueMode.loop &&
            slot.origin === 'queue'
        ) {
            this.state.queue.push(bareItem as QueueItem);
        }

        this.state.running = null;
        this.bump('plan_queue_uid');
        if (failed) this.console(SIM_CONSOLE.planFailed(msg));
        this.consoleLines(
            planEndSequence({
                runUid: slot.runUid,
                planState: exitStatus,
                scanId: slot.scanId,
                planName: slot.item.name,
                failed,
            }),
        );

        if (options.continueQueue === false) {
            this.goIdle();
            return;
        }
        this.decideNext(slot.origin, failed);
    }

    /** What happens after a run ends. */
    private decideNext(origin: SimRunOrigin, failed: boolean): void {
        if (this.state.queueStopPending) {
            this.state.queueStopPending = false;
            this.goIdle();
            this.console(SIM_CONSOLE.queueStopped);
            return;
        }
        if (failed && !this.state.queueMode.ignore_failures) {
            this.goIdle();
            this.console(SIM_CONSOLE.queueStoppedAfterFailure);
            return;
        }
        // Executing a single item never continues into the queue.
        if (origin === 'execute') {
            this.goIdle();
            return;
        }
        if (this.state.queue.length > 0) {
            this.dequeueNext();
            return;
        }
        this.goIdle();
        this.console(SIM_CONSOLE.noItemsLeft);
        this.console(SIM_CONSOLE.queueEmpty);
    }

    private goIdle(): void {
        this.state.managerState = 'idle';
        if (this.state.environmentState !== 'closed') {
            this.state.reState = 'idle';
            this.state.environmentState = 'idle';
        }
        this.state.pausePending = false;
    }

    private tick({ dt }: TickContext): void {
        const deltaMs = dt * 1000;
        let changed = false;

        if (this.state.timers.environmentOpenMs > 0) {
            this.state.timers.environmentOpenMs -= deltaMs;
            if (this.state.timers.environmentOpenMs <= 0) this.finishEnvironmentOpen();
            changed = true;
        }
        if (this.state.timers.environmentCloseMs > 0) {
            this.state.timers.environmentCloseMs -= deltaMs;
            if (this.state.timers.environmentCloseMs <= 0) this.finishEnvironmentClose();
            changed = true;
        }

        for (const task of Object.values(this.state.tasks)) {
            if (task.status !== 'running' || task.remainingMs <= 0) continue;
            task.remainingMs -= deltaMs;
            if (task.remainingMs <= 0) {
                task.status = 'completed';
                this.bump('task_results_uid');
            }
            changed = true;
        }

        const slot = this.state.running;
        if (slot && !slot.paused && this.behavior.autoCompleteRuns) {
            slot.elapsedMs += deltaMs;
            changed = true;
            if (slot.elapsedMs >= slot.durationMs) {
                if (slot.willFail) {
                    this.finishRun(
                        'failed',
                        this.behavior.failMessage,
                        simTraceback('failure'),
                        true,
                    );
                } else {
                    this.finishRun('completed', '', '', false);
                }
            }
        }

        if (changed) this.notify();
    }

    // #endregion

    // #region internals: plumbing

    private validateItem(
        raw: BaseQueueItem | undefined,
    ): { ok: true; item: BaseQueueItem } | { ok: false; msg: string } {
        if (!raw || typeof raw !== 'object' || !raw.name) {
            return { ok: false, msg: "Failed to add an item: Item does not have a 'name'." };
        }
        const itemType = raw.item_type ?? 'plan';
        if (!VALID_ITEM_TYPES.includes(itemType)) {
            return {
                ok: false,
                msg: `Failed to add an item: Unsupported item type '${itemType}'.`,
            };
        }
        if (
            this.behavior.validatePlanNames &&
            itemType === 'plan' &&
            !(raw.name in this.state.plansAllowed)
        ) {
            return {
                ok: false,
                msg:
                    `Failed to add an item: Plan validation failed: Plan '${raw.name}' is not in ` +
                    'the list of allowed plans.',
            };
        }
        return { ok: true, item: { ...raw, item_type: itemType } };
    }

    private stampItem(
        item: BaseQueueItem,
        body: { user?: string; user_group?: string },
    ): QueueItem {
        return {
            ...item,
            user: body.user ?? this.behavior.user,
            user_group: body.user_group ?? this.behavior.userGroup,
            item_uid: this.uidFactory('item'),
        };
    }

    /** Resolve a `{uid}` or `{pos}` address to a queue index, or `null` if unresolvable. */
    private resolveIndex(
        address: QueueItemAddress,
        options: { defaultToBack?: boolean } = {},
    ): number | null {
        const { queue } = this.state;
        if (address.uid) {
            const index = queue.findIndex((item) => item.item_uid === address.uid);
            return index === -1 ? null : index;
        }
        if (queue.length === 0) return null;
        const pos = address.pos ?? (options.defaultToBack ? 'back' : undefined);
        if (pos === undefined) return null;
        if (pos === 'front') return 0;
        if (pos === 'back') return queue.length - 1;
        const raw = typeof pos === 'number' ? pos : Number.parseInt(pos, 10);
        if (Number.isNaN(raw)) return null;
        const index = raw < 0 ? queue.length + raw : raw;
        return index >= 0 && index < queue.length ? index : null;
    }

    private bump(key: keyof QServerSimState['uids']): void {
        this.state.uids[key] = this.uidFactory(UID_PREFIXES[key]);
    }

    /**
     * Publish a state change.
     *
     * State subscribers always fire; status subscribers only when the derived status actually
     * differs, so a run progressing does not push a status frame every tick.
     */
    private notify(): void {
        this.state.versionCounter += 1;
        this.stateEmitter.emit(this.state);

        const status = this.getStatus();
        const json = JSON.stringify(status);
        if (json !== this.lastStatusJson) {
            this.lastStatusJson = json;
            this.statusEmitter.emit(status);
        }
    }

    // #endregion
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
export function createQServerSim(options: CreateQServerSimOptions = {}): QServerSim {
    return new QServerSimulator(options);
}

const UID_PREFIXES: Record<keyof QServerSimState['uids'], string> = {
    plan_queue_uid: 'queue-uid',
    plan_history_uid: 'history-uid',
    run_list_uid: 'runlist-uid',
    task_results_uid: 'taskresults-uid',
    lock_info_uid: 'lock-uid',
    devices_allowed_uid: 'devices-uid',
    plans_allowed_uid: 'plans-uid',
    devices_existing_uid: 'devices-existing-uid',
    plans_existing_uid: 'plans-existing-uid',
    console_output_uid: 'console-uid',
};

function resolveBehavior(options: QServerSimBehaviorOptions): ResolvedBehavior {
    return {
        runDurationMs: options.runDurationMs ?? DEFAULT_BEHAVIOR.runDurationMs,
        runDurationByPlan: options.runDurationByPlan ?? DEFAULT_BEHAVIOR.runDurationByPlan,
        autoCompleteRuns: options.autoCompleteRuns ?? DEFAULT_BEHAVIOR.autoCompleteRuns,
        failNextRun: options.failNextRun ?? DEFAULT_BEHAVIOR.failNextRun,
        failMessage: options.failMessage ?? DEFAULT_BEHAVIOR.failMessage,
        latencyMs: options.latencyMs ?? DEFAULT_BEHAVIOR.latencyMs,
        consoleOutput: options.consoleOutput ?? DEFAULT_BEHAVIOR.consoleOutput,
        consolePrefix: options.consolePrefix ?? DEFAULT_BEHAVIOR.consolePrefix,
        consoleBufferSize: options.consoleBufferSize ?? DEFAULT_BEHAVIOR.consoleBufferSize,
        environmentOpenMs: options.environmentOpenMs ?? DEFAULT_BEHAVIOR.environmentOpenMs,
        environmentCloseMs: options.environmentCloseMs ?? DEFAULT_BEHAVIOR.environmentCloseMs,
        tickMs: options.tickMs ?? DEFAULT_BEHAVIOR.tickMs,
        version: options.version ?? DEFAULT_BEHAVIOR.version,
        user: options.user ?? DEFAULT_BEHAVIOR.user,
        userGroup: options.userGroup ?? DEFAULT_BEHAVIOR.userGroup,
        validatePlanNames: options.validatePlanNames ?? DEFAULT_BEHAVIOR.validatePlanNames,
    };
}

function stripUndefined<T extends object>(value: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(value).filter(([, entry]) => entry !== undefined),
    ) as Partial<T>;
}

function insertItem(
    queue: QueueItem[],
    item: QueueItem,
    position: { pos?: string | number; before_uid?: string; after_uid?: string },
): void {
    if (position.before_uid) {
        const index = queue.findIndex((entry) => entry.item_uid === position.before_uid);
        if (index !== -1) {
            queue.splice(index, 0, item);
            return;
        }
    }
    if (position.after_uid) {
        const index = queue.findIndex((entry) => entry.item_uid === position.after_uid);
        if (index !== -1) {
            queue.splice(index + 1, 0, item);
            return;
        }
    }
    const pos = position.pos;
    if (pos === 'front') {
        queue.unshift(item);
        return;
    }
    if (typeof pos === 'number' && pos >= 0 && pos < queue.length) {
        queue.splice(pos, 0, item);
        return;
    }
    queue.push(item);
}

function describeAddress(address: QueueItemAddress): string {
    if (address.uid) return `Item with UID '${address.uid}'`;
    return `Position '${String(address.pos ?? 'back')}'`;
}

function highestScanId(history: HistoryItem[]): number {
    let highest = 0;
    for (const item of history) {
        for (const scanId of item.result?.scan_ids ?? []) {
            const value = typeof scanId === 'number' ? scanId : Number.parseInt(scanId, 10);
            if (!Number.isNaN(value) && value > highest) highest = value;
        }
    }
    return highest;
}

function simTraceback(kind: string): string {
    return [
        'Traceback (most recent call last):',
        '  File "<qserver-sim>", line 1, in run_plan',
        `    raise SimulatedFailure('${kind}')`,
        `SimulatedFailure: ${kind}`,
    ].join('\n');
}

function clone<T>(value: T): T {
    return typeof structuredClone === 'function'
        ? structuredClone(value)
        : (JSON.parse(JSON.stringify(value)) as T);
}
