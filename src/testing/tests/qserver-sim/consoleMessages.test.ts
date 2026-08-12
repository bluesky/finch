import { describe, expect, it } from 'vitest';
import {
    LEGACY_CONSOLE_PREFIXES,
    SIM_CONSOLE,
} from '../../../lib/qserver-sim/core/consoleMessages';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import { errorQServer } from '../../../lib/qserver-sim/scenarios/errorQServer';

/**
 * `src/components/QServer/QSConsole.tsx` refetches the queue and history when it spots literal
 * substrings in console output. These tests are the regression guard for that contract: if a
 * message is reworded and stops matching, sim-driven UI silently stops refreshing.
 */

/** Drive the sim transition that should produce each legacy prefix. */
const TRANSITIONS: Record<string, (sim: QServerSim) => void> = {
    'Starting queue processing': (sim) => sim.startQueue(),
    'Processing the next queue item': (sim) => sim.startQueue(),
    'Starting the plan': (sim) => sim.startQueue(),
    'Item added: success=True': (sim) => {
        sim.addItem({ item: { name: 'count', item_type: 'plan' } });
    },
    'Removing item from the queue': (sim) => {
        sim.removeItem({ pos: 'front' });
    },
    'Clearing the queue': (sim) => sim.clearQueue(),
    'Queue is empty': (sim) => {
        sim.clearQueue();
        sim.startQueue();
    },
    'The plan failed': (sim) => sim.panic('simulated'),
};

describe('legacy console prefixes', () => {
    it('covers every prefix the console watcher looks for', () => {
        expect(Object.keys(TRANSITIONS).sort()).toEqual([...LEGACY_CONSOLE_PREFIXES].sort());
    });

    for (const [prefix, drive] of Object.entries(TRANSITIONS)) {
        it(`emits a line starting with "${prefix}"`, () => {
            const sim = defaultQServer();
            drive(sim);

            const lines = sim.getState().console.map((message) => message.msg.trim());
            expect(lines.some((line) => line.startsWith(prefix))).toBe(true);
        });
    }
});

describe('console output', () => {
    it('reports plan outcomes', () => {
        const sim = defaultQServer();
        sim.startQueue();
        sim.advance(sim.getBehavior().runDurationMs);
        expect(sim.getConsoleText()).toContain(SIM_CONSOLE.planExited('completed'));

        const failing = errorQServer();
        failing.startQueue();
        failing.advance(failing.getBehavior().runDurationMs);
        expect(failing.getConsoleText()).toContain('The plan failed:');
    });

    it('orders the lines a queue start produces', () => {
        const sim = defaultQServer();
        sim.startQueue();

        const lines = sim.getState().console.map((message) => message.msg.trim());
        expect(lines).toEqual([
            SIM_CONSOLE.startingQueue,
            SIM_CONSOLE.processingNextItem(2),
            SIM_CONSOLE.startingPlan('count'),
        ]);
    });

    it('emits nothing at all when console output is disabled', () => {
        const sim = defaultQServer({ consoleOutput: false });
        sim.startQueue();
        sim.advance(sim.getBehavior().runDurationMs);

        expect(sim.getState().console).toHaveLength(0);
        expect(sim.getConsoleText()).toBe('');
    });

    it('bounds the buffer', () => {
        const sim = defaultQServer({ consoleBufferSize: 3, queue: [] });
        for (let index = 0; index < 10; index += 1) sim.clearQueue();

        expect(sim.getState().console).toHaveLength(3);
    });

    it('returns the last n lines joined by newlines', () => {
        const sim = defaultQServer();
        sim.startQueue();

        const text = sim.getConsoleText(2);
        expect(text.split('\n').filter(Boolean)).toHaveLength(2);
        expect(text).toContain(SIM_CONSOLE.startingPlan('count'));
        expect(text).not.toContain(SIM_CONSOLE.startingQueue);
    });

    it('delivers only messages newer than a given uid', () => {
        const sim = defaultQServer();
        sim.startQueue();

        const first = sim.getConsoleSince();
        expect(first.console_output_msgs).toHaveLength(3);

        const second = sim.getConsoleSince(first.last_msg_uid);
        expect(second.console_output_msgs).toHaveLength(0);

        sim.clearQueue();
        const third = sim.getConsoleSince(first.last_msg_uid);
        expect(third.console_output_msgs).toHaveLength(1);
        expect(third.console_output_msgs[0].msg.trim()).toBe(SIM_CONSOLE.clearingQueue);
    });
});
