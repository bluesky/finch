import { createQServerSim, type QServerSim } from '../core/QServerSim';
import type { CreateQServerSimOptions } from '../core/types';
import { defaultHistory, failedHistoryItem } from '../fixtures/defaultHistory';
import { defaultQueue } from '../fixtures/defaultQueue';
import { BASE_SCENARIO_OPTIONS } from './defaultQServer';

/**
 * A failure already in history, and the next run armed to fail too.
 *
 * `startQueue()` followed by `advance(runDurationMs)` produces a failed result with a traceback,
 * the `'The plan failed'` console line the legacy UI watches for, and the item back on the front
 * of the queue. `failNextRun` is one-shot, so the retry then succeeds.
 */
export function errorQServer(overrides: Partial<CreateQServerSimOptions> = {}): QServerSim {
    return createQServerSim({
        ...BASE_SCENARIO_OPTIONS,
        queue: [defaultQueue[0]],
        history: [...defaultHistory, failedHistoryItem],
        environmentState: 'idle',
        failNextRun: true,
        failMessage: "Simulated plan failure: device 'det' timed out.",
        ...overrides,
    });
}
