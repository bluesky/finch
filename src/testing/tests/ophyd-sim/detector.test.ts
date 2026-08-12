import { describe, it, expect } from 'vitest';
import { createOphydSim } from '../../../lib/ophyd-sim/core/createOphydSim';
import { signal } from '../../../lib/ophyd-sim/devices/signal';
import {
    detector,
    mapLinearClamped,
    type DetectorConfig,
} from '../../../lib/ophyd-sim/devices/detector';
import { ENERGY_PV } from '../../../lib/ophyd-sim/scenarios/beamstopModel';
import simDetectorConfig from '../../../lib/ophyd-sim/scenarios/simDetector.json';

const config: DetectorConfig = {
    prefix: '13SIM1',
    image: { mode: 'noisy', sizeX: 640, sizeY: 480 },
    modulations: [
        {
            source: ENERGY_PV,
            effect: 'opacity',
            from: { in: 2000, out: 0.1 },
            to: { in: 7000, out: 1.0 },
        },
    ],
};

function makeSim(detectorConfig: DetectorConfig = config) {
    return createOphydSim({
        devices: [
            signal({ name: ENERGY_PV, initialValue: 4500, writeAccess: true }),
            detector(detectorConfig),
        ],
    });
}

describe('detector', () => {
    it('seeds the standard camera PVs under the prefix', () => {
        const sim = makeSim();

        expect(sim.get('13SIM1:cam1:SizeX')).toBe(640);
        expect(sim.get('13SIM1:cam1:SizeY')).toBe(480);
        expect(sim.get('13SIM1:cam1:MinX')).toBe(0);
        expect(sim.get('13SIM1:cam1:MinY')).toBe(0);
        expect(sim.get('13SIM1:cam1:ColorMode')).toBe(0);
        expect(sim.get('13SIM1:cam1:DataType')).toBe(1);
        expect(sim.get('13SIM1:cam1:Acquire')).toBe(0);
    });

    it('exposes enum metadata for ColorMode and the Acquire flag', () => {
        const sim = makeSim();
        expect(sim.metadata('13SIM1:cam1:ColorMode')?.enum_strs).toEqual(['Mono', 'RGB1']);
        expect(sim.metadata('13SIM1:cam1:Acquire')?.enum_strs).toEqual(['Done', 'Acquire']);
        expect(sim.metadata('13SIM1:cam1:SizeX')?.units).toBe('px');
    });

    it('seeds the image value mode from config', () => {
        expect(makeSim().get('13SIM1:image1:Mode')).toBe('noisy');
        const imageSim = makeSim({ ...config, image: { ...config.image, mode: 'image_file' } });
        expect(imageSim.get('13SIM1:image1:Mode')).toBe('image_file');
    });

    it('derives image opacity from the energy modulation and tracks changes', () => {
        const sim = makeSim();

        // Initial energy 4500 → halfway → 0.1 + 0.5 * 0.9 = 0.55.
        expect(sim.get('13SIM1:image1:Opacity')).toBeCloseTo(0.55, 6);

        sim.set(ENERGY_PV, 7000);
        expect(sim.get('13SIM1:image1:Opacity')).toBeCloseTo(1.0, 6);

        sim.set(ENERGY_PV, 2000);
        expect(sim.get('13SIM1:image1:Opacity')).toBeCloseTo(0.1, 6);
    });

    it('clamps opacity outside the modulation input range', () => {
        const sim = makeSim();

        sim.set(ENERGY_PV, 100000);
        expect(sim.get('13SIM1:image1:Opacity')).toBeCloseTo(1.0, 6);

        sim.set(ENERGY_PV, 0);
        expect(sim.get('13SIM1:image1:Opacity')).toBeCloseTo(0.1, 6);
    });

    it('omits the opacity PV when there are no modulations', () => {
        const sim = makeSim({ ...config, modulations: [] });
        expect(sim.get('13SIM1:image1:Opacity')).toBeUndefined();
    });

    it('seeds overlay center PVs and binds them to a source PV', () => {
        const overlayConfig: DetectorConfig = {
            prefix: '13SIM1',
            image: {
                mode: 'image_file',
                sizeX: 512,
                sizeY: 512,
                file: '/base.png',
                overlays: [
                    {
                        file: '/dot.png',
                        width: 48,
                        height: 48,
                        x: 256,
                        y: 256,
                        positionX: {
                            source: 'bl531_xps2:beamstop_x_mm.RBV',
                            from: { in: -10, out: 0 },
                            to: { in: 10, out: 512 },
                        },
                    },
                ],
            },
        };
        const sim = createOphydSim({
            devices: [
                signal({
                    name: 'bl531_xps2:beamstop_x_mm.RBV',
                    initialValue: 0,
                    writeAccess: true,
                }),
                detector(overlayConfig),
            ],
        });

        // Bound X: 0 mm maps to the canvas center; the unbound Y keeps its static seed.
        expect(sim.get('13SIM1:image1:Overlay1:CenterX')).toBeCloseTo(256, 6);
        expect(sim.get('13SIM1:image1:Overlay1:CenterY')).toBe(256);

        // Moving the source PV drives the bound coordinate (clamped to the px range).
        sim.set('bl531_xps2:beamstop_x_mm.RBV', 10);
        expect(sim.get('13SIM1:image1:Overlay1:CenterX')).toBeCloseTo(512, 6);
        sim.set('bl531_xps2:beamstop_x_mm.RBV', 100);
        expect(sim.get('13SIM1:image1:Overlay1:CenterX')).toBeCloseTo(512, 6);
    });
});

describe('simDetector.json overlay', () => {
    it('ties the overlay center to the beamstop motor readbacks', () => {
        const json = simDetectorConfig as DetectorConfig;
        const overlay = json.image.overlays?.[0];
        expect(overlay?.positionX?.source).toBe('bl531_xps2:beamstop_x_mm.RBV');
        expect(overlay?.positionY?.source).toBe('bl531_xps2:beamstop_y_mm.RBV');
    });
});

describe('simDetector.json', () => {
    it('modulation source matches the sim energy PV', () => {
        const json = simDetectorConfig as DetectorConfig;
        expect(json.modulations?.[0]?.source).toBe(ENERGY_PV);
    });

    it('maps the documented energy → opacity endpoints', () => {
        const json = simDetectorConfig as DetectorConfig;
        const mod = json.modulations![0];
        expect(mapLinearClamped(7000, mod.from, mod.to)).toBeCloseTo(1.0, 6);
        expect(mapLinearClamped(2000, mod.from, mod.to)).toBeCloseTo(0.1, 6);
    });
});
