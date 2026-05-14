import { Lock, Question, Joystick, ChartLine } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
type BeamEnergyHeaderProps = {
    /** Display title shown below the monochromator icon. */
    title: string;
    /** EPICS PV or device name shown as a subtitle below the title. */
    pv: string;
    /** Whether the controller section is currently visible. */
    showController: boolean;
    /** Whether the plot section is currently visible. */
    showPlot: boolean;
    /** Whether the about/debug section is currently visible. */
    showAbout: boolean;
    /** Whether the widget controls are locked. Affects the lock icon appearance. */
    isLocked: boolean;
    /** Callback to toggle the locked state. */
    handleToggleLock: () => void;
    /** Callback to toggle the controller section visibility. */
    handleToggleController: () => void;
    /** Callback to toggle the plot section visibility. */
    handleTogglePlot: () => void;
    /** Callback to toggle the about/debug section visibility. */
    handleToggleAbout: () => void;
    className?: string;
};
export default function BeamEnergyHeader({
    showController,
    showPlot,
    showAbout,
    isLocked,
    handleToggleLock,
    handleToggleController,
    handleTogglePlot,
    handleToggleAbout,
    className,
}: BeamEnergyHeaderProps) {
    return (
        <nav
            className={cn(
                `justify-between flex items-start absolute top-0 left-0 w-full p-4`,
                className,
            )}
        >
            <span className="flex gap-2">
                <Lock
                    size={24}
                    className={`${isLocked ? 'text-slate-900' : 'text-slate-500'} hover:cursor-pointer hover:text-slate-700`}
                    onClick={handleToggleLock}
                />
                <Joystick
                    size={24}
                    className={`${showController && !showAbout ? 'text-slate-900' : 'text-slate-500'} hover:cursor-pointer hover:text-slate-700`}
                    onClick={handleToggleController}
                />
            </span>
            <span className="flex gap-2">
                <ChartLine
                    size={24}
                    className={`${showPlot && !showAbout ? 'text-slate-900' : 'text-slate-500'} hover:cursor-pointer hover:text-slate-700`}
                    onClick={handleTogglePlot}
                />
                <Question
                    size={24}
                    className={`${showAbout ? 'text-slate-900' : 'text-slate-500'} hover:cursor-pointer hover:text-slate-700`}
                    onClick={handleToggleAbout}
                />
            </span>
        </nav>
    );
}
