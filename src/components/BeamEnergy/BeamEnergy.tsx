import useBeamEnergy from "./hooks/useBeamEnergy";
import BeamEnergyHeader from "./BeamEnergyHeader";
import BeamEnergyCurrentValue from "./BeamEnergyCurrentValue";
import BeamEnergyController from "./BeamEnergyController";
import BeamEnergyPlot from "./BeamEnergyPlot";
import BeamEnergyAbout from "./BeamEnergyAbout";

export type BeamEnergyProps = {
    pv?: string,
    title?: string,
    thetaOffsetDeg?: number
    wsUrl?: string
}
export default function BeamEnergy({pv="bl531_xps1:mono_angle_deg", title="Beam Energy", thetaOffsetDeg, wsUrl}:BeamEnergyProps) {
    const { 
        currentValueEV,
        currentValueDegrees,
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
    } = useBeamEnergy({pv, thetaOffsetDeg, wsUrl});
    return (
        <section className="flex flex-col w-fit h-fit bg-slate-200 rounded-lg shadow-lg p-4 min-w-[26rem]">
            <BeamEnergyHeader title={title} pv={pv} showController={showController} showPlot={showPlot} showAbout={showAbout} isLocked={isLocked} handleToggleLock={handleToggleLock} handleToggleController={handleToggleController} handleTogglePlot={handleTogglePlot} handleToggleAbout={handleToggleAbout} />
            <BeamEnergyCurrentValue currentValueDegrees={currentValueDegrees} currentValueEV={currentValueEV} />
            {showController && <BeamEnergyController currentValueDegrees={currentValueDegrees} onAbsoluteMove={handleAbsoluteMove} onRelativeMove={handleRelativeMove} onStop={handleStop} isLocked={isLocked} />}
            {showPlot && <BeamEnergyPlot />}
            {showAbout && <BeamEnergyAbout device={device}/>}
        </section>

    )
}