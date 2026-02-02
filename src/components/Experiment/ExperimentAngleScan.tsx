import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ExperimentExecutePlanButtonGeneric from "./ExperimentExecutePlanButtonGeneric";
import TiledWriterScatterPlot from "@/components/Tiled/TiledWriterScatterPlot";
import { getBlueskyRunList } from "@/components/QServer/utils/qServerApiUtils";
import TiledWriterDetImageHeatmap from "../Tiled/TiledWriterDetImageHeatmap";
import ExperimentHistory from "./ExperimentHistory";

import { ClockCounterClockwise, PersonSimpleRun, Images, ChartLine } from "@phosphor-icons/react";

type ExperimentAngleScanProps = {
    className?: string;
    onSuccess?: (response: any) => void;
    onError?: (error: string) => void;
};

export default function ExperimentAngleScan({ 
    className,
    onSuccess,
    onError
}: ExperimentAngleScanProps) {
    // Angle scan form state
    const [user, setUser] = useState<string>("");
    const [startAngle, setStartAngle] = useState<number>(-2);
    const [stopAngle, setStopAngle] = useState<number>(2);
    const [numPoints, setNumPoints] = useState<number>(5);
    const [executedItemUid, setExecutedItemUid] = useState<string>("");
    const [viewMode, setViewMode] = useState<'form' | 'history'>('form');
    const [blueskyRunId, setBlueskyRunId] = useState<string>("");

    useEffect(() => {
        const storedUser = localStorage.getItem("energy_scan_user");
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("energy_scan_user", user);
    }, [user]);

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
    const pollRunId = runList && runList.length > 0 ? runList[0] : "";
    
    // Update blueskyRunId when polling returns new run
    useEffect(() => {
        if (pollRunId) {
            setBlueskyRunId(pollRunId);
        }
    }, [pollRunId]);

    // Angle scan form handlers
    const handleStartAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartAngle(Number(e.target.value));
    };

    const handleStopAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStopAngle(Number(e.target.value));
    };

    const handleNumPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNumPoints(Number(e.target.value));
    };

    const handleSuccess = async (response: any) => {
        console.log("Angle scan executed successfully!", response);
        
        // Set the item UID to trigger TanStack Query polling
        if (response.item && 'item_uid' in response.item) {
            setExecutedItemUid(response.item.item_uid);
        }
        
        onSuccess?.(response);
    };

    const handleError = (error: string) => {
        console.error("Angle scan execution failed:", error);
        alert(`Angle scan execution failed: ${error}`);
        onError?.(error);
    };

    return (
        <div className={className}>
            <h2 className="text-xl font-bold mb-4 text-white">Angle Scan</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-4 h-fit">
                <div className="flex gap-6">
                    <div className="w-96 space-y-4">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-12">
                                <button
                                    onClick={() => {
                                        setViewMode('form');
                                        setBlueskyRunId('');
                                    }}
                                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                                        viewMode === 'form' 
                                            ? 'text-sky-800' 
                                            : 'text-gray-400 hover:text-sky-600'
                                    }`}
                                    title="Run new scan"
                                >
                                    <PersonSimpleRun size={24} weight="regular" />
                                    <span className="text-xs font-light">Run</span>
                                    {viewMode === 'form' && <div className="h-0.5 w-full bg-sky-800" />}
                                </button>
                                <button
                                    onClick={() => setViewMode('history')}
                                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                                        viewMode === 'history' 
                                            ? 'text-sky-800' 
                                            : 'text-gray-400 hover:text-sky-600'
                                    }`}
                                    title="View scan history"
                                >
                                    <ClockCounterClockwise size={24} weight="regular" />
                                    <span className="text-xs font-light">History</span>
                                    {viewMode === 'history' && <div className="h-0.5 w-full bg-sky-800" />}
                                </button>
                            </div>
                        </div>

                        {viewMode === 'form' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">User:</label>
                                    <input
                                        type="text"
                                        value={user}
                                        onChange={(e) => setUser(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter user name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Angle (degrees):</label>
                                    <input
                                        type="number"
                                        value={startAngle}
                                        onChange={handleStartAngleChange}
                                        min="-90"
                                        max="90"
                                        step="0.1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stop Angle (degrees):</label>
                                    <input
                                        type="number"
                                        value={stopAngle}
                                        onChange={handleStopAngleChange}
                                        min="-90"
                                        max="90"
                                        step="0.1"
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
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                
                                <div className="pt-2 m-auto w-fit">
                                    <ExperimentExecutePlanButtonGeneric
                                        planName="angle_scan"
                                        kwargs={{
                                            detectors: ["det"],
                                            motor: "hexapod_motor_Ry",
                                            start: startAngle,
                                            stop: stopAngle,
                                            num: numPoints,
                                            md: {exact_plan_name: "angle_scan", user: user}
                                        }}
                                        onSuccess={handleSuccess}
                                        onError={handleError}
                                    />
                                </div>
                                
                                <div className="text-xs text-gray-600 mt-2 mx-auto w-fit">
                                    <p>Angle Range: {startAngle}° - {stopAngle}°</p>
                                    <p>Step Size: {numPoints > 1 ? ((stopAngle - startAngle) / (numPoints - 1)).toFixed(2) : 0}°</p>
                                </div>
                            </>
                        ) : (
                            <ExperimentHistory
                                planName="angle_scan"
                                metadataFulltextSearch={user}
                                onItemClick={(item) => setBlueskyRunId(item.id)}
                                enablePersistentSelection={true}
                                initialSelectedItemId={blueskyRunId}
                            />
                        )}
                    </div>
                    
                    <div className="flex flex-col min-w-96 flex-grow border-l-2 border-slate-300 pl-4">
                        <span className="flex flex-start gap-8">
                            <button
                                className="flex flex-col items-center gap-1 p-2 transition-colors text-sky-800"
                                title="Detector files"
                                disabled={true}
                            >
                                <Images size={24} weight="regular" />
                                <span className="text-xs font-light">Heatmap</span>
                            </button>
                            <button
                                className="flex flex-col items-center gap-1 p-2 transition-colors text-sky-800"
                                title="Line Plot"
                                disabled={true}
                            >
                                <ChartLine size={24} weight="regular" />
                                <span className="text-xs font-light">Line Plot</span>
                            </button>
                        </span>

                        <div className="flex flex-grow items-center gap-4 h-fit justify-center" key={viewMode}>
                            <TiledWriterDetImageHeatmap
                                blueskyRunId={blueskyRunId}
                                size="medium"
                                isRunFinished={false}
                                plotClassName="bg-transparent"
                            />
                            <TiledWriterScatterPlot 
                                key={blueskyRunId}
                                blueskyRunId={blueskyRunId}
                                tiledTrace={{ x: "seq_num", y: "hexapod_motor_Ry_readback" }}
                                className="max-h-[40rem] h-full"
                                plotClassName="h-full"
                                showStatusText={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}