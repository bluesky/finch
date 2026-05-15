import useBeamEnergyPV from './hooks/useBeamEnergyPV';
import BeamEnergyHeader from './BeamEnergyHeader';
import BeamEnergyCurrentValue from './BeamEnergyCurrentValue';
import BeamEnergyController from './BeamEnergyController';
import BeamEnergyPlot from './BeamEnergyPlot';
import BeamEnergyAbout from './BeamEnergyAbout';
import BeamEnergyTitleIcon from './BeamEnergyTitleIcon';
import { cn } from '@/lib/utils';

export type BeamEnergyProps = {
    /** EPICS PV for the monochromator angle (RBV). Defaults to 'bl531_xps1:mono_angle_deg'. */
    pv?: string;
    /** Display title shown in the widget header. Defaults to 'Beam Energy'. */
    title?: string;
    /** Angular offset in degrees applied when converting mono angle to beam energy. */
    thetaOffsetDeg?: number;
    /** WebSocket server URL. When omitted, uses the application default. */
    wsUrl?: string;
    /** When true, skips the WebSocket connection and drives the display with a simulated device. */
    demo?: boolean;
    /** Additional CSS class names to apply to the component. */
    className?: string;
};
export default function BeamEnergyPV({
    pv = 'bl531_xps1:mono_angle_deg',
    title = 'Beam Energy',
    thetaOffsetDeg,
    wsUrl,
    demo = false,
    className,
}: BeamEnergyProps) {
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
        device,
    } = useBeamEnergyPV({ pv, thetaOffsetDeg, wsUrl, demo });
    return (
        <section
            className={cn(
                'flex flex-col w-64 h-72 bg-slate-200 text-slate-700 rounded-lg shadow-lg p-4 min-w-[26rem] relative',
                className,
            )}
        >
            <BeamEnergyHeader
                title={title}
                pv={pv}
                showController={showController}
                showPlot={showPlot}
                showAbout={showAbout}
                isLocked={isLocked}
                handleToggleLock={handleToggleLock}
                handleToggleController={handleToggleController}
                handleTogglePlot={handleTogglePlot}
                handleToggleAbout={handleToggleAbout}
            />
            <BeamEnergyTitleIcon
                title={title}
                pv={device.name}
                showIcon={!showAbout && !showPlot}
            />
            {!showAbout && !showPlot && (
                <BeamEnergyCurrentValue
                    currentValueDegrees={currentValueDegrees}
                    currentValueEV={currentValueEV}
                />
            )}
            {showController && !showAbout && !showPlot && (
                <BeamEnergyController
                    currentValueDegrees={currentValueDegrees}
                    onAbsoluteMove={handleAbsoluteMove}
                    onRelativeMove={handleRelativeMove}
                    onStop={handleStop}
                    isLocked={isLocked}
                />
            )}
            {showPlot && !showAbout && <BeamEnergyPlot currentValueEV={currentValueEV} />}
            {showAbout && <BeamEnergyAbout device={device} className="overflow-auto" />}
        </section>
    );
}
