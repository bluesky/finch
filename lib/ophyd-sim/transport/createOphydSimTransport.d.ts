import { OphydPVTransport } from '../../../api/ophyd/transport/types';
import { OphydSim } from '../core/types';
/**
 * Adapt an OphydSim instance to the OphydPVTransport interface, speaking the
 * existing PV-socket wire protocol.
 *
 * On `subscribe`, immediately emits a synthesized `meta` message so finch
 * shows the device as connected, then forwards every value change as a
 * value-update message. `set` writes to the sim. `unsubscribe` drops the
 * subscription. The transport reports `'open'` synchronously on first status
 * listener attach — there's no real handshake to wait for.
 *
 * Multiple subscribe messages for the same PV install independent listeners
 * (each gets its own value stream); unsubscribe drops the most recent
 * listener for that PV, matching how the existing hook expects to operate.
 */
export declare function createOphydSimTransport(sim: OphydSim): OphydPVTransport;
//# sourceMappingURL=createOphydSimTransport.d.ts.map