export type SampleStageProps = {
    /** Sample X motor setpoint PV (mm). */
    sampleXName: string;
    /** Sample Y motor setpoint PV (mm). */
    sampleYName: string;
    sampleXTitle?: string;
    sampleYTitle?: string;
    /** Lay the two axis controls out side by side instead of stacked. */
    stackVertical?: boolean;
};
/**
 * X/Y control for the sample-holder stage. Wires two DeviceControllerBox cards
 * to the sample motors and drives the holder graphic in <EndstationDisplay />,
 * which tracks the same PVs' readbacks. Mirrors the motor wiring in
 * [src/features/Beamstop.tsx].
 */
export default function SampleStage({ sampleXName, sampleYName, sampleXTitle, sampleYTitle, stackVertical, }: SampleStageProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=SampleStage.d.ts.map