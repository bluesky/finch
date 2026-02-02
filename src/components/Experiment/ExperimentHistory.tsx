import { useEffect, useState } from "react";
import { getSearchResults, TiledSearchConfig, TiledSearchResult } from "@blueskyproject/tiled";
import dayjs from "dayjs";
import { TiledSearchItem, TiledStructures } from "../Tiled/types/tempTypes";
import { SpinnerGap } from "@phosphor-icons/react";
//import { TiledSearchResult } from "../Tiled/types/tempTypes";
type ExperimentHistoryProps = {
    planName?: string;
    className?: string;
    metadataFulltextSearch?: string;
    tiledBaseUrl?: string;
    tiledInitialSearchPath?: string;
    tiledPageLimit?: number;
    onItemClick?: (item: TiledSearchItem<TiledStructures>) => void;
    enablePersistentSelection?: boolean;
    initialSelectedItemId?: string;
}
export default function ExperimentHistory({planName, className, metadataFulltextSearch, tiledBaseUrl, tiledInitialSearchPath, tiledPageLimit, onItemClick, enablePersistentSelection, initialSelectedItemId}: ExperimentHistoryProps) {
    const [ searchResults, setSearchResults ] = useState<TiledSearchResult | null>(null);
    const [ selectedItemId, setSelectedItemId ] = useState<string | null>(initialSelectedItemId || null);
    useEffect(() => {
        const fetchData = async () => {
            //eventually uncomment this and get the key contains working once that's updated in tiled api
            const searchConfig: TiledSearchConfig = {
                baseUrl: tiledBaseUrl || undefined,
                initialPath: tiledInitialSearchPath || undefined,
                options: {
                    pageLimit: tiledPageLimit || 10,
                    sort: '-',
                },
                filters: {
                    specs: {include: ['BlueskyRun'], exclude: []},
                    fulltext: metadataFulltextSearch ? {text: metadataFulltextSearch} : undefined,
                    contains: planName ? {
                        key: 'start.exact_plan_name',
                        value: planName
                    }
                    : undefined
                }
            };
            try {
                const results:TiledSearchResult | null = await getSearchResults(searchConfig);
                console.log("ExperimentHistory search results:", results);
                setSearchResults(results);
            } catch (error) {
                console.error("Error fetching ExperimentHistory data:", error);
            }
        };
        fetchData();
    }, [planName, metadataFulltextSearch]);

    return (
    <section>
        {searchResults ? (
            <>
                {metadataFulltextSearch && <p className="text-slate-500 pl-2">Showing results for user: "{metadataFulltextSearch}"</p>}
                <div className="overflow-y-auto h-fit">
                    <table className={className}>
                    <thead>
                        <tr className="text-sky-900">
                            <th className="px-2 py-2">Date</th>
                            <th className="px-2 py-2">ID</th>
                            <th className="px-2 py-2">Status</th>
                            <th className="px-2 py-2">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {searchResults.data.map((item) => {
                            let startTime = item?.attributes?.metadata?.start?.time;
                            let formattedStartTime = startTime ? dayjs.unix(startTime).format('MM/DD h:mm A') : "N/A";
                            let endTime = item?.attributes?.metadata?.stop?.time;
                            let duration = startTime && endTime ? dayjs.unix(endTime).diff(dayjs.unix(startTime), 'second') + " s" : "N/A";
                            let status = item?.attributes?.metadata?.stop ? item?.attributes?.metadata?.stop?.exit_status : "running";
                            let metadataSummary = item?.attributes?.metadata ? JSON.stringify(item.attributes.metadata).slice(0, 100) + "..." : "N/A";
                            return (
                                <tr key={item.id} className={`mb-2 p-2 text-slate-800 font-light mx-2 hover:bg-sky-200 cursor-pointer ${
                                    enablePersistentSelection && selectedItemId === item.id 
                                        ? 'bg-sky-300' 
                                        : 'bg-white/10'
                                }`} onClick={()=>{
                                    if (enablePersistentSelection) {
                                        setSelectedItemId(item.id);
                                    }
                                    onItemClick && onItemClick(item);
                                }}>
                                    <td className="px-2 py-2">{formattedStartTime}</td>
                                    <td className="px-2 py-2 max-w-24 truncate">{item.id}</td>
                                    <td className="px-2 py-2">{status}</td>
                                    <td className="px-2 py-2 text-center">{duration}</td>
                                </tr>
                            )
                        }
                        )}
                    </tbody>
                </table>
                </div>
            </>
        )
            :
            <div className="flex items-center gap-2 text-gray-800">
                <SpinnerGap size={24} weight="bold" className="animate-spin" />
                <p>Loading experiment history {metadataFulltextSearch ? `for user "${metadataFulltextSearch}"` : ""}...</p>
            </div>
        }       
    </section>
    )
}