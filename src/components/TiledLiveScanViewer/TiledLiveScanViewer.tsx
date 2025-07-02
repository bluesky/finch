import React, { useEffect, useRef, useState } from "react";
import { getSearchResults } from "../Tiled/apiClient";
import {
  TiledSearchResult,
  TiledSearchItem,
  TiledStructures,
} from "../Tiled/types";
import InternalDataViewer from "./InternalDataViewer";

interface TiledLiveScanViewerProps {
  pollingIntervalMs?: number;
}

const TILED_SEARCH_PATH =
  "%2F?page%5Boffset%5D=0&page%5Blimit%5D=1&sort=-metadata.start.time&omit_links=false&include_data_sources=false&filter%5Bspecs%5D%5Bcondition%5D%5Binclude%5D=%5B%22BlueskyRun%22%5D&filter%5Bspecs%5D%5Bcondition%5D%5Bexclude%5D=%22%22&filter%5Bstructure_family%5D%5Bcondition%5D%5Bvalue%5D=container";

export default function TiledLiveScanViewer({
  pollingIntervalMs = 1000,
}: TiledLiveScanViewerProps) {
  const [ latestScan, setLatestScan ] = useState<TiledSearchItem<TiledStructures> | null>(null);
  const [ isScanComplete, setIsScanComplete ] = useState<boolean>(false);
  const previousUidRef = useRef<string | null>(null);
  const previousSerializedRef = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      getSearchResults(
        TILED_SEARCH_PATH,
        (data: TiledSearchResult) => {
          if (data && data.data && data.data.length > 0) {
            const newScan = data.data[0];
            const newUid = newScan.id;
            const newSerialized = JSON.stringify(newScan);

            if (
              newUid !== previousUidRef.current ||
              newSerialized !== previousSerializedRef.current
            ) {
              previousUidRef.current = newUid;
              previousSerializedRef.current = newSerialized;
              setLatestScan(newScan);
              setIsScanComplete(false);
            } else {
                if (newScan.attributes.metadata.stop) { //if 'stop' metadata exists, the run has been completed
                    setIsScanComplete((prev) => {
                        if (prev === false) return true;
                        return prev;
                    });
                }

            }
          }
        },
        undefined,
        false
      );
    }, pollingIntervalMs);

    return () => clearInterval(interval);
  }, [pollingIntervalMs]);

  return (
    <div className="p-4 bg-gray-100 min-h-[300px] rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        Latest Bluesky Scan (polled every {pollingIntervalMs} ms)
      </h2>
      <div className="bg-white text-sm p-4 border rounded overflow-x-auto font-mono text-gray-700 whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto">
        {latestScan ? (
          <pre>{JSON.stringify(latestScan, null, 2)}</pre>
        ) : (
          <p className="text-gray-500">No scan data available.</p>
        )}
      </div>

      {latestScan?.id && <InternalDataViewer uid={latestScan.id} isScanComplete={isScanComplete} pollingIntervalMs={pollingIntervalMs}/>}
    </div>
  );
}
