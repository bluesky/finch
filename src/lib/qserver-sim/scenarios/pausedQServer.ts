import { createQServerSim, type QServerSim } from '../core/QServerSim';
import type { CreateQServerSimOptions } from '../core/types';
import { defaultHistory } from '../fixtures/defaultHistory';
import { defaultQueue } from '../fixtures/defaultQueue';
import { BASE_SCENARIO_OPTIONS } from './defaultQServer';

/**
 * A paused plan, one third of the way through.
 *
 * The only scenario where `resume`, `stopRun`, `abortRun` and `haltRun` succeed — every one of
 * them requires a paused Run Engine, so this is the setup for exercising those buttons.
 */
export function pausedQServer(overrides: Partial<CreateQServerSimOptions> = {}): QServerSim {
    const runDurationMs = overrides.runDurationMs ?? BASE_SCENARIO_OPTIONS.runDurationMs ?? 3000;
    return createQServerSim({
        ...BASE_SCENARIO_OPTIONS,
        queue: defaultQueue,
        history: defaultHistory,
        environmentState: 'idle',
        running: { itemIndex: 0, elapsedMs: Math.round(runDurationMs / 3), paused: true },
        ...overrides,
    });
}
