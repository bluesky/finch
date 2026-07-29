import { describe, it, expect } from 'vitest';
import { createOphydSim } from '../../../lib/ophyd-sim/core/createOphydSim';
import { hexapod } from '../../../lib/ophyd-sim/devices/hexapod';

const P = 'SYM:HEX01';
const rbv = (axis: string) => `${P}:s_uto_${axis}_RBV`;
const setpoint = (Axis: string) => `${P}:MOVE_PTP:${Axis}`;
const EXECUTE = `${P}:MOVE_PTP`;
const MOVE_TYPE = `${P}:MOVE_PTP:MoveType`;
const IN_POSITION = `${P}:s_hexa:InPosition_RBV`;
const STOP = `${P}:STOP`;

const makeSim = () => createOphydSim({ devices: [hexapod({ prefix: P })] });

/** Run enough simulated time for any in-range move to settle. */
const settle = (sim: ReturnType<typeof makeSim>) => {
    for (let i = 0; i < 300; i++) sim.advance(50);
};

describe('hexapod', () => {
    it('seeds all six axes at the zero home pose, in position', () => {
        const sim = makeSim();
        for (const axis of ['tx', 'ty', 'tz', 'rx', 'ry', 'rz']) {
            expect(sim.get(rbv(axis))).toBe(0);
        }
        expect(sim.get(IN_POSITION)).toBe(1);
    });

    it('exposes translation axes in mm and rotation axes in deg with their limits', () => {
        const sim = makeSim();
        const tx = sim.metadata(rbv('tx'));
        expect(tx?.units).toBe('mm');
        expect(tx?.lower_ctrl_limit).toBe(-10);
        expect(tx?.upper_ctrl_limit).toBe(10);

        const rx = sim.metadata(rbv('rx'));
        expect(rx?.units).toBe('deg');
        expect(rx?.lower_ctrl_limit).toBe(-5);
        expect(rx?.upper_ctrl_limit).toBe(5);
    });

    it('does not move until MOVE_PTP is executed', () => {
        const sim = makeSim();
        sim.set(setpoint('Tx'), 5);
        sim.advance(500);
        expect(sim.get(rbv('tx'))).toBe(0);
    });

    it('moves readbacks to the staged setpoints on execute, then settles', () => {
        const sim = makeSim();
        sim.set(setpoint('Tx'), 5);
        sim.set(setpoint('Rx'), 3);

        sim.set(EXECUTE, 1);
        // The command PV is momentary — it returns to 0 so the next write re-triggers.
        expect(sim.get(EXECUTE)).toBe(0);
        expect(sim.get(IN_POSITION)).toBe(0);

        settle(sim);
        expect(sim.get(rbv('tx'))).toBeCloseTo(5, 3);
        expect(sim.get(rbv('rx'))).toBeCloseTo(3, 3);
        expect(sim.get(IN_POSITION)).toBe(1);
    });

    it('adds to the current readback when MoveType is relative', () => {
        const sim = makeSim();
        sim.set(setpoint('Tx'), 4);
        sim.set(EXECUTE, 1);
        settle(sim);
        expect(sim.get(rbv('tx'))).toBeCloseTo(4, 3);

        sim.set(MOVE_TYPE, 1); // relative
        sim.set(setpoint('Tx'), 3);
        sim.set(EXECUTE, 1);
        settle(sim);
        expect(sim.get(rbv('tx'))).toBeCloseTo(7, 3);
    });

    it('clamps captured targets to the axis limits', () => {
        const sim = makeSim();
        sim.set(setpoint('Tx'), 999);
        sim.set(setpoint('Rx'), -999);
        sim.set(EXECUTE, 1);
        settle(sim);
        expect(sim.get(rbv('tx'))).toBeCloseTo(10, 3);
        expect(sim.get(rbv('rx'))).toBeCloseTo(-5, 3);
    });

    it('halts motion where it is when STOP is written', () => {
        const sim = makeSim();
        sim.set(setpoint('Tx'), 10);
        sim.set(EXECUTE, 1);
        sim.advance(200); // partial travel: 4 mm/s * 0.2s = 0.8 mm

        const mid = sim.get(rbv('tx')) as number;
        expect(mid).toBeGreaterThan(0);
        expect(mid).toBeLessThan(10);

        sim.set(STOP, 1);
        expect(sim.get(STOP)).toBe(0); // momentary
        expect(sim.get(IN_POSITION)).toBe(1);

        settle(sim);
        expect(sim.get(rbv('tx'))).toBeCloseTo(mid, 3);
    });
});
