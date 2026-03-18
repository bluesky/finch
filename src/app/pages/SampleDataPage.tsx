import { useState } from "react";
import { Tiled, TiledItemLinks } from "@blueskyproject/tiled";
import TiledWriterScatterPlot from "@/components/Tiled/TiledWriterScatterPlot";
import { getBlueskyRunList } from "@/components/QServer/utils/qServerApiUtils";
import ExperimentExecutePlanButton from "@/components/Experiment/ExperimentExecutePlanButton";
import ExperimentExecutePlanButtonGeneric from "@/components/Experiment/ExperimentExecutePlanButtonGeneric";

import { getPathFromLinks } from "@/components/Tiled/utils/tiledUtils";

export default function SampleDataPage() {
    const [ selectedPath, setSelectedPath ] = useState<string | null>(null);
    
    // Form state for count plan
    const [detectors, setDetectors] = useState<string>("hexapod_motor_Tz");
    const [num, setNum] = useState<number>(1);
    const [delay, setDelay] = useState<number>(10);
    const [metadata, setMetadata] = useState<string>('{"experiment": "test"}');
    const [blueskyRunId, setBlueskyRunId] = useState<string>("");
    
    // Form state for scan plan
    const [scanDetectors, setScanDetectors] = useState<string>("det1");
    const [scanMotor, setScanMotor] = useState<string>("hexapod_motor_Tz");
    const [scanStart, setScanStart] = useState<number>(0);
    const [scanStop, setScanStop] = useState<number>(10);
    const [scanNum, setScanNum] = useState<number>(11);
    const [scanMetadata, setScanMetadata] = useState<string>('{}');
    
    const printPath = (links: TiledItemLinks) => {
        const path = getPathFromLinks(links);
        console.log("Selected Tiled path:", path);
        setSelectedPath(path);
    }

    const handleDetectorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetectors(e.target.value);
    };

    const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNum(Number(e.target.value));
    };

    const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDelay(Number(e.target.value));
    };

    const handleMetadataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMetadata(e.target.value);
    };

    // Scan plan handlers
    const handleScanDetectorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScanDetectors(e.target.value);
    };

    const handleScanMotorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScanMotor(e.target.value);
    };

    const handleScanStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScanStart(Number(e.target.value));
    };

    const handleScanStopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScanStop(Number(e.target.value));
    };

    const handleScanNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScanNum(Number(e.target.value));
    };

    const handleScanMetadataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScanMetadata(e.target.value);
    };

    // Parse detectors string to array
    const detectorsArray = detectors.split(',').map(d => d.trim()).filter(d => d.length > 0);
    
    // Parse metadata JSON
    let parsedMetadata = {};
    try {
        parsedMetadata = JSON.parse(metadata);
    } catch (e) {
        console.warn("Invalid metadata JSON, using empty object");
    }

    // Parse scan plan parameters
    const scanDetectorsArray = scanDetectors.split(',').map(d => d.trim()).filter(d => d.length > 0);
    
    let parsedScanMetadata = {};
    try {
        parsedScanMetadata = JSON.parse(scanMetadata);
    } catch (e) {
        console.warn("Invalid scan metadata JSON, using empty object");
    }

    return (
        <div className="p-4 space-y-6 ">
            <div>
                <h2 className="text-xl font-bold mb-4 text-white">Tiled Writer Scatter Plot</h2>
                <TiledWriterScatterPlot 
                    blueskyRunId={blueskyRunId}
                    tiledTrace={{ x: "time", y: "hexapod_motor_Tz_readback" }}
                    className="mb-6"
                />
            </div>
            

            <div className="flex w-full gap-8">
                <div className="min-w-96">
                    <h2 className="text-xl font-bold mb-4 text-white">Experiment Control</h2>
                    
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4 max-w-md">
                        <h3 className="text-lg font-semibold">Count Plan Configuration</h3>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Detectors (comma-separated):</label>
                            <input
                                type="text"
                                value={detectors}
                                onChange={handleDetectorsChange}
                                placeholder="motor1, det1, det2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Number of measurements:</label>
                            <input
                                type="number"
                                value={num}
                                onChange={handleNumChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Delay (seconds):</label>
                            <input
                                type="number"
                                value={delay}
                                onChange={handleDelayChange}
                                min="0"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Metadata (JSON):</label>
                            <textarea
                                value={metadata}
                                onChange={handleMetadataChange}
                                placeholder='{"key": "value"}'
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <ExperimentExecutePlanButton
                            detectors={detectorsArray}
                            num={num}
                            delay={delay}
                            md={parsedMetadata}
                            onSuccess={async (response) => {
                                console.log("Plan executed successfully!", response);
                                if (response.item && 'item_uid' in response.item) {
                                    const runList = await getBlueskyRunList(response.item.item_uid);
                                    if (runList && runList.length > 0 && typeof runList[0] === 'string') {
                                        setBlueskyRunId(runList[0]);
                                    }
                                }
                            }}
                            onError={(error) => {
                                console.error("Plan execution failed:", error);
                                alert(`Plan execution failed: ${error}`);
                            }}
                        />
                    </div>
                </div>
                <div className="min-w-96">
                    <h2 className="text-xl font-bold mb-4 text-white">Scan Plan</h2>
                    
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4 max-w-md">
                        <h3 className="text-lg font-semibold">Scan Plan Configuration</h3>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Detectors (comma-separated):</label>
                            <input
                                type="text"
                                value={scanDetectors}
                                onChange={handleScanDetectorsChange}
                                placeholder="det1, det2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Motor:</label>
                            <input
                                type="text"
                                value={scanMotor}
                                onChange={handleScanMotorChange}
                                placeholder="hexapod_motor_tz"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Position:</label>
                            <input
                                type="number"
                                value={scanStart}
                                onChange={handleScanStartChange}
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Stop Position:</label>
                            <input
                                type="number"
                                value={scanStop}
                                onChange={handleScanStopChange}
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Number of Points:</label>
                            <input
                                type="number"
                                value={scanNum}
                                onChange={handleScanNumChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Metadata (JSON):</label>
                            <textarea
                                value={scanMetadata}
                                onChange={handleScanMetadataChange}
                                placeholder='{"key": "value"}'
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <ExperimentExecutePlanButtonGeneric
                            planName="scan"
                            kwargs={{
                                detectors: scanDetectorsArray,
                                motor: scanMotor,
                                start: scanStart,
                                stop: scanStop,
                                num: scanNum,
                                md: parsedScanMetadata
                            }}
                            onSuccess={async (response) => {
                                console.log("Scan plan executed successfully!", response);
                                if (response.item && 'item_uid' in response.item) {
                                    const runList = await getBlueskyRunList(response.item.item_uid);
                                    if (runList && runList.length > 0 && typeof runList[0] === 'string') {
                                        setBlueskyRunId(runList[0]);
                                    }
                                }
                            }}
                            onError={(error) => {
                                console.error("Scan plan execution failed:", error);
                                alert(`Scan plan execution failed: ${error}`);
                            }}
                        />
                    </div>
                </div>
            </div>
            

            <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 w-full text-left text-white">Sample Data Visualization</h2>
                {/* <TiledScatterPlot path={selectedPath} tiledTrace={{ x: "time", y: "motor1" }} /> */}
                <Tiled onSelectCallback={printPath} backgroundClassName="text-black" size="medium"/>
            </div>
        </div>
    )
}