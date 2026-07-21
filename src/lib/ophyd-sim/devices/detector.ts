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

/**
 * Live binding of one overlay coordinate (center X or Y, in pixels) to a source
 * PV. The source value is linearly mapped from `from.in→to.in` onto the pixel
 * range `from.out→to.out`, clamped to that range — identical math to an opacity
 * modulation, but the output is a pixel coordinate rather than 0–1.
 */
export interface AxisBinding {
    /** PV name whose value drives this coordinate (e.g. a beamstop motor RBV). */
    source: string;
    from: ModulationPoint;
    to: ModulationPoint;
}

/**
 * An image layer drawn on top of the base image. Positioned by its center so a
 * marker (e.g. a beamstop dot) sits where you expect. The center defaults to the
 * static `x`/`y`; pass `positionX`/`positionY` to drive it from a live PV.
 */
export interface DetectorOverlay {
    /** URL of the overlay image. */
    file: string;
    /** Render size in pixels. */
    width: number;
    height: number;
    /** Center position in pixels (initial value; also the fallback if unbound). */
    x: number;
    y: number;
    /** Bind the center X to a source PV. */
    positionX?: AxisBinding;
    /** Bind the center Y to a source PV. */
    positionY?: AxisBinding;
}

export interface DetectorImageConfig {
    /** Image source: random noise, or a static image file. */
    mode: 'noisy' | 'image_file';
    sizeX: number;
    sizeY: number;
    /** URL of the base (bottom) image to render when `mode === 'image_file'`. */
    file?: string;
    /**
     * URLs of base images to cycle through, one per emitted frame (round-robin),
     * when `mode === 'image_file'`. Takes precedence over `file`; use a single
     * static base via `file` or a one-element `files`. Lets the stream animate
     * through a set of frames (e.g. a captured diffraction sequence).
     */
    files?: string[];
    /** Image layers drawn over the base, in order (`image_file` mode only). */
    overlays?: DetectorOverlay[];
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

/** PV suffix for an overlay's center-X (pixels). `index` is zero-based. */
export function overlayCenterXSuffix(index: number): string {
    return `image1:Overlay${index + 1}:CenterX`;
}
/** PV suffix for an overlay's center-Y (pixels). `index` is zero-based. */
export function overlayCenterYSuffix(index: number): string {
    return `image1:Overlay${index + 1}:CenterY`;
}

/**
 * Linearly map `value` from `from.in→to.in` onto `from.out→to.out`, clamping
 * the normalized position to [0, 1] so the result never leaves the output range.
 */
export function mapLinearClamped(
    value: number,
    from: ModulationPoint,
    to: ModulationPoint,
): number {
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
            enum_strs: [
                'Int8',
                'UInt8',
                'Int16',
                'UInt16',
                'Int32',
                'UInt32',
                'Float32',
                'Float64',
            ],
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

        // Seed a pixel coordinate PV at `pixelPV`, then — if `binding` is given —
        // make it derived so it tracks the source PV (e.g. a beamstop motor). The
        // seed runs first so the PV always exists with pixel metadata even when
        // unbound; registerDerived overwrites the value but preserves metadata.
        const bindAxis = (pixelPV: string, fallback: number, binding?: AxisBinding): void => {
            reg.seed(pixelPV, fallback, pixelMeta);
            if (binding) {
                const { source, from, to } = binding;
                reg.registerDerived(pixelPV, [source], ({ get }) =>
                    mapLinearClamped(get.number(source), from, to),
                );
            }
        };

        (image.overlays ?? []).forEach((overlay, i) => {
            bindAxis(pv(overlayCenterXSuffix(i)), overlay.x, overlay.positionX);
            bindAxis(pv(overlayCenterYSuffix(i)), overlay.y, overlay.positionY);
        });
    };
}
