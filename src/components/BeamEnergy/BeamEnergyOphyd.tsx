import useBeamEnergyOphyd from './hooks/useBeamEnergyOphyd';
import BeamEnergyHeader from './BeamEnergyHeader';
import BeamEnergyCurrentValue from './BeamEnergyCurrentValue';
import BeamEnergyController from './BeamEnergyController';
import BeamEnergyPlot from './BeamEnergyPlot';
import BeamEnergyAbout from './BeamEnergyAbout';
import BeamEnergyTitleIcon from './BeamEnergyTitleIcon';
import { cn } from '@/lib/utils';

export type BeamEnergyOphydProps = {
    /** Ophyd device name for the beam energy signal. Defaults to 'mono_energy'. */
    deviceName?: string;
    /** Display title shown in the widget header. Defaults to 'Beam Energy'. */
    title?: string;
    /** Angular offset in degrees applied when converting mono angle to beam energy. */
    thetaOffsetDeg?: number;
    /** WebSocket server URL. When omitted, uses the application default. */
    wsUrl?: string;
    /** Additional CSS class names to apply to the component. */
    className?: string;
};
export default function BeamEnergyOphyd({
    deviceName = 'mono_energy',
    title = 'Beam Energy',
    thetaOffsetDeg: _thetaOffsetDeg,
    wsUrl,
    className,
}: BeamEnergyOphydProps) {
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
        device,
    } = useBeamEnergyOphyd({ deviceName, wsUrl });
    return (
        <section
            className={cn(
                'flex flex-col w-64 h-72 bg-slate-200 text-slate-700 rounded-lg shadow-lg p-4 min-w-[26rem] relative',
                className,
            )}
        >
            <BeamEnergyHeader
                title={title}
                pv={device.name}
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
            {!showAbout && !showPlot && <BeamEnergyCurrentValue currentValueEV={currentValueEV} />}
            {showController && !showAbout && !showPlot && (
                <BeamEnergyController
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
