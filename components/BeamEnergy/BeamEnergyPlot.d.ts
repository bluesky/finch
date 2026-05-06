type BeamEnergyPlotProps = {
    /** Current beam energy in eV. When NaN or undefined, the plot waits for data. */
    currentValueEV?: number;
    /** Label shown on the x-axis. Defaults to 'Beam Energy'. */
    label?: string;
};
export default function BeamEnergyPlot({ currentValueEV, label: _label }: BeamEnergyPlotProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BeamEnergyPlot.d.ts.map