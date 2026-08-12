import { describe, expect, it } from 'vitest';
import { createQServerSim } from '../../../lib/qserver-sim/core/QServerSim';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import { emptyQServer } from '../../../lib/qserver-sim/scenarios/emptyQServer';
import { errorQServer } from '../../../lib/qserver-sim/scenarios/errorQServer';
import { pausedQServer } from '../../../lib/qserver-sim/scenarios/pausedQServer';
import { runningQServer } from '../../../lib/qserver-sim/scenarios/runningQServer';

const RUN_MS = 3000;

describe('queue start refusals', () => {
    it('refuses to start with the environment closed', () => {
        const sim = emptyQServer();
        const response = sim.startQueue();

        expect(response.success).toBe(false);
        expect(response.msg).toContain('environment');
        expect(sim.getState().running).toBeNull();
    });

    it('refuses to start an empty queue and says so on the console', () => {
        const sim = defaultQServer({ queue: [] });
        const response = sim.startQueue();

        expect(response).toMatchObject({ success: false, msg: 'Queue is empty.' });
        expect(sim.getConsoleText()).toContain('Queue is empty');
        expect(sim.getStatus().manager_state).toBe('idle');
    });

    it('refuses to start while already executing', () => {
        const sim = runningQServer();
        expect(sim.startQueue().success).toBe(false);
    });
});

describe('the happy path', () => {
    it('moves an item from the queue onto the Run Engine', () => {
        const sim = defaultQServer();
        const front = sim.getState().queue[0];

        const response = sim.startQueue();

        expect(response).toMatchObject({ success: true, qsize: 2 });
        expect(sim.getStatus()).toMatchObject({
            items_in_queue: 2,
            running_item_uid: front.item_uid,
            manager_state: 'executing_queue',
            re_state: 'running',
            worker_environment_state: 'executing_plan',
        });
        expect(sim.getRuns('active').run_list).toEqual([
            { uid: 'sim-run-1', scan_id: 3, is_open: true, exit_status: null },
        ]);
    });

    it('completes a run into history with a real result', () => {
        const sim = defaultQServer();
        sim.startQueue();
        sim.advance(RUN_MS);

        const state = sim.getState();
        expect(state.history).toHaveLength(3);

        const completed = state.history[2];
        expect(completed.name).toBe('count');
        expect(completed.result).toMatchObject({
            exit_status: 'completed',
            run_uids: ['sim-run-1'],
            scan_ids: [3],
            msg: '',
            traceback: '',
        });
        expect(completed.result.time_stop).toBeGreaterThanOrEqual(completed.result.time_start);
        // The history item carries no `properties` — that only exists while running.
        expect('properties' in completed).toBe(false);

        // And the next item started immediately, from zero.
        expect(state.running?.item.name).toBe('scan');
        expect(state.running?.elapsedMs).toBe(0);
    });

    it('drains the whole queue and returns to idle', () => {
        const sim = defaultQServer();
        sim.startQueue();
        sim.advance(RUN_MS);
        sim.advance(RUN_MS);
        sim.advance(RUN_MS);

        expect(sim.getStatus()).toMatchObject({
            items_in_queue: 0,
            items_in_history: 5,
            running_item_uid: null,
            manager_state: 'idle',
            re_state: 'idle',
            worker_environment_state: 'idle',
        });
        expect(sim.getConsoleText()).toContain('Queue is empty');
    });

    it('needs the full duration to finish a run', () => {
        const sim = defaultQServer();
        sim.startQueue();

        sim.advance(RUN_MS - 1);
        expect(sim.getState().running).not.toBeNull();
        expect(sim.getState().history).toHaveLength(2);

        sim.advance(1);
        expect(sim.getState().history).toHaveLength(3);
    });

    it('honours per-plan durations', () => {
        const sim = defaultQServer({ runDurationByPlan: { count: 500 } });
        sim.startQueue();

        sim.advance(500);
        expect(sim.getState().history).toHaveLength(3);
        // The next plan uses the default duration, not the override.
        expect(sim.getState().running?.durationMs).toBe(RUN_MS);
    });

    it('never completes a run when autoCompleteRuns is off', () => {
        const sim = defaultQServer({ autoCompleteRuns: false });
        sim.startQueue();
        sim.advance(RUN_MS * 10);

        expect(sim.getState().running).not.toBeNull();
        expect(sim.getState().history).toHaveLength(2);
    });
});

