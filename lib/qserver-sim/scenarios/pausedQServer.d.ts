import { QServerSim } from '../core/QServerSim';
import { CreateQServerSimOptions } from '../core/types';
/**
 * A paused plan, one third of the way through.
 *
 * The only scenario where `resume`, `stopRun`, `abortRun` and `haltRun` succeed — every one of
 * them requires a paused Run Engine, so this is the setup for exercising those buttons.
 */
export declare function pausedQServer(overrides?: Partial<CreateQServerSimOptions>): QServerSim;
//# sourceMappingURL=pausedQServer.d.ts.map