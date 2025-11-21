import BeamEnergyOphyd from "@/components/BeamEnergy/BeamEnergyOphyd";
import Hexapod from "@/components/Hexapod/Hexapod";
import TiledWriterDetImageHeatmap from "@/components/Tiled/TiledWriterDetImageHeatmap";
import ExperimentEnergyScan from "@/components/Experiment/ExperimentEnergyScan";

import { useTiledMostRecentDetImage } from "@/components/Tiled/hooks/useTiledMostRecentDetImage";


export default function ScatteringPage() {
    const { blueskyRunId, isRunFinished } = useTiledMostRecentDetImage();
    console.log(`[ScatteringPage] blueskyRunId: ${blueskyRunId}, isRunFinished: ${isRunFinished}`);

    return (
        <div className="flex flex-col p-4 space-y-6">
            <div className="min-w-96">
                <ExperimentEnergyScan 
                    onSuccess={(response) => {
                        console.log("Energy scan completed!", response);
                    }}
                    onError={(error) => {
                        console.error("Energy scan failed:", error);
                    }}
                />
            </div>
     
            <div className="flex gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-4 text-white">Live Detector Image</h2>
                    <TiledWriterDetImageHeatmap blueskyRunId={blueskyRunId} isRunFinished={isRunFinished} />
                </div>
                <div className="flex flex-col gap-12 pt-16">
                    <BeamEnergyOphyd />
                    <Hexapod/>
                </div>
            </div>
        </div>
    );
}