describe('pause, resume and the terminal controls', () => {
    it('does not progress a paused run, and resumes cleanly', () => {
        const sim = defaultQServer();
        sim.startQueue();
        sim.advance(1000);

        expect(sim.pause().success).toBe(true);
        sim.advance(RUN_MS * 2);
        expect(sim.getState().running?.elapsedMs).toBe(1000);
        expect(sim.getState().history).toHaveLength(2);

        expect(sim.resume().success).toBe(true);
        sim.advance(RUN_MS);
        expect(sim.getState().history).toHaveLength(3);
    });

    it('refuses pause when nothing is running, and double pauses', () => {
        const idle = defaultQServer();
        expect(idle.pause().success).toBe(false);

        const paused = pausedQServer();
        expect(paused.pause().success).toBe(false);
    });

    it('refuses resume, stop, abort and halt unless paused', () => {
        const sim = runningQServer();
        expect(sim.resume().success).toBe(false);
        expect(sim.stopRun().success).toBe(false);
        expect(sim.abortRun().success).toBe(false);
        expect(sim.haltRun().success).toBe(false);
    });

    it('stop finishes the plan cleanly and does not requeue it', () => {
        const sim = pausedQServer();
        const queueLength = sim.getState().queue.length;

        expect(sim.stopRun().success).toBe(true);
        const state = sim.getState();

        expect(state.history.at(-1)?.result.exit_status).toBe('stopped');
        expect(state.queue).toHaveLength(queueLength);
        expect(state.running).toBeNull();
        expect(state.managerState).toBe('idle');
    });

    it('abort marks the run failed and returns the item to the front of the queue', () => {
        const sim = pausedQServer();
        const runningUid = sim.getState().running?.item.item_uid;
        const queueLength = sim.getState().queue.length;

        expect(sim.abortRun().success).toBe(true);
        const state = sim.getState();

        expect(state.history.at(-1)?.result.exit_status).toBe('abort');
        expect(state.history.at(-1)?.result.traceback).toContain('SimulatedFailure');
        expect(state.queue).toHaveLength(queueLength + 1);
        expect(state.queue[0].item_uid).toBe(runningUid);
        expect(state.managerState).toBe('idle');
        expect(sim.getConsoleText()).toContain('The plan failed');
    });

    it('halt differs from abort only in exit status', () => {
        const sim = pausedQServer();
        sim.haltRun();
        expect(sim.getState().history.at(-1)?.result.exit_status).toBe('halted');
        expect(sim.getState().queue[0].item_uid).toBe('fixture-item-1');
    });
});

describe('queue stop', () => {
    it('finishes the running plan and then stops, leaving the rest queued', () => {
        const sim = runningQServer();
        expect(sim.stopQueue()).toMatchObject({ success: true });
        expect(sim.getStatus().queue_stop_pending).toBe(true);

        sim.advance(RUN_MS);

        expect(sim.getStatus()).toMatchObject({
            manager_state: 'idle',
            queue_stop_pending: false,
            items_in_queue: 2,
            running_item_uid: null,
        });
        expect(sim.getConsoleText()).toContain('Queue is stopped.');
    });

    it('can be cancelled so the queue keeps going', () => {
        const sim = runningQServer();
        sim.stopQueue();
        expect(sim.cancelQueueStop().success).toBe(true);

        sim.advance(RUN_MS);
        expect(sim.getState().running).not.toBeNull();
        expect(sim.getStatus().items_in_queue).toBe(1);
    });

    it('refuses a stop when the queue is not running', () => {
        expect(defaultQServer().stopQueue().success).toBe(false);
        expect(defaultQServer().cancelQueueStop().success).toBe(false);
    });
});

