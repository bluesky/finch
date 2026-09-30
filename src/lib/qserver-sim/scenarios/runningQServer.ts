import { createQServerSim, type QServerSim } from '../core/QServerSim';
import type { CreateQServerSimOptions } from '../core/types';
import { defaultHistory } from '../fixtures/defaultHistory';
import { defaultQueue } from '../fixtures/defaultQueue';
import { BASE_SCENARIO_OPTIONS } from './defaultQServer';

/**
 * A plan already executing, with two more queued behind it.
 *
 * The running slot is seeded by performing the real dequeue at construction, so this state is
 * provably reachable rather than hand-assembled. `advance(runDurationMs)` completes the current
 * plan and starts the next.
 */
export function runningQServer(overrides: Partial<CreateQServerSimOptions> = {}): QServerSim {
    return createQServerSim({
        ...BASE_SCENARIO_OPTIONS,
        queue: defaultQueue,
        history: defaultHistory,
        environmentState: 'idle',
        running: { itemIndex: 0 },
        ...overrides,
    });
}
