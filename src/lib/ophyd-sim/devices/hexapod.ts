import type { DeviceFactory, SimValue } from '../core/types';

export interface HexapodOptions {
    /** Device PV prefix (e.g. 'SYM:HEX01'). Defaults to 'SYM:HEX01'. */
    prefix?: string;
    /** Translation-axis velocity in mm/s. Defaults to 4. */
    translationVelocity?: number;
    /** Rotation-axis velocity in deg/s. Defaults to 2. */
    rotationVelocity?: number;
    /** Translation soft limits (mm). Defaults to [-10, 10]. */
    translationLimits?: [number, number];
    /** Rotation soft limits (deg). Defaults to [-5, 5]. */
    rotationLimits?: [number, number];
    /** Settle tolerance in axis units. Defaults to 1e-4. */
    epsilon?: number;
}

type Axis = 'tx' | 'ty' | 'tz' | 'rx' | 'ry' | 'rz';
const TRANSLATION_AXES: Axis[] = ['tx', 'ty', 'tz'];
const ROTATION_AXES: Axis[] = ['rx', 'ry', 'rz'];
const AXES: Axis[] = [...TRANSLATION_AXES, ...ROTATION_AXES];

const DEFAULT_PREFIX = 'SYM:HEX01';

const clamp = (value: number, [lower, upper]: [number, number]) =>
    Math.min(upper, Math.max(lower, value));

/**
 * Symetrie six-axis hexapod, modelled entirely as signals — the device has
 * explicit `_RBV` readbacks separate from its setpoints, so it does not map
 * cleanly onto the linear `motor()` (one setpoint ⇒ one readback). Instead each
 * axis owns a readback that animates toward a captured target, and the move is
 * gated by the shared `MOVE_PTP` command PV, mirroring the real controller.
 *
 * PVs, relative to `prefix` (matching hexapodUtils.ts):
 *  - `s_uto_{tx,ty,tz}_RBV`     — translation readbacks (mm), read-only
 *  - `s_uto_{rx,ry,rz}_RBV`     — rotation readbacks (deg), read-only
 *  - `MOVE_PTP:{Tx,Ty,Tz,Rx,Ry,Rz}` — per-axis setpoints (writable "goals")
 *  - `MOVE_PTP`                 — execute command: write 1 to move all axes to
 *                                 their setpoints; auto-returns to 0
 *  - `MOVE_PTP:MoveType`        — 0 = absolute, 1 = relative
 *  - `s_hexa:InPosition_RBV`    — 1 when settled/stopped, 0 while moving
 *  - `STOP`                     — write 1 to halt immediately; auto-returns to 0
 *
 * Writing a setpoint alone does nothing; motion only begins on the 0→1 edge of
 * `MOVE_PTP`, at which point targets are captured (absolute, or added to the
 * current readback when relative) and clamped to the axis limits.
 */
export function hexapod(opts: HexapodOptions = {}): DeviceFactory {
    return (reg) => {
        const prefix = opts.prefix ?? DEFAULT_PREFIX;
        const translationVelocity = opts.translationVelocity ?? 4;
        const rotationVelocity = opts.rotationVelocity ?? 2;
        const translationLimits = opts.translationLimits ?? [-10, 10];
        const rotationLimits = opts.rotationLimits ?? [-5, 5];
        const epsilon = opts.epsilon ?? 1e-4;

        const pv = (suffix: string) => `${prefix}:${suffix}`;
        const rbvPV = (axis: Axis) => pv(`s_uto_${axis}_RBV`);
        const setpointPV = (axis: Axis) => pv(`MOVE_PTP:${axis[0].toUpperCase()}${axis[1]}`);
        const executeAllPV = pv('MOVE_PTP');
        const inPositionPV = pv('s_hexa:InPosition_RBV');
        const stopPV = pv('STOP');
        const moveTypePV = pv('MOVE_PTP:MoveType');

        const axisConfig = (axis: Axis) => {
            const isRotation = ROTATION_AXES.includes(axis);
            return {
                units: isRotation ? 'deg' : 'mm',
                limits: isRotation ? rotationLimits : translationLimits,
                velocity: isRotation ? rotationVelocity : translationVelocity,
            };
        };

        // Seed readbacks + setpoints for every axis. Readbacks are read-only;
        // setpoints are writable goals the controller stages before executing.
        AXES.forEach((axis) => {
            const { units, limits } = axisConfig(axis);
            const [lower, upper] = limits;
            reg.seed(rbvPV(axis), 0, {
                units,
                lower_ctrl_limit: lower,
                upper_ctrl_limit: upper,
                read_access: true,
                write_access: false,
                precision: 4,
            });
            reg.seed(setpointPV(axis), 0, {
                units,
                lower_ctrl_limit: lower,
                upper_ctrl_limit: upper,
                read_access: true,
                write_access: true,
                precision: 4,
            });
        });

        reg.seed(executeAllPV, 0, { read_access: true, write_access: true });
        reg.seed(moveTypePV, 0, {
            read_access: true,
            write_access: true,
            enum_strs: ['Absolute', 'Relative'],
        });
        reg.seed(stopPV, 0, { read_access: true, write_access: true });
        // Starts settled (in position) at the all-zero home pose.
        reg.seed(inPositionPV, 1, {
            read_access: true,
            write_access: false,
            enum_strs: ['Moving', 'InPosition'],
        });

        // The pose each readback is currently animating toward. Equal to the
        // readbacks at rest, so no motion happens until MOVE_PTP captures targets.
        const targets: Record<Axis, number> = { tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0 };

        const asNumber = (value: SimValue | undefined) => Number(value ?? 0);

        // MOVE_PTP command: on the 0→1 edge, capture per-axis targets from the
        // staged setpoints (absolute) or offset from the current readback
        // (relative), clamp to limits, and begin moving. Return to 0 so the next
        // write re-triggers.
        reg.onSet(executeAllPV, (value) => {
            if (asNumber(value) !== 1) return;
            const relative = asNumber(reg.get(moveTypePV)) === 1;
            AXES.forEach((axis) => {
                const setpoint = asNumber(reg.get(setpointPV(axis)));
                const current = asNumber(reg.get(rbvPV(axis)));
                const raw = relative ? current + setpoint : setpoint;
                targets[axis] = clamp(raw, axisConfig(axis).limits);
            });
            reg.set(inPositionPV, 0);
            reg.set(executeAllPV, 0);
        });

        // STOP command: freeze every axis at its current readback and settle.
        reg.onSet(stopPV, (value) => {
            if (asNumber(value) !== 1) return;
            AXES.forEach((axis) => {
                targets[axis] = asNumber(reg.get(rbvPV(axis)));
            });
            reg.set(inPositionPV, 1);
            reg.set(stopPV, 0);
        });

        // Advance each readback toward its target at the axis velocity. When all
        // axes are within epsilon, snap and mark the hexapod in position.
        reg.onTick(({ dt }) => {
            let allSettled = true;
            AXES.forEach((axis) => {
                const target = targets[axis];
                const position = asNumber(reg.get(rbvPV(axis)));
                const distance = target - position;
                const absDistance = Math.abs(distance);
                if (absDistance < epsilon) {
                    if (position !== target) reg.set(rbvPV(axis), target);
                    return;
                }
                allSettled = false;
                const step = Math.min(absDistance, axisConfig(axis).velocity * dt);
                reg.set(rbvPV(axis), position + Math.sign(distance) * step);
            });
            if (allSettled && asNumber(reg.get(inPositionPV)) !== 1) {
                reg.set(inPositionPV, 1);
            }
        });
    };
}
