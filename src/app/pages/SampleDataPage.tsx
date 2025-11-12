import { useState } from "react";
import { Tiled, TiledItemLinks } from "@blueskyproject/tiled";
import TiledScatterPlot from "@/components/Tiled/TiledScatterPlot";
import { getBlueskyRunList } from "@/components/QServer/utils/qServerApiUtils";
import ExperimentExecutePlanButton from "@/components/Experiment/ExperimentExecutePlanButton";

import { getPathFromLinks } from "@/components/Tiled/utils/tiledUtils";
import { PostItemAddResponse, QueueItem } from "@/components/QServer/types/apiTypes";

export default function SampleDataPage() {
    const [ selectedPath, setSelectedPath ] = useState<string | null>(null);
    
    // Form state for button props
    const [detectors, setDetectors] = useState<string>("motor1");
    const [num, setNum] = useState<number>(1);
    const [delay, setDelay] = useState<number>(10);
    const [metadata, setMetadata] = useState<string>('{"experiment": "test"}');
    
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

    // Parse detectors string to array
    const detectorsArray = detectors.split(',').map(d => d.trim()).filter(d => d.length > 0);
    
    // Parse metadata JSON
    let parsedMetadata = {};
    try {
        parsedMetadata = JSON.parse(metadata);
    } catch (e) {
        console.warn("Invalid metadata JSON, using empty object");
    }

    return (
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-4">Sample Data Visualization</h2>
                {/* <TiledScatterPlot path={selectedPath} tiledTrace={{ x: "time", y: "motor1" }} /> */}
                <Tiled onSelectCallback={printPath}/>
            </div>
            
            <div>
                <h2 className="text-xl font-bold mb-4">Experiment Control</h2>
                
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
                        onSuccess={(response) => {
                            console.log("Plan executed successfully!", response);
                            if (response.item && 'item_uid' in response.item) {
                                getBlueskyRunList(response.item.item_uid);
                            }
                        }}
                        onError={(error) => {
                            console.error("Plan execution failed:", error);
                            alert(`Plan execution failed: ${error}`);
                        }}
                    />
                </div>
            </div>
        </div>
    )
}