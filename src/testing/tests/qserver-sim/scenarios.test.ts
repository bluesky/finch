import { describe, expect, it } from 'vitest';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import { emptyQServer } from '../../../lib/qserver-sim/scenarios/emptyQServer';
import { errorQServer } from '../../../lib/qserver-sim/scenarios/errorQServer';
import { pausedQServer } from '../../../lib/qserver-sim/scenarios/pausedQServer';
import { runningQServer } from '../../../lib/qserver-sim/scenarios/runningQServer';

describe('scenario isolation', () => {
    /**
     * The reason scenarios are functions rather than ophyd-sim-style module singletons: two
     * stories, or two tests, must never share mutable queue state.
     */
    it('gives every caller its own unshared state', () => {
        const first = defaultQServer();
        const second = defaultQServer();

        first.addItem({ item: { name: 'count', item_type: 'plan' } });
        first.clearHistory();
        first.getState().plansAllowed.count.description = 'mutated';

        expect(second.getStatus().items_in_queue).toBe(3);
        expect(second.getStatus().items_in_history).toBe(2);
        expect(second.getState().plansAllowed.count.description).not.toBe('mutated');
        expect(second.getState().queue).not.toBe(first.getState().queue);
    });
});

describe('scenario states', () => {
    it('defaultQServer is open, idle, and lightly seeded', () => {
        expect(defaultQServer().getStatus()).toMatchObject({
            manager_state: 'idle',
            re_state: 'idle',
            worker_environment_state: 'idle',
            worker_environment_exists: true,
            items_in_queue: 3,
            items_in_history: 2,
            running_item_uid: null,
        });
    });

    it('emptyQServer is closed and empty but still knows its catalogs', () => {
        const sim = emptyQServer();

        expect(sim.getStatus()).toMatchObject({
            manager_state: 'idle',
            re_state: null,
            worker_environment_state: 'closed',
            items_in_queue: 0,
            items_in_history: 0,
        });
        expect(Object.keys(sim.getState().plansAllowed)).toEqual(['count', 'scan', 'grid_scan']);
        expect(Object.keys(sim.getState().devicesAllowed)).toContain('motor1');
    });

    it('runningQServer has a plan mid-flight with an open run', () => {
        const sim = runningQServer();

        expect(sim.getStatus()).toMatchObject({
            manager_state: 'executing_queue',
            re_state: 'running',
            worker_environment_state: 'executing_plan',
            items_in_queue: 2,
            running_item_uid: 'fixture-item-1',
        });

        const [run] = sim.getRuns('active').run_list;
        expect(run.is_open).toBe(true);
        // Scan ids continue past the seeded history rather than restarting at 1.
        expect(run.scan_id).toBe(3);
    });

    it('pausedQServer is the only scenario where the terminal controls work', () => {
        expect(pausedQServer().getStatus()).toMatchObject({
            manager_state: 'paused',
            re_state: 'paused',
            pause_pending: false,
        });

        expect(pausedQServer().abortRun().success).toBe(true);
        expect(pausedQServer().stopRun().success).toBe(true);
        expect(defaultQServer().abortRun().success).toBe(false);
        expect(runningQServer().abortRun().success).toBe(false);
    });

    it('errorQServer carries a past failure and fails its next run', () => {
        const sim = errorQServer();

        expect(sim.getStatus().items_in_history).toBe(3);
        expect(sim.getState().history.at(-1)?.result.exit_status).toBe('failed');

        sim.startQueue();
        sim.advance(sim.getBehavior().runDurationMs);

        expect(sim.getState().history.at(-1)?.result.msg).toContain('timed out');
        expect(sim.getStatus().items_in_queue).toBe(1);
        expect(sim.getStatus().manager_state).toBe('idle');
    });
});

describe('scenario overrides', () => {
    it('applies per-field overrides', () => {
        const sim = defaultQServer({ runDurationMs: 500 });
        sim.startQueue();
        sim.advance(500);

        expect(sim.getState().history).toHaveLength(3);
    });

    it('replaces collections rather than merging them', () => {
        const sim = defaultQServer({ queue: [], history: [] });
        expect(sim.getStatus()).toMatchObject({ items_in_queue: 0, items_in_history: 0 });
    });

    it('accepts a custom catalog', () => {
        const sim = defaultQServer({
            plans: {
                xafs_scan: {
                    name: 'xafs_scan',
                    properties: { is_generator: true },
                    parameters: [],
                    module: 'lab.plans',
                },
            },
            queue: [],
        });

        expect(Object.keys(sim.getState().plansAllowed)).toEqual(['xafs_scan']);
        expect(sim.addItem({ item: { name: 'xafs_scan', item_type: 'plan' } }).success).toBe(true);
        expect(sim.addItem({ item: { name: 'count', item_type: 'plan' } }).success).toBe(false);
    });

    it('keeps uid generation deterministic across identical sims', () => {
        const first = defaultQServer();
        const second = defaultQServer();

        expect(first.addItem({ item: { name: 'count', item_type: 'plan' } }).item.item_uid).toBe(
            second.addItem({ item: { name: 'count', item_type: 'plan' } }).item.item_uid,
        );
    });
});
