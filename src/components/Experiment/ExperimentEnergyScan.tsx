import { useState } from "react";
import { cn } from "@/lib/utils";
import ExperimentExecutePlanButtonGeneric from "./ExperimentExecutePlanButtonGeneric";
import TiledWriterScatterPlot from "@/components/Tiled/TiledWriterScatterPlot";
import { getBlueskyRunList } from "@/components/QServer/utils/qServerApiUtils";
import TiledWriterDetImageHeatmap from "../Tiled/TiledWriterDetImageHeatmap";

type ExperimentEnergyScanProps = {
    className?: string;
    onSuccess?: (response: any) => void;
    onError?: (error: string) => void;
};

export default function ExperimentEnergyScan({ 
    className,
    onSuccess,
    onError
}: ExperimentEnergyScanProps) {
    // Energy scan form state
    const [startEnergy, setStartEnergy] = useState<number>(8000);
    const [stopEnergy, setStopEnergy] = useState<number>(9000);
    const [numPoints, setNumPoints] = useState<number>(20);
    const [blueskyRunId, setBlueskyRunId] = useState<string>("");

    // Energy scan form handlers
    const handleStartEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartEnergy(Number(e.target.value));
    };

    const handleStopEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStopEnergy(Number(e.target.value));
    };

    const handleNumPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNumPoints(Number(e.target.value));
    };

    const handleSuccess = async (response: any) => {
        console.log("Energy scan executed successfully!", response);
        
        // Get the run ID for the scatter plot
        if (response.item && 'item_uid' in response.item) {
            const runList = await getBlueskyRunList(response.item.item_uid);
            if (runList && runList.length > 0 && typeof runList[0] === 'string') {
                setBlueskyRunId(runList[0]);
            }
        }
        
        onSuccess?.(response);
    };

    const handleError = (error: string) => {
        console.error("Energy scan execution failed:", error);
        alert(`Energy scan execution failed: ${error}`);
        onError?.(error);
    };

    return (
        <div className={className}>
            <h2 className="text-xl font-bold mb-4 text-white">Energy Scan</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-4 h-fit">
                <div className="flex gap-6">
                    <div className="max-w-md space-y-4">
                        <h3 className="text-lg font-semibold">Energy Scan Configuration</h3>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Energy (eV):</label>
                            <input
                                type="number"
                                value={startEnergy}
                                onChange={handleStartEnergyChange}
                                min="1000"
                                max="30000"
                                step="10"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Stop Energy (eV):</label>
                            <input
                                type="number"
                                value={stopEnergy}
                                onChange={handleStopEnergyChange}
                                min="1000"
                                max="30000"
                                step="10"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Number of Points:</label>
                            <input
                                type="number"
                                value={numPoints}
                                onChange={handleNumPointsChange}
                                min="2"
                                max="1000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div className="pt-2">
                            <ExperimentExecutePlanButtonGeneric
                                planName="scan"
                                kwargs={{
                                    detectors: ["det", "diode"],
                                    motor: "mono",
                                    start: startEnergy,
                                    stop: stopEnergy,
                                    num: numPoints,
                                    md: {}
                                }}
                                onSuccess={handleSuccess}
                                onError={handleError}
                            />
                        </div>
                        
                        <div className="text-xs text-gray-600 mt-2">
                            <p>Scan Range: {startEnergy} - {stopEnergy} eV</p>
                            <p>Step Size: {numPoints > 1 ? ((stopEnergy - startEnergy) / (numPoints - 1)).toFixed(1) : 0} eV</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-96">
                        <h3 className="text-lg font-semibold mb-4">Energy Scan Results</h3>
                        <div className="flex">
                            <TiledWriterDetImageHeatmap
                                blueskyRunId={blueskyRunId}
                                size="small"
                                isRunFinished={false}
                            />
                            <TiledWriterScatterPlot 
                                blueskyRunId={blueskyRunId}
                                tiledTrace={{ x: "seq_num", y: "diode" }}
                                className="w-full h-fit"
                                plotClassName="h-80"
                                showStatusText={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}