import { describe, expect, it } from 'vitest';
import { deriveStatus, STATUS_KEYS } from '../../../lib/qserver-sim/core/status';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import { emptyQServer } from '../../../lib/qserver-sim/scenarios/emptyQServer';
import { runningQServer } from '../../../lib/qserver-sim/scenarios/runningQServer';

describe('deriveStatus', () => {
    it('produces every documented status field and nothing else', () => {
        const status = deriveStatus(defaultQServer().getState());
        expect(Object.keys(status).sort()).toEqual([...STATUS_KEYS].sort());
    });

    it('tracks queue and history lengths', () => {
        const sim = defaultQServer();
        expect(sim.getStatus()).toMatchObject({ items_in_queue: 3, items_in_history: 2 });

        sim.removeItem({ pos: 'front' });
        expect(sim.getStatus().items_in_queue).toBe(2);

        sim.clearHistory();
        expect(sim.getStatus().items_in_history).toBe(0);
    });

    it('reports the running item uid only while a plan is on the Run Engine', () => {
        const idle = defaultQServer();
        expect(idle.getStatus().running_item_uid).toBeNull();

        const running = runningQServer();
        expect(running.getStatus().running_item_uid).toBe('fixture-item-1');
    });

    it('reports re_state as null exactly when the environment is closed', () => {
        const closed = emptyQServer();
        expect(closed.getStatus()).toMatchObject({
            worker_environment_exists: false,
            worker_environment_state: 'closed',
            re_state: null,
        });

        closed.openEnvironment();
        expect(closed.getStatus()).toMatchObject({
            worker_environment_exists: true,
            re_state: 'idle',
        });
    });

    it('counts only running background tasks', () => {
        const sim = defaultQServer();
        expect(sim.getStatus().worker_background_tasks).toBe(0);

        sim.getState().tasks = {
            a: { task_uid: 'a', status: 'running', remainingMs: 100 },
            b: { task_uid: 'b', status: 'completed', remainingMs: 0 },
        };
        expect(sim.getStatus().worker_background_tasks).toBe(1);
    });

    it('hands out a fresh plan_queue_mode object so callers cannot corrupt state', () => {
        const sim = defaultQServer();
        const status = sim.getStatus();
        status.plan_queue_mode.loop = true;

        expect(sim.getState().queueMode.loop).toBe(false);
        expect(sim.getStatus().plan_queue_mode.loop).toBe(false);
    });

    it('reflects manager and environment transitions', () => {
        const sim = defaultQServer();
        sim.startQueue();
        expect(sim.getStatus()).toMatchObject({
            manager_state: 'executing_queue',
            re_state: 'running',
            worker_environment_state: 'executing_plan',
        });

        sim.pause();
        expect(sim.getStatus()).toMatchObject({
            manager_state: 'paused',
            re_state: 'paused',
            pause_pending: false,
        });
    });
});
