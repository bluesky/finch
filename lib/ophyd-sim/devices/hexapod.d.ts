import { DeviceFactory } from '../core/types';
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
export declare function hexapod(opts?: HexapodOptions): DeviceFactory;
//# sourceMappingURL=hexapod.d.ts.map