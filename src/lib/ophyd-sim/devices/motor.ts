import type { DeviceFactory, PVMetadata } from '../core/types';

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
export function motor(opts: MotorOptions): DeviceFactory {
    return (reg) => {
        const setpointName = opts.name;
        const readbackName = opts.readbackName ?? `${opts.name}.RBV`;
        const movingName = opts.movingName ?? `${opts.name}.MOVN`;

        const velocity = opts.velocity ?? 1;
        const epsilon = opts.epsilon ?? 1e-4;
        const lower = opts.limits ? opts.limits[0] : null;
        const upper = opts.limits ? opts.limits[1] : null;
        const initial = opts.initialPosition ?? 0;

        const setpointMetadata: PVMetadata = {
            units: opts.units,
            lower_ctrl_limit: lower,
            upper_ctrl_limit: upper,
            read_access: true,
            write_access: true,
            precision: 4,
        };
        const readbackMetadata: PVMetadata = {
            units: opts.units,
            lower_ctrl_limit: lower,
            upper_ctrl_limit: upper,
            read_access: true,
            write_access: false,
            precision: 4,
        };
        const movingMetadata: PVMetadata = {
            read_access: true,
            write_access: false,
            enum_strs: ['Done', 'Moving'],
        };

        reg.seed(setpointName, initial, setpointMetadata);
        reg.seed(readbackName, initial, readbackMetadata);
        reg.seed(movingName, 0, movingMetadata);

        // Clamp setpoint writes to limits. Motor motion handler reads target
        // back via reg.get, so clamping has to update the stored value.
        reg.onSet(setpointName, (value) => {
            if (typeof value !== 'number') return;
            const clamped =
                lower !== null && upper !== null
                    ? Math.min(upper, Math.max(lower, value))
                    : lower !== null
                      ? Math.max(lower, value)
                      : upper !== null
                        ? Math.min(upper, value)
                        : value;
            if (clamped !== value) {
                // Re-issue the clamped value; onSet won't recurse because
                // state.set early-returns on equality.
                reg.set(setpointName, clamped);
            }
        });

        reg.onTick(({ dt }) => {
            const targetRaw = reg.get(setpointName);
            const positionRaw = reg.get(readbackName);
            if (typeof targetRaw !== 'number' || typeof positionRaw !== 'number') return;

            const distance = targetRaw - positionRaw;
            const absDistance = Math.abs(distance);

            if (absDistance < epsilon) {
                if (positionRaw !== targetRaw) reg.set(readbackName, targetRaw);
                if (reg.get(movingName) !== 0) reg.set(movingName, 0);
                return;
            }

            if (reg.get(movingName) !== 1) reg.set(movingName, 1);

            const step = Math.min(absDistance, velocity * dt);
            const nextPosition = positionRaw + Math.sign(distance) * step;
            reg.set(readbackName, nextPosition);
        });
    };
}
