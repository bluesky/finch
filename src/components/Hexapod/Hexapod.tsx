import HexapodHeader from "./HexapodHeader";
import HexapodController from "./HexapodController";
import HexapodPlot from "./HexapodPlot";
import HexapodAbout from "./HexapodAbout";
import useHexapod from "./hooks/useHexapod";

type HexapodProps = {
    prefix?: string;
}
export default function Hexapod({prefix}: HexapodProps) {
    const { 
        hexapodRBVs, 
        showAbout,
        showController,
        showPlot,
        isLocked,
        handleStartClick, 
        handleStopClick,
        onClickAbout,
        onClickController,
        onClickPlot,
        onClickLock 
    } = useHexapod({prefix});

    return (
        <section className="w-fit h-fit bg-slate-200 rounded-lg shadow-lg p-4">
            <HexapodHeader prefix={prefix} showController={showController} showPlot={showPlot} showAbout={showAbout} isLocked={isLocked} onClickLock={onClickLock} onClickController={onClickController} onClickPlot={onClickPlot} onClickAbout={onClickAbout} />
            {showController && <HexapodController hexapodRBVs={hexapodRBVs} onStartClick={handleStartClick} onStopClick={handleStopClick} isLocked={isLocked} />}
            {showPlot && <HexapodPlot  />}
            {showAbout && <HexapodAbout />}
        </section>
    )
}