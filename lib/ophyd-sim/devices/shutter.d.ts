import { DeviceFactory } from '../core/types';
/** Default analog-output value (volts) that means the shutter is open. */
export declare const SHUTTER_OPEN_VALUE = 0;
/** Default analog-output value (volts) that means the shutter is closed. */
export declare const SHUTTER_CLOSED_VALUE = 5;
export interface ShutterOptions {
    /** PV name of the shutter analog output (e.g. "bl531:LJT4:1:AO0"). */
    name: string;
    /** Value that means open. Defaults to `SHUTTER_OPEN_VALUE` (0). */
    openValue?: number;
    /** Value that means closed. Defaults to `SHUTTER_CLOSED_VALUE` (5). */
    closedValue?: number;
    /** Initial state. Defaults to 'open'. */
    initial?: 'open' | 'closed';
}
/**
 * Beam shutter driven through a single analog-output PV, matching the real
 * `bl531:LJT4:1:AO0` LabJack channel the `<Shutter />` component controls.
 *
 * The PV is both command and readback: writing `closedValue` (5 V) blocks the
 * beam, `openValue` (0 V) lets it through. Any other value is neither, which
 * the UI surfaces as an unknown state.
 *
 * The shutter holds only its own value — downstream signals gate themselves by
 * listing this PV in their `dependsOn` and comparing against `openValue`,
 * mirroring how `IOC:bs` gates `I0` in the default beamline.
 */
export declare function shutter(opts: ShutterOptions): DeviceFactory;
//# sourceMappingURL=shutter.d.ts.map