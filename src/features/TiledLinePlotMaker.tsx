import { useState, useEffect } from 'react';
import TiledWriterMultiScatterPlot from '@/components/Tiled/TiledWriterMultiScatterPlot';
import { TiledSearchConfig, TiledSearchResult, getSearchResults } from '@blueskyproject/tiled';
import { Shuffle, Sliders, PaintBrush } from '@phosphor-icons/react';
import { Tooltip } from 'react-tooltip';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import '@/components/style.css';

function Row({ label, value }: { label: string; value: string | number }) {
    return (
        <p>
            <span className="text-slate-400">{label}: </span>
            <span className="text-white">{value}</span>
        </p>
    );
}

function itemLabel(meta: Record<string, unknown> | undefined, id: string): string {
    const start = meta?.start as Record<string, unknown> | undefined;
    const time = start?.time as number | undefined;
    const datePart = time ? dayjs.unix(time).format('MM/DD') : null;
    const timePart = time ? dayjs.unix(time).format('HH:mm') : null;
    const sample = start?.sample as string | undefined;
    const userMeta = (start?.sample_name ??
        start?.user ??
        start?.operator ??
        start?.proposal_id) as string | undefined;
    const parts = [datePart, timePart, sample, userMeta, id].filter(Boolean);
    return parts.join('  ');
}
export type TiledLinePlotMakerProps = {
    /** Base URL of the Tiled server to search for data to plot. */
    tiledBaseUrl?: string;
    /** Optional initial path used in the Tiled server search. */
    initialPath?: string;
    /** Optional class name for the component. */
    classNameContainer?: string;
    /** Optional class name for the component. */
    classNameInnerContainer?: string;
    /**Optional class name for the plot container */
    classNamePlot?: string;
};
export default function TiledLinePlotMaker({
    tiledBaseUrl,
    initialPath,
    classNameContainer,
    classNameInnerContainer,
    classNamePlot,
}: TiledLinePlotMakerProps) {
    const [blueskyIds, setBlueskyIds] = useState<string[]>([]);
    const [traceNames, setTraceNames] = useState<Record<string, string>>({});
    const [plotTitle, setPlotTitle] = useState('');
    const [xAxis, setXAxis] = useState(
        import.meta.env.VITE_XAS_SCATTER_X ?? 'mono_energy_energy_eV',
    );
    const [yAxis, setYAxis] = useState(import.meta.env.VITE_XAS_SCATTER_Y ?? 'amptek_fluo_roi_sum');
    const handleIDSelect = (id: string) => {
        setBlueskyIds((prev) => [...prev, id]);
    };
    const handleIDUnselect = (id: string) => {
        setBlueskyIds((prev) => prev.filter((existingId) => existingId !== id));
    };
    const [searchResults, setSearchResults] = useState<TiledSearchResult | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            //eventually uncomment this and get the key contains working once that's updated in tiled api
            const searchConfig: TiledSearchConfig = {
                options: {
                    sort: '-',
                },
                filters: {
                    specs: { include: ['BlueskyRun'], exclude: [] },
                },
                initialPath,
                baseUrl: tiledBaseUrl,
            };
            try {
                const results: TiledSearchResult | null = await getSearchResults(searchConfig);
                setSearchResults(results);
            } catch (error) {
                console.error('Error fetching ExperimentHistory data:', error);
            }
        };
        fetchData();
    }, [initialPath, tiledBaseUrl]);
    return (
        <article
            className={cn(
                'h-[52rem] min-h-fit w-fit flex space-x-8 p-4 bg-slate-200 text-slate-700 rounded-md shadow-md',
                classNameContainer,
            )}
        >
            <div
                className={cn(
                    'flex flex-col h-full overflow-auto border-r-2 border-slate-300 pr-8',
                    classNameInnerContainer,
                )}
            >
                {/* Plot Settings Inputs */}
                <section className="mb-8 max-w-72">
                    <span className="flex space-x-4 items-center mb-4">
                        <Sliders size={20} className="inline mr-1" />
                        <h3>Plot Settings</h3>
                    </span>
                    <div className="flex flex-col gap-2 text-sm">
                        <label className="flex items-center gap-2">
                            <span className="w-12 text-slate-500">Title</span>
                            <input
                                type="text"
                                value={plotTitle}
                                onChange={(e) => setPlotTitle(e.target.value)}
                                placeholder="Plot title"
                                className="border border-gray-300 rounded px-2 py-0.5 flex-1"
                            />
                        </label>
                        <label className="flex items-center gap-2">
                            <span className="w-12 text-slate-500">X Axis</span>
                            <input
                                type="text"
                                value={xAxis}
                                onChange={(e) => setXAxis(e.target.value)}
                                placeholder="Column name"
                                className="border border-gray-300 rounded px-2 py-0.5 flex-1"
                                data-tooltip-id="axis-input-tooltip"
                                data-tooltip-content="The column name from the Tiled tabular data to plot on the X axis. An exact string match is required."
                            />
                        </label>
                        <label className="flex items-center gap-2">
                            <span className="w-12 text-slate-500">Y Axis</span>
                            <input
                                type="text"
                                value={yAxis}
                                onChange={(e) => setYAxis(e.target.value)}
                                placeholder="Column name"
                                className="border border-gray-300 rounded px-2 py-0.5 flex-1"
                                data-tooltip-id="axis-input-tooltip"
                                data-tooltip-content="The column name from the Tiled tabular data to plot on the Y axis. An exact string match is required."
                            />
                        </label>
                        <Tooltip
                            id="axis-input-tooltip"
                            place="right"
                            className="max-w-56 text-xs"
                        />
                    </div>
                </section>

                {/* Data Selection Table */}
                <section>
                    <span className="flex space-x-4 items-center mb-4">
                        <PaintBrush size={20} className="inline mr-1" />
                        <h3> Data Picker</h3>
                    </span>
                    <div className="flex flex-col h-[36rem] bg-white text-slate-800 border border-slate-300 rounded-md pb-2">
                        <span className="w-full flex text-slate-600 font-light py-2">
                            <p className="w-1/2 text-center">All Data</p>
                            <p className="w-1/2 text-center">Selected Data</p>
                        </span>
                        <div className="flex flex-grow min-h-0 px-2">
                            {/* All Data For selection */}
                            <ul className="w-72 h-full overflow-y-auto rounded-scrollbar border-r-2 borer-slate-300 pr-2">
                                {searchResults &&
                                    searchResults.data.map((item) => {
                                        const meta = item?.attributes?.metadata;
                                        const startTime = meta?.start?.time;
                                        const endTime = meta?.stop?.time;
                                        const tooltipContent = JSON.stringify({
                                            id: item.id,
                                            scanId: meta?.start?.scan_id,
                                            sample: (meta?.start as { sample?: string } | undefined)
                                                ?.sample,
                                            plan: meta?.start?.plan_name,
                                            detectors: meta?.start?.detectors?.join(', '),
                                            numPoints: meta?.start?.num_points,
                                            start: startTime
                                                ? dayjs.unix(startTime).format('MM/DD/YY h:mm A')
                                                : null,
                                            duration:
                                                startTime && endTime
                                                    ? dayjs
                                                          .unix(endTime)
                                                          .diff(dayjs.unix(startTime), 'second')
                                                    : null,
                                            status: meta?.stop?.exit_status ?? 'running',
                                        });
                                        const isSelected = blueskyIds.includes(item.id);
                                        return (
                                            <li
                                                className={`flex items-center gap-1 px-1 text-sm w-full min-w-0 pb-1 ${isSelected ? 'text-slate-300 hover:text-slate-800' : 'text-slate-800 hover:text-slate-500'} hover:cursor-pointer text-sm`}
                                                key={item.id}
                                                data-tooltip-id="run-meta-tooltip"
                                                data-tooltip-content={tooltipContent}
                                                onClick={
                                                    isSelected
                                                        ? () => handleIDUnselect(item.id)
                                                        : () => handleIDSelect(item.id)
                                                }
                                            >
                                                <p className="truncate flex-1 min-w-0">
                                                    {itemLabel(
                                                        meta as Record<string, unknown>,
                                                        item.id,
                                                    )}
                                                </p>
                                                <Shuffle size={14} className="shrink-0" />
                                            </li>
                                        );
                                    })}
                            </ul>
                            <Tooltip
                                id="run-meta-tooltip"
                                place="right"
                                render={({ content }) => {
                                    if (!content) return null;
                                    const d = JSON.parse(content);
                                    return (
                                        <div className="text-xs space-y-1 max-w-56">
                                            <p className="font-semibold text-white truncate">
                                                {d.id}
                                            </p>
                                            <hr className="border-slate-500" />
                                            {d.sample && <Row label="Sample" value={d.sample} />}
                                            {d.scanId != null && (
                                                <Row label="Scan ID" value={d.scanId} />
                                            )}
                                            {d.plan && <Row label="Plan" value={d.plan} />}
                                            {d.detectors && (
                                                <Row label="Detectors" value={d.detectors} />
                                            )}
                                            {d.numPoints != null && (
                                                <Row label="Points" value={d.numPoints} />
                                            )}
                                            {d.start && <Row label="Start" value={d.start} />}
                                            {d.duration != null && (
                                                <Row label="Duration" value={`${d.duration} s`} />
                                            )}
                                            <Row label="Status" value={d.status} />
                                        </div>
                                    );
                                }}
                            />
                            {/* Currently Selected items */}
                            <ul className="w-72 h-full overflow-y-auto rounded-scrollbar text-slate-800 pl-2">
                                {blueskyIds.length === 0 && (
                                    <li className="p-2 text-sm text-sky-900 animate-pulse">
                                        Select a data set...
                                    </li>
                                )}
                                {blueskyIds.map((id) => {
                                    const item = searchResults?.data.find((r) => r.id === id);
                                    const meta = item?.attributes?.metadata;
                                    const startTime = meta?.start?.time;
                                    const endTime = meta?.stop?.time;
                                    const tooltipContent = JSON.stringify({
                                        id,
                                        sample: (meta?.start as { sample?: string } | undefined)
                                            ?.sample,
                                        scanId: meta?.start?.scan_id,
                                        plan: meta?.start?.plan_name,
                                        detectors: meta?.start?.detectors?.join(', '),
                                        numPoints: meta?.start?.num_points,
                                        start: startTime
                                            ? dayjs.unix(startTime).format('MM/DD/YY h:mm A')
                                            : null,
                                        duration:
                                            startTime && endTime
                                                ? dayjs
                                                      .unix(endTime)
                                                      .diff(dayjs.unix(startTime), 'second')
                                                : null,
                                        status: meta?.stop?.exit_status ?? 'running',
                                    });
                                    return (
                                        <li
                                            key={id}
                                            className="flex items-center gap-2 pb-1 px-1 text-slate-800"
                                        >
                                            <span
                                                className="flex items-center gap-2 flex-1 min-w-0 hover:text-slate-500 hover:cursor-pointer"
                                                data-tooltip-id="run-meta-tooltip-left"
                                                data-tooltip-content={tooltipContent}
                                                onClick={() => handleIDUnselect(id)}
                                            >
                                                <Shuffle
                                                    size={14}
                                                    className="shrink-0 scale-x-[-1]"
                                                />
                                                <p className="truncate flex-1 min-w-0 text-sm">
                                                    {itemLabel(meta as Record<string, unknown>, id)}
                                                </p>
                                            </span>
                                            <input
                                                type="text"
                                                placeholder={id.slice(0, 4)}
                                                value={traceNames[id] ?? ''}
                                                onChange={(e) =>
                                                    setTraceNames((prev) => ({
                                                        ...prev,
                                                        [id]: e.target.value,
                                                    }))
                                                }
                                                className="w-24 shrink-0 border border-gray-300 rounded px-1 py-0.5 text-sm text-slate-800"
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                            <Tooltip
                                id="run-meta-tooltip-left"
                                place="left"
                                render={({ content }) => {
                                    if (!content) return null;
                                    const d = JSON.parse(content);
                                    return (
                                        <div className="text-xs space-y-1 max-w-56">
                                            <p className="font-semibold text-white truncate">
                                                {d.id}
                                            </p>
                                            <hr className="border-slate-500" />
                                            {d.sample && <Row label="Sample" value={d.sample} />}
                                            {d.scanId != null && (
                                                <Row label="Scan ID" value={d.scanId} />
                                            )}
                                            {d.plan && <Row label="Plan" value={d.plan} />}
                                            {d.detectors && (
                                                <Row label="Detectors" value={d.detectors} />
                                            )}
                                            {d.numPoints != null && (
                                                <Row label="Points" value={d.numPoints} />
                                            )}
                                            {d.start && <Row label="Start" value={d.start} />}
                                            {d.duration != null && (
                                                <Row label="Duration" value={`${d.duration} s`} />
                                            )}
                                            <Row label="Status" value={d.status} />
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Scatter Plot */}
            <TiledWriterMultiScatterPlot
                tiledTrace={{ x: xAxis, y: yAxis }}
                blueskyRunIds={blueskyIds}
                traceNames={blueskyIds.map((id) => traceNames[id] || id.slice(0, 4))}
                title={plotTitle || undefined}
                className={cn('h-full border-2 border-black/20', classNamePlot)}
                plotClassName="h-full"
            />
        </article>
    );
}
