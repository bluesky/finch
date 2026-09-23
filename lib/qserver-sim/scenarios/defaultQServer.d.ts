import { QServerSim } from '../core/QServerSim';
import { CreateQServerSimOptions } from '../core/types';
/**
 * Defaults shared by every scenario.
 *
 * `environmentOpenMs: 0` makes `openEnvironment()` land synchronously, so a story or test that
 * opens the environment does not have to advance time first. Raise it when you want to see the
 * `creating_environment` state on screen.
 */
export declare const BASE_SCENARIO_OPTIONS: CreateQServerSimOptions;
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
export declare function defaultQServer(overrides?: Partial<CreateQServerSimOptions>): QServerSim;
/** Alias matching the naming used elsewhere for "make me the standard thing". */
export declare const createDefaultQServerSim: typeof defaultQServer;
//# sourceMappingURL=defaultQServer.d.ts.map