describe('failures', () => {
    it('records a failure, requeues the item and stops the queue', () => {
        const sim = errorQServer();
        sim.startQueue();
        sim.advance(RUN_MS);

        const state = sim.getState();
        const failure = state.history.at(-1)?.result;

        expect(failure?.exit_status).toBe('failed');
        expect(failure?.msg).toContain('timed out');
        expect(failure?.traceback).toContain('Traceback');
        expect(state.queue[0].name).toBe('count');
        expect(state.managerState).toBe('idle');
        expect(sim.getConsoleText()).toContain('The plan failed');
    });

    it('consumes failNextRun so a retry succeeds', () => {
        const sim = errorQServer();
        sim.startQueue();
        sim.advance(RUN_MS);
        expect(sim.getBehavior().failNextRun).toBe(false);

        sim.startQueue();
        sim.advance(RUN_MS);
        expect(sim.getState().history.at(-1)?.result.exit_status).toBe('completed');
    });

    it('keeps going and does not requeue when ignore_failures is set', () => {
        const sim = defaultQServer({
            failNextRun: true,
            queueMode: { ignore_failures: true },
        });
        sim.startQueue();
        sim.advance(RUN_MS);

        const state = sim.getState();
        expect(state.history.at(-1)?.result.exit_status).toBe('failed');
        expect(state.queue.map((item) => item.name)).toEqual(['grid_scan']);
        expect(state.running?.item.name).toBe('scan');
    });

    it('panic fails the running plan and reports it', () => {
        const sim = runningQServer();
        sim.panic('detector exploded');

        expect(sim.getState().history.at(-1)?.result).toMatchObject({
            exit_status: 'failed',
            msg: 'detector exploded',
        });
        expect(sim.getStatus().re_state).toBe('panicked');
        expect(sim.getConsoleText()).toContain('The plan failed: detector exploded');
    });
});

describe('queue mode', () => {
    it('loops completed items back to the end of the queue', () => {
        const sim = defaultQServer({ queueMode: { loop: true } });
        const initialLength = sim.getState().queue.length;

        sim.startQueue();
        sim.advance(RUN_MS);

        const state = sim.getState();
        // The completed plan goes to the back, and the next one is already running — so the
        // total (queued + running) is conserved across a full cycle.
        expect(state.queue).toHaveLength(initialLength - 1);
        expect(state.queue.at(-1)?.name).toBe('count');
        expect(state.running?.item.name).toBe('scan');
        expect(state.queue.length + 1).toBe(initialLength);
    });
});

describe('executing a single item', () => {
    it('runs without touching the queue and returns to idle afterwards', () => {
        const sim = defaultQServer();
        const queueBefore = [...sim.getState().queue];

        const response = sim.executeItem({
            item: { name: 'count', kwargs: { num: 1 }, item_type: 'plan' },
        });

        expect(response.success).toBe(true);
        expect(sim.getState().queue).toEqual(queueBefore);
        expect(sim.getState().running?.origin).toBe('execute');

        sim.advance(RUN_MS);

        expect(sim.getState().running).toBeNull();
        expect(sim.getStatus().manager_state).toBe('idle');
        // The queue is untouched: executing an item never continues into it.
        expect(sim.getState().queue).toEqual(queueBefore);
        expect(sim.getState().history).toHaveLength(3);
    });

    it('refuses with a closed environment or while busy', () => {
        expect(
            emptyQServer().executeItem({ item: { name: 'count', item_type: 'plan' } }).success,
        ).toBe(false);
        expect(
            runningQServer().executeItem({ item: { name: 'count', item_type: 'plan' } }).success,
        ).toBe(false);
    });
});

