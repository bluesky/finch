import useBeamEnergyOphyd from "./hooks/useBeamEnergyOphyd";
import BeamEnergyHeader from "./BeamEnergyHeader";
import BeamEnergyCurrentValue from "./BeamEnergyCurrentValue";
import BeamEnergyController from "./BeamEnergyController";
import BeamEnergyPlot from "./BeamEnergyPlot";
import BeamEnergyAbout from "./BeamEnergyAbout";

export type BeamEnergyOphydProps = {
    deviceName?: string,
    title?: string,
    thetaOffsetDeg?: number
    wsUrl?: string
}
export default function BeamEnergyOphyd({deviceName="mono", title="Beam Energy", thetaOffsetDeg, wsUrl}:BeamEnergyOphydProps) {
    const { 
        currentValueEV,
        handleAbsoluteMove,
        handleRelativeMove,
        handleStop,
        showController,
        showPlot,
        showAbout,
        isLocked,
        handleToggleLock,
        handleToggleController,
        handleTogglePlot,
        handleToggleAbout,
        device
    } = useBeamEnergyOphyd({deviceName, wsUrl});
    return (
        <section className="flex flex-col w-fit h-fit bg-slate-200 rounded-lg shadow-lg p-4 min-w-[26rem]">
            <BeamEnergyHeader title={title} pv={deviceName} showController={showController} showPlot={showPlot} showAbout={showAbout} isLocked={isLocked} handleToggleLock={handleToggleLock} handleToggleController={handleToggleController} handleTogglePlot={handleTogglePlot} handleToggleAbout={handleToggleAbout} />
            <BeamEnergyCurrentValue currentValueEV={currentValueEV} />
            {showController && <BeamEnergyController onAbsoluteMove={handleAbsoluteMove} onRelativeMove={handleRelativeMove} onStop={handleStop} isLocked={isLocked} />}
            {showPlot && <BeamEnergyPlot />}
            {showAbout && <BeamEnergyAbout device={device}/>}
        </section>

    )
}