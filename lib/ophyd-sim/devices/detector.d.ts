import { DeviceFactory } from '../core/types';
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
export declare const OPACITY_SUFFIX = "image1:Opacity";
/** PV suffix carrying the image value mode (`'noisy' | 'image_file'`). */
export declare const MODE_SUFFIX = "image1:Mode";
/** PV suffix for an overlay's center-X (pixels). `index` is zero-based. */
export declare function overlayCenterXSuffix(index: number): string;
/** PV suffix for an overlay's center-Y (pixels). `index` is zero-based. */
export declare function overlayCenterYSuffix(index: number): string;
/**
 * Linearly map `value` from `from.in→to.in` onto `from.out→to.out`, clamping
 * the normalized position to [0, 1] so the result never leaves the output range.
 */
export declare function mapLinearClamped(value: number, from: ModulationPoint, to: ModulationPoint): number;
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
export declare function detector(config: DetectorConfig): DeviceFactory;
//# sourceMappingURL=detector.d.ts.map