describe('the environment', () => {
    it('opens synchronously when environmentOpenMs is zero', () => {
        const sim = emptyQServer();
        expect(sim.openEnvironment().success).toBe(true);
        expect(sim.getStatus()).toMatchObject({
            worker_environment_state: 'idle',
            manager_state: 'idle',
            re_state: 'idle',
        });
    });

    it('takes simulated time to open when configured to', () => {
        const sim = emptyQServer({ environmentOpenMs: 500 });
        sim.openEnvironment();
        expect(sim.getStatus().worker_environment_state).toBe('initializing');

        sim.advance(250);
        expect(sim.getStatus().worker_environment_state).toBe('initializing');

        sim.advance(250);
        expect(sim.getStatus().worker_environment_state).toBe('idle');
        expect(sim.getConsoleText()).toContain('RE environment is ready.');
    });

    it('refuses to open twice, or to close when already closed', () => {
        const sim = defaultQServer();
        expect(sim.openEnvironment().success).toBe(false);
        expect(emptyQServer().closeEnvironment().success).toBe(false);
    });

    it('refuses to close while a plan is running', () => {
        const sim = runningQServer();
        const response = sim.closeEnvironment();

        expect(response.success).toBe(false);
        expect(response.msg).toContain('Stop the queue');
        expect(sim.getStatus().worker_environment_state).toBe('executing_plan');
    });

    it('destroys mid-plan, failing the run without requeueing it', () => {
        const sim = runningQServer();
        const queueLength = sim.getState().queue.length;

        expect(sim.destroyEnvironment().success).toBe(true);
        const state = sim.getState();

        expect(state.history.at(-1)?.result.exit_status).toBe('failed');
        expect(state.queue).toHaveLength(queueLength);
        expect(sim.getStatus()).toMatchObject({
            worker_environment_exists: false,
            worker_environment_state: 'closed',
            re_state: null,
            manager_state: 'idle',
        });
    });
});

describe('autostart', () => {
    it('starts a run as soon as an item is added while idle', () => {
        const sim = defaultQServer({ queue: [], queueAutostartEnabled: true });

        sim.addItem({ item: { name: 'count', item_type: 'plan' } });

        expect(sim.getState().running?.item.name).toBe('count');
        expect(sim.getStatus().manager_state).toBe('executing_queue');
    });

    it('leaves the item queued when the environment is closed', () => {
        const sim = emptyQServer({ queueAutostartEnabled: true });
        sim.addItem({ item: { name: 'count', item_type: 'plan' } });

        expect(sim.getState().running).toBeNull();
        expect(sim.getStatus().items_in_queue).toBe(1);
    });
});

describe('item validation and addressing', () => {
    it('rejects an unknown plan with the real failure shape', () => {
        const sim = defaultQServer();
        const response = sim.addItem({ item: { name: 'nope', item_type: 'plan' } });

        expect(response).toMatchObject({ success: false, qsize: null });
        expect(response.msg).toContain('is not in the list of allowed plans');
        expect('item_uid' in response.item).toBe(false);
        expect(sim.getStatus().items_in_queue).toBe(3);
    });

    it('accepts an unknown plan when validation is disabled', () => {
        const sim = defaultQServer({ validatePlanNames: false });
        expect(sim.addItem({ item: { name: 'anything', item_type: 'plan' } }).success).toBe(true);
    });

    it('stamps user, group and a minted uid on accepted items', () => {
        const sim = defaultQServer({ user: 'alice', userGroup: 'staff' });
        const response = sim.addItem({ item: { name: 'count', item_type: 'plan' } });

        expect(response.item).toMatchObject({
            user: 'alice',
            user_group: 'staff',
            item_uid: 'sim-item-1',
        });
    });

    it('honours pos, before_uid and after_uid', () => {
        const sim = defaultQServer();
        sim.addItem({ item: { name: 'count', item_type: 'plan' }, pos: 'front' });
        expect(sim.getState().queue[0].item_uid).toBe('sim-item-1');

        sim.addItem({ item: { name: 'scan', item_type: 'plan' }, before_uid: 'fixture-item-2' });
        expect(sim.getState().queue.map((item) => item.item_uid)).toEqual([
            'sim-item-1',
            'fixture-item-1',
            'sim-item-2',
            'fixture-item-2',
            'fixture-item-3',
        ]);
    });

    it('addresses items by uid and by position', () => {
        const sim = defaultQServer();

        expect(sim.getItem({ uid: 'fixture-item-2' }).item).toMatchObject({ name: 'scan' });
        expect(sim.getItem({ pos: 'front' }).item).toMatchObject({ name: 'count' });
        expect(sim.getItem({ pos: 'back' }).item).toMatchObject({ name: 'grid_scan' });
        expect(sim.getItem().item).toMatchObject({ name: 'grid_scan' });

        const missing = sim.getItem({ uid: 'nope' });
        expect(missing.success).toBe(false);
        expect(missing.item).toEqual({});
    });

    it('removes and moves batches of items', () => {
        const sim = defaultQServer();

        const removal = sim.removeItemBatch({ uids: ['fixture-item-1', 'nope'] });
        expect(removal.success).toBe(false);
        expect(removal.items).toHaveLength(1);

        const forgiving = sim.removeItemBatch({ uids: ['nope'], ignore_missing: true });
        expect(forgiving.success).toBe(true);

        expect(sim.getState().queue.map((item) => item.item_uid)).toEqual([
            'fixture-item-2',
            'fixture-item-3',
        ]);
    });

    it('updates an item in place, and replaces it with a new uid on request', () => {
        const sim = defaultQServer();
        const original = sim.getState().queue[0];

        const updated = sim.updateItem({
            item: { ...original, kwargs: { num: 99 } },
        });
        expect(updated.item.item_uid).toBe(original.item_uid);
        expect(sim.getState().queue[0].kwargs).toEqual({ num: 99 });

        const replaced = sim.updateItem({
            item: { ...original, kwargs: { num: 1 } },
            replace: true,
        });
        expect(replaced.item.item_uid).not.toBe(original.item_uid);
    });
});

