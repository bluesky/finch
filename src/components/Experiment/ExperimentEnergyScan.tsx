import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
    const [startEnergy, setStartEnergy] = useState<number>(7000);
    const [stopEnergy, setStopEnergy] = useState<number>(7500);
    const [numPoints, setNumPoints] = useState<number>(10);
    const [executedItemUid, setExecutedItemUid] = useState<string>("");

    // TanStack Query to poll for Bluesky run list until we get results
    const { data: runList = [] } = useQuery<string[]>({
        queryKey: ['bluesky-run-list', executedItemUid],
        queryFn: () => getBlueskyRunList(executedItemUid),
        enabled: !!executedItemUid, // Only run when we have an item UID
        refetchInterval: (query) => {
            // Stop polling if we have at least one run or if there's an error
            const data = query.state.data;
            return (data && Array.isArray(data) && data.length > 0) ? false : 1000;
        },
        refetchIntervalInBackground: true,
        retry: (failureCount) => {
            // Keep retrying for up to 30 seconds (30 attempts at 1s intervals)
            return failureCount < 30;
        },
        retryDelay: 1000,
        staleTime: 500, // Consider data stale quickly to ensure fresh polling
    });

    // Get the first run ID when available
    const blueskyRunId = runList && runList.length > 0 ? runList[0] : "";

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
        
        // Set the item UID to trigger TanStack Query polling
        if (response.item && 'item_uid' in response.item) {
            setExecutedItemUid(response.item.item_uid);
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
                                planName="energy_scan"
                                kwargs={{
                                    detectors: ["det", "diode"],
                                    motor: "mono_energy",
                                    start: startEnergy,
                                    stop: stopEnergy,
                                    num: numPoints,
                                    md: {exact_plan_name: "energy_scan"}
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
                        <div className="flex items-center gap-4 h-4/5 pt-8">
                            <TiledWriterDetImageHeatmap
                                blueskyRunId={blueskyRunId}
                                size="small"
                                isRunFinished={false}
                            />
                            <TiledWriterScatterPlot 
                                blueskyRunId={blueskyRunId}
                                tiledTrace={{ x: "seq_num", y: "diode" }}
                                className=""
                                plotClassName=""
                                showStatusText={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}