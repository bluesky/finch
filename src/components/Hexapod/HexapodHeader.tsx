import { Lock, Joystick, ChartLine, Question } from '@phosphor-icons/react';
type HexapodHeaderProps = {
    /** Device PV prefix shown as the widget title. Defaults to 'SYM:HEX01'. */
    prefix?: string;
    /** Whether the controller panel is currently visible. */
    showController: boolean;
    /** Whether the plot panel is currently visible. */
    showPlot: boolean;
    /** Whether the about panel is currently visible. */
    showAbout: boolean;
    /** Whether the widget controls are locked. Affects the lock icon appearance. */
    isLocked: boolean;
    /** Callback to toggle the locked state. */
    onClickLock?: () => void;
    /** Callback to toggle the controller panel visibility. */
    onClickController?: () => void;
    /** Callback to toggle the plot panel visibility. */
    onClickPlot?: () => void;
    /** Callback to toggle the about panel visibility. */
    onClickAbout?: () => void;
};
export default function HexapodHeader({
    prefix = 'SYM:HEX01',
    showController,
    showPlot,
    showAbout,
    isLocked,
    onClickLock,
    onClickController,
    onClickPlot,
    onClickAbout,
}: HexapodHeaderProps) {
    return (
        <nav className="flex items-center justify-between">
            <div className="flex flex-shrink-0 w-fit gap-2">
                <Lock
                    size={24}
                    className={`${isLocked ? 'text-slate-900' : 'text-slate-500'} hover:cursor-pointer hover:text-slate-700`}
                    onClick={onClickLock}
                />
                <Joystick
                    size={24}
                    className={`${showController && !showAbout ? 'text-slate-900' : 'text-slate-500'} hover:cursor-pointer hover:text-slate-700`}
                    onClick={onClickController}
                />
            </div>
            <h2 className="text-sky-900 font-semibold text-md text-center w-full mb-2">{prefix}</h2>
            <div className="flex flex-shrink-0 w-fit gap-2">
                <ChartLine
                    size={24}
                    className={`${showPlot && !showAbout ? 'text-slate-900' : 'text-slate-500'} hover:cursor-pointer hover:text-slate-700`}
                    onClick={onClickPlot}
                />
                <Question
                    size={24}
                    className={`${showAbout ? 'text-slate-900' : 'text-slate-500'} hover:cursor-pointer hover:text-slate-700`}
                    onClick={onClickAbout}
                />
            </div>
        </nav>
    );
}
