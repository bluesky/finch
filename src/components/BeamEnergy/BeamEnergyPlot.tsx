import SignalMonitorPlotDevice from '@/components/SignalMonitorPlotDevice';

type BeamEnergyPlotProps = {
    /** Current beam energy in eV. When NaN or undefined, the plot waits for data. */
    currentValueEV?: number;
    /** Label shown on the x-axis. Defaults to 'Beam Energy'. */
    label?: string;
};

export default function BeamEnergyPlot({
    currentValueEV,
    label: _label = 'Beam Energy',
}: BeamEnergyPlotProps) {
    const isValid = currentValueEV !== undefined && !isNaN(currentValueEV);
    const device = isValid ? { value: currentValueEV, units: 'eV' } : null;

    return <SignalMonitorPlotDevice device={device} className="max-h-52 -mx-2 py-0 my-0" />;
}
