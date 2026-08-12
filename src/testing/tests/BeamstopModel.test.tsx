import { describe, it, expect } from 'vitest';
import { braggAngle } from '../../lib/ophyd-sim/generators/bragg';
import {
    beamstopCurrentModel,
    beamYAtEnergy,
    CENTER_X,
    CENTER_Y,
    PEAK_CURRENT,
    ENERGY_MIN_EV,
    ENERGY_MAX_EV,
    ENERGY_REF_EV,
} from '../../lib/ophyd-sim/scenarios/beamstopModel';

describe('braggAngle', () => {
    it('returns an angle in (0, π/2] for in-range energies', () => {
        const theta = braggAngle({ energyEV: ENERGY_REF_EV });
        expect(theta).toBeGreaterThan(0);
        expect(theta).toBeLessThanOrEqual(Math.PI / 2);
    });

    it('decreases as energy increases (higher energy → smaller angle)', () => {
        const low = braggAngle({ energyEV: ENERGY_MIN_EV });
        const high = braggAngle({ energyEV: ENERGY_MAX_EV });
        expect(high).toBeLessThan(low);
    });

    it('saturates at π/2 rather than NaN for energies below the crystal cutoff', () => {
        const theta = braggAngle({ energyEV: 1 });
        expect(Number.isNaN(theta)).toBe(false);
        expect(theta).toBeCloseTo(Math.PI / 2, 5);
    });
});

describe('beamYAtEnergy', () => {
    it('sits exactly at CENTER_Y at the reference energy', () => {
        expect(beamYAtEnergy(ENERGY_REF_EV)).toBeCloseTo(CENTER_Y, 10);
    });

    it('shifts monotonically with energy', () => {
        const ys = [ENERGY_MIN_EV, 3000, 4000, 5000, 6000, ENERGY_MAX_EV].map(beamYAtEnergy);
        const ascending = ys.every((v, i) => i === 0 || v >= ys[i - 1]);
        expect(ascending).toBe(true);
    });

    it('keeps the beam within motor travel [-10, 10] across the range', () => {
        for (let e = ENERGY_MIN_EV; e <= ENERGY_MAX_EV; e += 100) {
            const y = beamYAtEnergy(e);
            expect(y).toBeGreaterThanOrEqual(-10);
            expect(y).toBeLessThanOrEqual(10);
        }
    });
});

describe('beamstopCurrentModel', () => {
    it('peaks at PEAK_CURRENT when the stop sits on the energy-dependent beam', () => {
        const energyEV = ENERGY_REF_EV;
        const peak = beamstopCurrentModel({
            x: CENTER_X,
            y: beamYAtEnergy(energyEV),
            energyEV,
        });
        expect(peak).toBeCloseTo(PEAK_CURRENT, 6);
    });

    it('falls off as the stop moves away from the beam', () => {
        const energyEV = ENERGY_REF_EV;
        const onBeam = beamstopCurrentModel({ x: CENTER_X, y: beamYAtEnergy(energyEV), energyEV });
        const offBeam = beamstopCurrentModel({
            x: CENTER_X + 5,
            y: beamYAtEnergy(energyEV) + 5,
            energyEV,
        });
        expect(offBeam).toBeLessThan(onBeam);
    });

    it('changes with energy at a fixed beamstop position', () => {
        const atRef = beamstopCurrentModel({ x: CENTER_X, y: CENTER_Y, energyEV: ENERGY_REF_EV });
        const atMax = beamstopCurrentModel({ x: CENTER_X, y: CENTER_Y, energyEV: ENERGY_MAX_EV });
        // At the reference energy the beam is at CENTER_Y, so current is maximal;
        // shifting energy moves the beam off the stop and lowers the current.
        expect(atMax).toBeLessThan(atRef);
    });
});
