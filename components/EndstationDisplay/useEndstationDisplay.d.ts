/** Which beam graphic to show: blocked stops short of the sample, unblocked
 *  reaches through. */
export type LightLayer = 'blocked' | 'unblocked';
export type UseEndstationDisplayOptions = {
    /** Shutter analog-output PV. Defaults to the `beamstopBeamline` shutter. */
    shutterPV?: string;
    /** PV value that means the shutter is open (beam passes). Defaults to 0. */
    shutterOpenValue?: number;
    /** Beamstop X readback PV (mm). Defaults to the `beamstopBeamline` motor. */
    beamstopXPV?: string;
    /** Beamstop Y readback PV (mm). Defaults to the `beamstopBeamline` motor. */
    beamstopYPV?: string;
    /** SVG units the beamstop layer travels per mm of motor motion. Calibrate
     *  visually; defaults to 2. */
    pxPerMm?: number;
    /** SVG units the shutter layer slides out of the beam when open. Calibrate
     *  visually; defaults to 24. */
    shutterOpenOffset?: number;
};
export type EndstationDisplayState = {
    /** Beam graphic to render for layer 1. */
    lightLayer: LightLayer;
    /** Whether the mono-light layer (layer 4) is visible — only when unblocked. */
    monoVisible: boolean;
    /** CSS `transform` for the shutter layer. */
    shutterTransform: string;
    /** CSS `transform` for the beamstop layer. */
    beamstopTransform: string;
};
/**
 * Derive the visual state of the endstation from live ophyd device values.
 *
 * Subscribes to the shutter and beamstop readback PVs and maps them to the
 * layer state consumed by EndstationDisplay. All logic lives here; the
 * component only renders. Mirrors the value-parsing pattern in
 * [src/components/Shutter.tsx].
 */
export default function useEndstationDisplay({ shutterPV, shutterOpenValue, beamstopXPV, beamstopYPV, pxPerMm, shutterOpenOffset, }?: UseEndstationDisplayOptions): EndstationDisplayState;
//# sourceMappingURL=useEndstationDisplay.d.ts.map