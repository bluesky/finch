import HexapodController from "./HexapodController";
import HexapodHeader from "./HexapodHeader";
import useHexapod from "./hooks/useHexapod";

export default function Hexapod() {
    const { hexapodRBVs, handleStartClick } = useHexapod({});

    return (
        <section className="w-[36rem] h-fit bg-slate-50 rounded-lg shadow-lg p-4">
            <HexapodHeader />
            <HexapodController hexapodRBVs={hexapodRBVs} onStartClick={handleStartClick} />
        </section>
    )
}