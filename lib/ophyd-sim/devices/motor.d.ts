import { DeviceFactory } from '../core/types';
export interface MotorOptions {
    /** Setpoint PV name (e.g. "IOC:m1"). */
    name: string;
    /** Readback PV name. Defaults to `${name}.RBV`. */
    readbackName?: string;
    /** Moving-flag PV name (1 while in motion, 0 otherwise). Defaults to `${name}.MOVN`. */
    movingName?: string;
    initialPosition?: number;
    /** Velocity in units/second. */
    velocity?: number;
    /** Soft control limits applied to setpoint writes. */
    limits?: [number, number];
    units?: string;
    /** Within how close (units) the readback must be to the setpoint to settle. */
    epsilon?: number;
}
/**
 * Linear-velocity motor.
 *
 * Exposes three PVs sharing one motion state:
 *  - `name`            — setpoint (writable; clamps to limits)
 *  - `name.RBV` (default) — readback, animates toward setpoint
 *  - `name.MOVN` (default) — 1 while moving, 0 otherwise
 *
 * Writes to the setpoint clamp into `[low, high]`, set MOVN=1, and start the
 * readback advancing by `velocity * dt` per tick toward the target. When
 * within `epsilon`, readback snaps to setpoint and MOVN clears.
 */
export declare function motor(opts: MotorOptions): DeviceFactory;
//# sourceMappingURL=motor.d.ts.map