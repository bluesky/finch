import { describe, expect, it } from 'vitest';
import {
    LEGACY_CONSOLE_PREFIXES,
    SIM_CONSOLE,
} from '../../../lib/qserver-sim/core/consoleMessages';
import type { QServerSimState } from '../../../lib/qserver-sim/core/types';
import type { QServerSim } from '../../../lib/qserver-sim/core/QServerSim';
import { defaultQServer } from '../../../lib/qserver-sim/scenarios/defaultQServer';
import { errorQServer } from '../../../lib/qserver-sim/scenarios/errorQServer';

/**
 * `src/components/QServer/QSConsole.tsx` refetches the queue and history when it spots literal
 * substrings in console output. These tests are the regression guard for that contract: if a
 * message is reworded and stops matching, sim-driven UI silently stops refreshing.
 */

/**
 * Strip the `[I <timestamp> <logger>]` block the way `QSConsole.tsx` does before matching.
 *
 * Matching the consumer's own preprocessing is the point: the contract is about the message
 * *body*, and asserting it any other way would pass while the real UI stopped refetching.
 */
function messageBodies(state: QServerSimState): string[] {
    return state.console.map((message) => {
        const raw = message.msg;
        if (!raw.startsWith('[')) return raw.trim();
        return raw.slice(raw.indexOf(']') + 1).trim();
    });
}

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

            const bodies = messageBodies(sim.getState());
            expect(bodies.some((body) => body.startsWith(prefix))).toBe(true);
        });
    }
});

describe('console output', () => {
    it('reports plan outcomes', () => {
        const sim = defaultQServer();
        sim.startQueue();
        sim.advance(sim.getBehavior().runDurationMs);
        expect(sim.getConsoleText()).toContain(SIM_CONSOLE.planExited('completed'));
        expect(sim.getConsoleText()).toContain("Run was closed: 'sim-run-1'");

        const failing = errorQServer();
        failing.startQueue();
        failing.advance(failing.getBehavior().runDurationMs);
        expect(failing.getConsoleText()).toContain('The plan failed:');
    });

    it('orders the lines a queue start produces', () => {
        const sim = defaultQServer();
        sim.startQueue();

        const bodies = messageBodies(sim.getState());
        expect(bodies.slice(0, 2)).toEqual([
            SIM_CONSOLE.startingQueue,
            SIM_CONSOLE.processingNextItem(2),
        ]);
        // Then the plan-start block, ending with the stream announcement bluesky prints bare.
        expect(bodies[2].startsWith('Starting the plan:')).toBe(true);
        expect(bodies[2]).toContain("'name': 'count'");
        expect(bodies.slice(3)).toEqual([
            'Starting execution of a plan ...',
            "Starting a plan 'count'.",
            `Transient Scan ID: 3     Time: ${sim.getConsoleText().match(/Time: (\S+)/)?.[1]}`,
            `Persistent Unique Scan ID: 'sim-run-1'`,
            `New run was open: 'sim-run-1'`,
            "New stream: 'primary'",
        ]);
    });

    it('prefixes lines the way the real server does, and can be told not to', () => {
        const sim = defaultQServer();
        sim.clearQueue();

        const [line] = sim.getState().console;
        expect(line.msg).toMatch(
            /^\[I \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} bluesky_queueserver\.manager\.manager\] Clearing the queue \.\.\.\n$/,
        );

        const bare = defaultQServer({ consolePrefix: false });
        bare.clearQueue();
        expect(bare.getState().console[0].msg).toBe(`${SIM_CONSOLE.clearingQueue}\n`);
    });

    it("leaves bluesky's own output unprefixed", () => {
        const sim = defaultQServer();
        sim.startQueue();

        const scanIdLine = sim
            .getState()
            .console.map((message) => message.msg)
            .find((msg) => msg.includes('Transient Scan ID'));

        expect(scanIdLine?.startsWith('Transient Scan ID:')).toBe(true);
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

    it('returns the last n rendered lines', () => {
        const sim = defaultQServer();
        sim.startQueue();

        const text = sim.getConsoleText(2);
        expect(text.split('\n')).toHaveLength(2);
        expect(text).toContain("New stream: 'primary'");
        expect(text).not.toContain(SIM_CONSOLE.startingQueue);

        // Counting lines, not messages: the multi-line item dict inflates the count.
        const full = sim.getConsoleText();
        expect(sim.getConsoleText(500)).toBe(full.replace(/\n$/, ''));
    });

    it('delivers only messages newer than a given uid', () => {
        const sim = defaultQServer();
        sim.startQueue();

        const first = sim.getConsoleSince();
        expect(first.console_output_msgs.length).toBeGreaterThan(0);

        const second = sim.getConsoleSince(first.last_msg_uid);
        expect(second.console_output_msgs).toHaveLength(0);

        sim.clearQueue();
        const third = sim.getConsoleSince(first.last_msg_uid);
        expect(third.console_output_msgs).toHaveLength(1);
        expect(third.console_output_msgs[0].msg).toContain(SIM_CONSOLE.clearingQueue);
    });
});
