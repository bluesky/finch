import { QServerSim } from '../core/QServerSim';
import { CreateQServerSimOptions } from '../core/types';
/**
 * A plan already executing, with two more queued behind it.
 *
 * The running slot is seeded by performing the real dequeue at construction, so this state is
 * provably reachable rather than hand-assembled. `advance(runDurationMs)` completes the current
 * plan and starts the next.
 */
export declare function runningQServer(overrides?: Partial<CreateQServerSimOptions>): QServerSim;
//# sourceMappingURL=runningQServer.d.ts.map