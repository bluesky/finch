import HexapodController from "./HexapodController";
import useHexapod from "./hooks/useHexapod";

export default function Hexapod() {
    const { hexapodRBVs, handleStartClick } = useHexapod({});

    return (
        <section className="w-[30rem] bg-slate-50 rounded-lg shadow-lg p-4">
            <HexapodController hexapodRBVs={hexapodRBVs} onStartClick={handleStartClick} />
        </section>
    )
}