describe('subscriptions', () => {
    it('replays state and status on subscribe, and pushes on change', () => {
        const sim = defaultQServer();
        const states: number[] = [];
        const statuses: number[] = [];

        sim.subscribeState((state) => states.push(state.queue.length));
        sim.subscribeStatus((status) => statuses.push(status.items_in_queue));

        expect(states).toEqual([3]);
        expect(statuses).toEqual([3]);

        sim.removeItem({ pos: 'front' });
        expect(states).toEqual([3, 2]);
        expect(statuses).toEqual([3, 2]);
    });

    it('does not push a status change for a progress tick', () => {
        const sim = defaultQServer();
        sim.startQueue();

        const statuses: unknown[] = [];
        sim.subscribeStatus((status) => statuses.push(status));
        expect(statuses).toHaveLength(1); // the replay

        sim.advance(RUN_MS / 3);
        expect(statuses).toHaveLength(1);
    });

    it('streams console lines without replaying the backlog', () => {
        const sim = defaultQServer();
        sim.startQueue();

        const lines: string[] = [];
        sim.subscribeConsole((message) => lines.push(message.msg));
        expect(lines).toEqual([]);

        sim.clearQueue();
        expect(lines.join('')).toContain('Clearing the queue.');
    });

    it('releases listeners on unsubscribe', () => {
        const sim = defaultQServer();
        const unsubscribe = sim.subscribeState(() => {});
        expect(sim.listenerCounts().state).toBe(1);

        unsubscribe();
        expect(sim.listenerCounts()).toEqual({ state: 0, status: 0, console: 0 });
    });

    it('survives a throwing listener', () => {
        const sim = defaultQServer();
        const seen: number[] = [];
        sim.subscribeState(() => {
            throw new Error('boom');
        });
        sim.subscribeState((state) => seen.push(state.queue.length));

        sim.removeItem({ pos: 'front' });
        expect(seen).toContain(2);
    });
});

describe('the live tick loop', () => {
    it('progresses runs on a real interval once started', async () => {
        const sim = createQServerSim({
            queue: [
                { name: 'count', item_type: 'plan', user: 'u', user_group: 'g', item_uid: 'a' },
            ],
            runDurationMs: 30,
            tickMs: 5,
        });
        sim.startQueue();
        sim.start();

        await new Promise((resolve) => setTimeout(resolve, 120));
        sim.stop();

        expect(sim.getState().history).toHaveLength(1);
        expect(sim.isRunning()).toBe(false);
    });
});
