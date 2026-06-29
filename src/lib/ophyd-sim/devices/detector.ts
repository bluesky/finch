import type { DeviceFactory, PVMetadata } from '../core/types';

/** A point mapping an input value (e.g. an energy in eV) to an output (e.g. opacity). */
export interface ModulationPoint {
    in: number;
    out: number;
}

/**
 * Declarative rule by which another device's PV adjusts the detector image.
 * For now the only `effect` is `'opacity'`. The output is a linear interpolation
 * from `from` to `to`, clamped to that output range.
 */
export interface DetectorModulation {
    /** PV name whose value drives this effect (e.g. the beam-energy PV). */
    source: string;
    effect: 'opacity';
    from: ModulationPoint;
    to: ModulationPoint;
}

export interface DetectorImageConfig {
    /** Image source: random noise, or a static image file. */
    mode: 'noisy' | 'image_file';
    sizeX: number;
    sizeY: number;
    /** URL of the image to render when `mode === 'image_file'`. */
    file?: string;
}

/**
 * A detector defined declaratively (typically loaded from a JSON file). The
 * `prefix` becomes the PV prefix (e.g. `'13SIM1'`) under which the standard
 * Area-Detector PVs are seeded.
 */
export interface DetectorConfig {
    prefix: string;
    image: DetectorImageConfig;
    modulations?: DetectorModulation[];
}

/** PV suffix carrying the derived image opacity (0–1), under `<prefix>:`. */
export const OPACITY_SUFFIX = 'image1:Opacity';
/** PV suffix carrying the image value mode (`'noisy' | 'image_file'`). */
export const MODE_SUFFIX = 'image1:Mode';

/**
 * Linearly map `value` from `from.in→to.in` onto `from.out→to.out`, clamping
 * the normalized position to [0, 1] so the result never leaves the output range.
 */
export function mapLinearClamped(value: number, from: ModulationPoint, to: ModulationPoint): number {
    const span = to.in - from.in;
    const t = span === 0 ? 0 : (value - from.in) / span;
    const clamped = Math.max(0, Math.min(1, t));
    return from.out + clamped * (to.out - from.out);
}

/**
 * Simulated area detector.
 *
 * Unlike `motor`/`signal` (single-value devices), a detector seeds a *cluster*
 * of PVs from one `prefix` so a caller passing `'13SIM1'` can immediately read
 * the standard camera PVs (`cam1:SizeX`, `cam1:SizeY`, `cam1:MinX`, `cam1:MinY`,
 * `cam1:ColorMode`, `cam1:DataType`, `cam1:Acquire`) plus the image `value` mode
 * (`image1:Mode`).
 *
 * The image itself is not a PV (it streams over the camera socket), but its
 * scalar parameters are. Each `modulation` registers a derived PV that other
 * devices drive — e.g. beam energy → `image1:Opacity` — which the camera socket
 * reads per frame to dim the rendered image.
 */
export function detector(config: DetectorConfig): DeviceFactory {
    return (reg) => {
        const { prefix, image } = config;
        const pv = (suffix: string): string => `${prefix}:${suffix}`;

        const pixelMeta: PVMetadata = {
            units: 'px',
            read_access: true,
            write_access: true,
            precision: 0,
        };

        reg.seed(pv('cam1:SizeX'), image.sizeX, pixelMeta);
        reg.seed(pv('cam1:SizeY'), image.sizeY, pixelMeta);
        reg.seed(pv('cam1:MinX'), 0, pixelMeta);
        reg.seed(pv('cam1:MinY'), 0, pixelMeta);
        reg.seed(pv('cam1:ColorMode'), 0, {
            read_access: true,
            write_access: true,
            enum_strs: ['Mono', 'RGB1'],
        });
        reg.seed(pv('cam1:DataType'), 1, {
            read_access: true,
            write_access: true,
            enum_strs: ['Int8', 'UInt8', 'Int16', 'UInt16', 'Int32', 'UInt32', 'Float32', 'Float64'],
        });
        reg.seed(pv('cam1:Acquire'), 0, {
            read_access: true,
            write_access: true,
            enum_strs: ['Done', 'Acquire'],
        });
        reg.seed(pv(MODE_SUFFIX), image.mode, {
            read_access: true,
            write_access: true,
            enum_strs: ['noisy', 'image_file'],
        });

        for (const mod of config.modulations ?? []) {
            if (mod.effect === 'opacity') {
                const { from, to } = mod;
                reg.registerDerived(pv(OPACITY_SUFFIX), [mod.source], ({ get }) =>
                    mapLinearClamped(get.number(mod.source), from, to),
                );
            }
        }
    };
}
