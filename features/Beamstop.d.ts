export type BeamstopProps = {
    beamstopXName: string;
    beamstopYName: string;
    beamstopCurrentName: string;
    /**
     * Optional writable beam-energy PV. When provided, an energy control and a
     * live Energy-vs-Current plot are rendered. Selecting an energy shifts the
     * beam (via the DCM Bragg angle), changing the diode current.
     */
    beamstopEnergyName?: string;
    beamstopXIcon?: JSX.Element;
    beamstopYIcon?: JSX.Element;
    beamstopXTitle?: string;
    beamstopYTitle?: string;
    beamstopEnergyTitle?: string;
    enableBestOption?: boolean;
    stackVertical?: boolean;
};
export default function Beamstop({ beamstopXName, beamstopYName, beamstopCurrentName, beamstopEnergyName, beamstopXIcon, beamstopYIcon, beamstopXTitle, beamstopYTitle, beamstopEnergyTitle, enableBestOption, stackVertical, }: BeamstopProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Beamstop.d.ts.map