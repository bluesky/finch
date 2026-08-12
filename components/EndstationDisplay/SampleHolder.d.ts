export type SampleHolderProps = {
    /** Sample X readback PV (mm). Defaults to the `beamstopBeamline` motor. */
    sampleXPV?: string;
    /** Sample Y readback PV (mm). Defaults to the `beamstopBeamline` motor. */
    sampleYPV?: string;
    /** SVG units the holder travels per mm of motor motion. Calibrate visually;
     *  defaults to 2. */
    pxPerMm?: number;
};
/**
 * Sample-holder graphic that tracks its X/Y motor readbacks. Subscribes to the
 * sample stage PVs and slides the holder proportionally across the endstation
 * canvas. Mirrors the beamstop tracking in [useEndstationDisplay]; render it as
 * a stacked layer inside [EndstationDisplay].
 */
export default function SampleHolder({ sampleXPV, sampleYPV, pxPerMm, }?: SampleHolderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SampleHolder.d.ts.map