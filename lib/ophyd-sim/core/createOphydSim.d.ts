import { CreateOphydSimOptions, OphydSim } from './types';
/**
 * Build a simulator instance. Wires up shared state, a dependency graph for
 * derived signals, and a tick scheduler for periodic/motor updates. Devices
 * register themselves via the factory functions passed in `options.devices`.
 *
 * The simulator does not start ticking until `start()` is called — typically
 * by OphydSimProvider on mount.
 */
export declare function createOphydSim(options: CreateOphydSimOptions): OphydSim;
//# sourceMappingURL=createOphydSim.d.ts.map