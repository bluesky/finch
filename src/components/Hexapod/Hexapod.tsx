import HexapodHeader from './HexapodHeader';
import HexapodController from './HexapodController';
import HexapodPlot from './HexapodPlot';
//import HexapodAbout from "./HexapodAbout";
import useHexapod from './hooks/useHexapod';

type HexapodProps = {
    /** Optional prefix for device PV names (e.g., 'SYM:HEX01'). If not provided, defaults to no prefix. */
    prefix?: string;
    /** When true, skips the WebSocket connection and simulates a connected hexapod at all-zero positions. */
    demo?: boolean;
};
export default function Hexapod({ prefix, demo }: HexapodProps) {
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
        onClickLock,
    } = useHexapod({ prefix, demo });

    return (
        <section className="min-w-[26rem] w-[26rem] min-h-[32rem] h-[32rem] text-slate-700 bg-slate-200 rounded-lg shadow-lg p-4">
            <HexapodHeader
                prefix={prefix}
                showController={showController}
                showPlot={showPlot}
                showAbout={showAbout}
                isLocked={isLocked}
                onClickLock={onClickLock}
                onClickController={onClickController}
                onClickPlot={onClickPlot}
                onClickAbout={onClickAbout}
            />
            {showController && !showAbout && (
                <HexapodController
                    hexapodRBVs={hexapodRBVs}
                    onStartClick={handleStartClick}
                    onStopClick={handleStopClick}
                    isLocked={isLocked}
                />
            )}
            {showPlot && !showAbout && <HexapodPlot />}
            {/* {showAbout && <HexapodAbout />} */}
            {showAbout && <p> About Section Coming Soon!</p>}
        </section>
    );
}
