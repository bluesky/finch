type BeamEnergyCurrentValueProps = {
    currentValueDegrees?: number;
    currentValueEV?: number;
}
export default function BeamEnergyCurrentValue({ currentValueDegrees, currentValueEV }: BeamEnergyCurrentValueProps) {
    const formattedEnergy = isNaN(currentValueEV!) ? "N/A" : currentValueEV!.toFixed(1);
    const formattedDegrees = isNaN(currentValueDegrees!) ? "N/A" : currentValueDegrees!.toFixed(2);
    return (
        <div className="w-full flex flex-col items-center mt-4">
            <p className="text-black text-3xl">{formattedEnergy} eV</p>
            <p className="text-slate-500 font-light">{formattedDegrees}°</p>
        </div>
    )
}
