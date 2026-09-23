import { QServerSim } from '../core/QServerSim';
import { CreateQServerSimOptions } from '../core/types';
/**
 * A closed environment with nothing queued and no history — the cold-start state.
 *
 * The plan and device catalogs are still populated, matching a real server, which answers
 * `plans/allowed` from its cached list even with the worker environment closed. Use this to
 * exercise empty states and the "open the environment first" refusals.
 */
export declare function emptyQServer(overrides?: Partial<CreateQServerSimOptions>): QServerSim;
//# sourceMappingURL=emptyQServer.d.ts.map