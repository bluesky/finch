import { createQServerSim, type QServerSim } from '../core/QServerSim';
import type { CreateQServerSimOptions } from '../core/types';
import { defaultHistory } from '../fixtures/defaultHistory';
import { defaultQueue } from '../fixtures/defaultQueue';

/**
 * Defaults shared by every scenario.
 *
 * `environmentOpenMs: 0` makes `openEnvironment()` land synchronously, so a story or test that
 * opens the environment does not have to advance time first. Raise it when you want to see the
 * `creating_environment` state on screen.
 */
export const BASE_SCENARIO_OPTIONS: CreateQServerSimOptions = {
    // `plans`/`devices` are left to the simulator's own defaults (`defaultPlans`/`defaultDevices`).
    environmentOpenMs: 0,
    environmentCloseMs: 0,
    latencyMs: 0,
    runDurationMs: 3000,
};

/**
 * The everyday baseline: environment open and idle, three queued plans, two in history.
 *
 * ```ts
 * const sim = defaultQServer();                        // as-is
 * const fast = defaultQServer({ runDurationMs: 500 }); // per-field override
 * ```
 *
 * Every scenario is a *function* returning a fresh simulator — unlike ophyd-sim's module-level
 * beamlines — so two stories or two tests can never share mutable queue state.
 */
export function defaultQServer(overrides: Partial<CreateQServerSimOptions> = {}): QServerSim {
    return createQServerSim({
        ...BASE_SCENARIO_OPTIONS,
        queue: defaultQueue,
        history: defaultHistory,
        environmentState: 'idle',
        ...overrides,
    });
}

/** Alias matching the naming used elsewhere for "make me the standard thing". */
export const createDefaultQServerSim = defaultQServer;
