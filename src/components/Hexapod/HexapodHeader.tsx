import { Lock, Joystick, ChartLine,  Question} from "@phosphor-icons/react"
type HexapodHeaderProps = {
    prefix?: string;
    showController: boolean;
    showPlot: boolean;
    showAbout: boolean;
    isLocked: boolean;
    onClickLock?: () => void;
    onClickController?: () => void;
    onClickPlot?: () => void;
    onClickAbout?: () => void;
}
export default function HexapodHeader({ prefix="SYM:HEX01", showController, showPlot, showAbout, isLocked, onClickLock, onClickController, onClickPlot, onClickAbout }: HexapodHeaderProps) {
    return (
        <nav className="flex items-center justify-between">
            <div className="flex flex-shrink-0 w-fit gap-2">
                <Lock size={24} className={`${isLocked ? "text-slate-900" : "text-slate-500"} hover:cursor-pointer hover:text-slate-700`} onClick={onClickLock}/>
                <Joystick size={24} className={`${showController ? "text-slate-900" : "text-slate-500"} hover:cursor-pointer hover:text-slate-700`}/>
            </div>
            <h2 className="text-sky-900 font-semibold text-md text-center w-full mb-2">{prefix}</h2> 
            <div className="flex flex-shrink-0 w-fit gap-2">
                <ChartLine size={24} className={`${showPlot ? "text-slate-900" : "text-slate-500"} hover:cursor-pointer hover:text-slate-700`} onClick={onClickPlot}/>
                <Question size={24} className={`${showAbout ? "text-slate-900" : "text-slate-500"} hover:cursor-pointer hover:text-slate-700`} onClick={onClickAbout}/>
            </div>
        </nav>
    )
}