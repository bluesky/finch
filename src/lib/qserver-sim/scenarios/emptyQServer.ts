import { createQServerSim, type QServerSim } from '../core/QServerSim';
import type { CreateQServerSimOptions } from '../core/types';
import { BASE_SCENARIO_OPTIONS } from './defaultQServer';

/**
 * A closed environment with nothing queued and no history — the cold-start state.
 *
 * The plan and device catalogs are still populated, matching a real server, which answers
 * `plans/allowed` from its cached list even with the worker environment closed. Use this to
 * exercise empty states and the "open the environment first" refusals.
 */
export function emptyQServer(overrides: Partial<CreateQServerSimOptions> = {}): QServerSim {
    return createQServerSim({
        ...BASE_SCENARIO_OPTIONS,
        queue: [],
        history: [],
        environmentState: 'closed',
        ...overrides,
    });
}
