import { beforeEach, describe, expect, it } from 'vitest';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';
import type { QServerSimUids } from '../../../lib/qserver-sim/core/types';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import { emptyQServer } from '../../../lib/qserver-sim/scenarios/emptyQServer';

/**
 * The uid bump rules are a behavioural contract, not cosmetics: `useQueueServer.ts` only
 * refetches the queue and history when `plan_queue_uid` / `plan_history_uid` change, so a
 * missing bump means a frozen UI and a spurious bump means a refetch storm.
 */

const UID_KEYS: (keyof QServerSimUids)[] = [
    'plan_queue_uid',
    'plan_history_uid',
    'run_list_uid',
    'task_results_uid',
    'lock_info_uid',
    'devices_allowed_uid',
    'plans_allowed_uid',
    'devices_existing_uid',
    'plans_existing_uid',
    'console_output_uid',
];

function snapshot(sim: QServerSim): QServerSimUids {
    return { ...sim.getState().uids };
}

/** Uid keys whose value differs between two snapshots. */
function changed(before: QServerSimUids, after: QServerSimUids): (keyof QServerSimUids)[] {
    return UID_KEYS.filter((key) => before[key] !== after[key]);
}

describe('uid bump rules', () => {
    let sim: QServerSim;

    beforeEach(() => {
        sim = defaultQServer();
    });

    it('bumps the queue uid when an item is added', () => {
        const before = snapshot(sim);
        sim.addItem({ item: { name: 'count', item_type: 'plan' } });
        expect(changed(before, snapshot(sim))).toEqual(['plan_queue_uid', 'console_output_uid']);
    });

    it('bumps nothing when an add is rejected', () => {
        const before = snapshot(sim);
        const response = sim.addItem({ item: { name: 'not_a_plan', item_type: 'plan' } });

        expect(response.success).toBe(false);
        expect(changed(before, snapshot(sim))).toEqual([]);
    });

    it('bumps the queue uid on remove, move and clear', () => {
        const uid = sim.getState().queue[0].item_uid;

        let before = snapshot(sim);
        sim.removeItem({ uid });
        expect(changed(before, snapshot(sim))).toContain('plan_queue_uid');

        before = snapshot(sim);
        sim.moveItem({ uid: sim.getState().queue[1].item_uid, pos_dest: 'front' });
        expect(changed(before, snapshot(sim))).toEqual(['plan_queue_uid']);

        before = snapshot(sim);
        sim.clearQueue();
        expect(changed(before, snapshot(sim))).toContain('plan_queue_uid');
    });

    it('bumps only the history uid when history is cleared', () => {
        const before = snapshot(sim);
        sim.clearHistory();
        expect(changed(before, snapshot(sim))).toEqual(['plan_history_uid', 'console_output_uid']);
    });

    it('bumps queue and run-list uids when an item is dequeued', () => {
        const before = snapshot(sim);
        sim.startQueue();
        const difference = changed(before, snapshot(sim));

        expect(difference).toContain('plan_queue_uid');
        expect(difference).toContain('run_list_uid');
        expect(difference).not.toContain('plan_history_uid');
    });

    it('bumps queue, history and run-list uids when a run completes', () => {
        sim.startQueue();
        const before = snapshot(sim);
        sim.advance(sim.getBehavior().runDurationMs);
        const difference = changed(before, snapshot(sim));

        expect(difference).toContain('plan_queue_uid');
        expect(difference).toContain('plan_history_uid');
        expect(difference).toContain('run_list_uid');
    });

    /**
     * The load-bearing negative. If a progress tick bumped uids, every consumer polling on
     * `plan_queue_uid` would refetch the whole queue several times a second.
     */
    it('bumps nothing while a run is merely progressing', () => {
        sim.startQueue();
        const before = snapshot(sim);
        sim.advance(sim.getBehavior().runDurationMs / 3);

        expect(sim.getState().running).not.toBeNull();
        expect(changed(before, snapshot(sim))).toEqual([]);
    });

    it('bumps nothing when starting an empty queue', () => {
        sim.clearQueue();
        const before = snapshot(sim);
        const response = sim.startQueue();

        expect(response.success).toBe(false);
        // Only the console line moves; queue and history data are untouched.
        expect(changed(before, snapshot(sim))).toEqual(['console_output_uid']);
    });

    it('bumps nothing when starting with a closed environment', () => {
        const closed = emptyQServer({ queue: defaultQServer().getState().queue });
        const before = snapshot(closed);

        expect(closed.startQueue().success).toBe(false);
        expect(changed(before, snapshot(closed))).toEqual([]);
    });

    it('bumps no data uids on pause, resume or queue stop', () => {
        sim.startQueue();
        const before = snapshot(sim);

        sim.pause();
        sim.resume();
        sim.stopQueue();
        sim.cancelQueueStop();

        // Console lines are expected; nothing else may move.
        expect(changed(before, snapshot(sim))).toEqual(['console_output_uid']);
    });

    it('bumps queue, history and run-list uids on abort', () => {
        sim.startQueue();
        sim.pause();
        const before = snapshot(sim);
        sim.abortRun();
        const difference = changed(before, snapshot(sim));

        expect(difference).toContain('plan_queue_uid');
        expect(difference).toContain('plan_history_uid');
        expect(difference).toContain('run_list_uid');
    });

    it('bumps catalog uids when the catalogs are replaced', () => {
        let before = snapshot(sim);
        sim.setPlans({});
        expect(changed(before, snapshot(sim))).toEqual(['plans_allowed_uid', 'plans_existing_uid']);

        before = snapshot(sim);
        sim.setDevices({});
        expect(changed(before, snapshot(sim))).toEqual([
            'devices_allowed_uid',
            'devices_existing_uid',
        ]);
    });

    it('bumps the lock uid on lock and unlock', () => {
        let before = snapshot(sim);
        sim.lock({ lock_key: 'k', environment: true });
        expect(changed(before, snapshot(sim))).toEqual(['lock_info_uid']);

        before = snapshot(sim);
        sim.unlock('k');
        expect(changed(before, snapshot(sim))).toEqual(['lock_info_uid']);
    });

    it('bumps the console uid for every emitted line', () => {
        const before = snapshot(sim);
        sim.startQueue();
        expect(snapshot(sim).console_output_uid).not.toBe(before.console_output_uid);
    });

    it('bumps nothing when console output is disabled', () => {
        const quiet = defaultQServer({ consoleOutput: false });
        const before = snapshot(quiet);
        quiet.clearQueue();

        expect(changed(before, snapshot(quiet))).toEqual(['plan_queue_uid']);
        expect(quiet.getState().console).toHaveLength(0);
    });
});
