import { Lock, Question } from "@phosphor-icons/react"
import { deviceIcons } from "@/assets/icons";
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
}
export default function BeamEnergyHeader({title, pv, showController, showPlot, showAbout, isLocked, handleToggleLock, handleToggleController, handleTogglePlot, handleToggleAbout}: BeamEnergyHeaderProps) {
    return (
        <nav className="flex items-start justify-between">
            <Lock size={24} className={`${isLocked ? "text-slate-900" : "text-slate-500"} hover:cursor-pointer hover:text-slate-700`} onClick={handleToggleLock}/>
            <div className="flex flex-col items-center justify-start">
                <span className="w-24 h-auto">{deviceIcons.monoLargeNoArrows}</span>
                <h2 className="text-sky-950 font-semibold text-md">{title}</h2>
                <h3 className="text-sky-950 font-extralight -mt-2">{pv}</h3>
            </div>
            <Question size={24} className={`${showAbout ? "text-slate-900" : "text-slate-500"} hover:cursor-pointer hover:text-slate-700`} onClick={handleToggleAbout}/>

        </nav>
    )
}