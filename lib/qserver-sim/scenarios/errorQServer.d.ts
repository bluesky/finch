import { QServerSim } from '../core/QServerSim';
import { CreateQServerSimOptions } from '../core/types';
/**
 * A failure already in history, and the next run armed to fail too.
 *
 * `startQueue()` followed by `advance(runDurationMs)` produces a failed result with a traceback,
 * the `'The plan failed'` console line the legacy UI watches for, and the item back on the front
 * of the queue. `failNextRun` is one-shot, so the retry then succeeds.
 */
export declare function errorQServer(overrides?: Partial<CreateQServerSimOptions>): QServerSim;
//# sourceMappingURL=errorQServer.d.ts.map