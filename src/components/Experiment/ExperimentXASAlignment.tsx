//Exploratory scan component, not for publishing

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ExperimentExecutePlanButtonGeneric from './ExperimentExecutePlanButtonGeneric';
import { useQueueQuery } from '@/api/qServer/hooks';
import TiledWriterScatterPlot from '@/components/Tiled/TiledWriterScatterPlot';
import { useGetBlueskyRunList } from '@/components/QServer/utils/qServerApiUtils';
import ExperimentHistory from './ExperimentHistory';
import { useSearchResultsQuery } from '@/api/tiled/hooks';

import { ClockCounterClockwise, PersonSimpleRun, ChartLine } from '@phosphor-icons/react';
import { PostItemAddResponse } from '@/api/qServer/types';
import { cn } from '@/lib/utils';
import { TiledSearchItem, TiledStructures } from '../Tiled/types/tempTypes';

type ExperimentXASAlignmentProps = {
    /** Additional CSS class names to apply to the root container. */
    className?: string;
    /** Callback invoked after a successful plan execution. Receives the raw API response. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan execution fails. Receives a human-readable error message. */
    onError?: (error: string) => void;
    /** The base Tiled url */
    tiledBaseUrl?: string;
};

const getLs = (key: string, fallback: number) => {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === '') return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
};

function readStartField(
    item: TiledSearchItem<TiledStructures> | undefined,
    key: string,
): string | undefined {
    const start = item?.attributes?.metadata?.start as Record<string, unknown> | undefined;
    const value = start?.[key];
    return typeof value === 'string' ? value : undefined;
}

export default function ExperimentXASAlignment({
    className,
    onSuccess,
    onError,
    tiledBaseUrl,
}: ExperimentXASAlignmentProps) {
    const [user, setUser] = useState<string>(localStorage.getItem('xas_alignment_user') ?? '');
    const [sample, setSample] = useState<string>(
        localStorage.getItem('xas_alignment_sample') ?? '',
    );
    const [startZ, setStartZ] = useState<number | ''>(getLs('xas_alignment_start_z', -1));
    const [stopZ, setStopZ] = useState<number | ''>(getLs('xas_alignment_stop_z', -5));
    const [numZ, setNumZ] = useState<number | ''>(getLs('xas_alignment_num_z', 21));
    const [startY, setStartY] = useState<number | ''>(getLs('xas_alignment_start_y', -10));
    const [stopY, setStopY] = useState<number | ''>(getLs('xas_alignment_stop_y', -12));
    const [numY, setNumY] = useState<number | ''>(getLs('xas_alignment_num_y', 21));
    const [executedItemUid, setExecutedItemUid] = useState<string>('');
    const [currentSequenceUid, setCurrentSequenceUid] = useState<string>('');
    const [viewMode, setViewMode] = useState<'form' | 'history'>('form');

    // Keep the queue query around so the Execute button can detect a busy queue.
    useQueueQuery({ refetchInterval: 1000 });

    useEffect(() => {
        localStorage.setItem('xas_alignment_user', user);
        localStorage.setItem('xas_alignment_sample', sample);
        localStorage.setItem('xas_alignment_start_z', startZ.toString());
        localStorage.setItem('xas_alignment_stop_z', stopZ.toString());
        localStorage.setItem('xas_alignment_num_z', numZ.toString());
        localStorage.setItem('xas_alignment_start_y', startY.toString());
        localStorage.setItem('xas_alignment_stop_y', stopY.toString());
        localStorage.setItem('xas_alignment_num_y', numY.toString());
    }, [user, sample, startZ, stopZ, numZ, startY, stopY, numY]);

    const getBlueskyRunList = useGetBlueskyRunList();

    // ── User-initiated discovery ──────────────────────────────────────────────
    // After Execute, poll the queue server for the run UIDs associated with this
    // queue item. Stop polling as soon as we have one UID (we use it to look up
    // the alignment_sequence_uid in Tiled and then find both siblings by that).
    const { data: runList = [] } = useQuery<string[]>({
        queryKey: ['bluesky-run-list', executedItemUid],
        queryFn: () => getBlueskyRunList(executedItemUid),
        enabled: !!executedItemUid,
        refetchInterval: (query) => {
            const data = query.state.data;
            return data && Array.isArray(data) && data.length > 0 ? false : 1000;
        },
        refetchIntervalInBackground: true,
        retry: (failureCount) => failureCount < 30,
        retryDelay: 1000,
        staleTime: 500,
    });

    const firstUserRunId = runList[0] ?? '';

    // Look up the first user-initiated run's metadata to extract sequence_uid.
    const { data: firstRunMeta } = useSearchResultsQuery(
        {
            options: { pageLimit: 1 },
            filters: {
                specs: { include: ['BlueskyRun'], exclude: [] },
                contains: { key: 'start.uid', value: firstUserRunId },
            },
        },
        {
            enabled: !!firstUserRunId,
            refetchInterval: (query) => {
                const seq = readStartField(query.state.data?.data[0], 'alignment_sequence_uid');
                return seq ? false : 2000;
            },
        },
    );
    const userSequenceUid = readStartField(firstRunMeta?.data[0], 'alignment_sequence_uid') ?? '';

    // ── External-start detection ──────────────────────────────────────────────
    // Poll Tiled for the most recent xas_alignment run started anywhere (e.g.
    // from a notebook). If its sequence_uid differs from the one being shown,
    // switch to it.
    const { data: latestAlignmentResult } = useSearchResultsQuery(
        {
            options: { pageLimit: 1, sort: '-' },
            filters: {
                specs: { include: ['BlueskyRun'], exclude: [] },
                contains: { key: 'start.plan_name', value: 'xas_alignment' },
            },
        },
        { refetchInterval: 5000 },
    );
    const externalSequenceUid =
        readStartField(latestAlignmentResult?.data[0], 'alignment_sequence_uid') ?? '';

    // ── Funnel all three discovery paths into currentSequenceUid ──────────────
    useEffect(() => {
        if (viewMode === 'history') return;
        if (userSequenceUid && userSequenceUid !== currentSequenceUid) {
            setCurrentSequenceUid(userSequenceUid);
            return;
        }
        if (!executedItemUid && externalSequenceUid && externalSequenceUid !== currentSequenceUid) {
            setCurrentSequenceUid(externalSequenceUid);
        }
    }, [userSequenceUid, externalSequenceUid, executedItemUid, viewMode, currentSequenceUid]);

    // ── Sibling resolution: find both runs sharing the sequence_uid ───────────
    const { data: siblings } = useSearchResultsQuery(
        {
            options: { pageLimit: 5, sort: '-' },
            filters: {
                specs: { include: ['BlueskyRun'], exclude: [] },
                contains: { key: 'start.alignment_sequence_uid', value: currentSequenceUid },
            },
        },
        {
            enabled: !!currentSequenceUid,
            refetchInterval: (query) => {
                const items = query.state.data?.data ?? [];
                const hasZ = items.some((r) => readStartField(r, 'alignment_role') === 'z_scan');
                const hasY = items.some((r) => readStartField(r, 'alignment_role') === 'y_scan');
                return hasZ && hasY ? false : 2000;
            },
        },
    );

    const zRunId =
        siblings?.data.find((r) => readStartField(r, 'alignment_role') === 'z_scan')?.id ?? '';
    const yRunId =
        siblings?.data.find((r) => readStartField(r, 'alignment_role') === 'y_scan')?.id ?? '';

    const makeNumberHandler =
        (setter: React.Dispatch<React.SetStateAction<number | ''>>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            setter(v === '' ? '' : Number(v));
        };

    const handleSuccess = (response: PostItemAddResponse) => {
        if (response.item && 'item_uid' in response.item) {
            setExecutedItemUid(response.item.item_uid);
            setCurrentSequenceUid('');
        }
        onSuccess?.(response);
    };

    const handleError = (error: string) => {
        console.error('XAS alignment execution failed:', error);
        onError?.(error);
    };

    const zTrace = {
        x: import.meta.env.VITE_ALIGNMENT_Z_X ?? 'hexapod_motor_Tz_readback',
        y: import.meta.env.VITE_ALIGNMENT_Z_Y ?? 'amptek_fluo_roi_sum',
    };
    const yTrace = {
        x: import.meta.env.VITE_ALIGNMENT_Y_X ?? 'hexapod_motor_Ty_readback',
        y: import.meta.env.VITE_ALIGNMENT_Y_Y ?? 'amptek_fluo_roi_sum',
    };

    return (
        <div className={cn('text-slate-700', className)}>
            <h2 className="text-xl font-bold mb-4 text-white">XAS Alignment</h2>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4 h-fit min-h-[48rem]">
                <div className="flex gap-6">
                    <div className="w-96 space-y-4">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-12">
                                <button
                                    onClick={() => {
                                        setViewMode('form');
                                        setCurrentSequenceUid('');
                                        setExecutedItemUid('');
                                    }}
                                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                                        viewMode === 'form'
                                            ? 'text-sky-800'
                                            : 'text-gray-400 hover:text-sky-600'
                                    }`}
                                    title="Run new alignment"
                                >
                                    <PersonSimpleRun size={24} weight="regular" />
                                    <span className="text-xs font-light">Run</span>
                                    {viewMode === 'form' && (
                                        <div className="h-0.5 w-full bg-sky-800" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setViewMode('history')}
                                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                                        viewMode === 'history'
                                            ? 'text-sky-800'
                                            : 'text-gray-400 hover:text-sky-600'
                                    }`}
                                    title="View alignment history"
                                >
                                    <ClockCounterClockwise size={24} weight="regular" />
                                    <span className="text-xs font-light">History</span>
                                    {viewMode === 'history' && (
                                        <div className="h-0.5 w-full bg-sky-800" />
                                    )}
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
                                    <label className="block text-sm font-medium mb-1">
                                        Sample:
                                    </label>
                                    <input
                                        type="text"
                                        value={sample}
                                        onChange={(e) => setSample(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter sample name"
                                    />
                                </div>
                                <fieldset className="border border-gray-300 rounded-md p-3 space-y-2">
                                    <legend className="text-sm font-semibold px-1">
                                        Z (vertical)
                                    </legend>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Start
                                            </label>
                                            <input
                                                type="number"
                                                value={startZ}
                                                onChange={makeNumberHandler(setStartZ)}
                                                min={-4000}
                                                max={4000}
                                                step="0.1"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Stop
                                            </label>
                                            <input
                                                type="number"
                                                value={stopZ}
                                                onChange={makeNumberHandler(setStopZ)}
                                                min={-4000}
                                                max={4000}
                                                step="0.1"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Num
                                            </label>
                                            <input
                                                type="number"
                                                value={numZ}
                                                onChange={makeNumberHandler(setNumZ)}
                                                min={0}
                                                max={200}
                                                step="1"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                                <fieldset className="border border-gray-300 rounded-md p-3 space-y-2">
                                    <legend className="text-sm font-semibold px-1">
                                        Y (horizontal)
                                    </legend>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Start
                                            </label>
                                            <input
                                                type="number"
                                                value={startY}
                                                onChange={makeNumberHandler(setStartY)}
                                                min={-4000}
                                                max={4000}
                                                step="0.1"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Stop
                                            </label>
                                            <input
                                                type="number"
                                                value={stopY}
                                                onChange={makeNumberHandler(setStopY)}
                                                min={-4000}
                                                max={4000}
                                                step="0.1"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">
                                                Num
                                            </label>
                                            <input
                                                type="number"
                                                value={numY}
                                                onChange={makeNumberHandler(setNumY)}
                                                min={0}
                                                max={200}
                                                step="1"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                                <div className="flex items-start justify-center pt-2">
                                    <ExperimentExecutePlanButtonGeneric
                                        planName="xas_alignment"
                                        kwargs={{
                                            start_Z: startZ,
                                            stop_Z: stopZ,
                                            num_Z: numZ,
                                            start_Y: startY,
                                            stop_Y: stopY,
                                            num_Y: numY,
                                            md: { exact_plan_name: 'xas_alignment', user, sample },
                                        }}
                                        onSuccess={handleSuccess}
                                        onError={handleError}
                                    />
                                </div>
                            </>
                        ) : (
                            <ExperimentHistory
                                planName="alignment_scan_z"
                                metadataFulltextSearch={user}
                                onItemClick={(item) => {
                                    const seq = readStartField(item, 'alignment_sequence_uid');
                                    if (seq) setCurrentSequenceUid(seq);
                                }}
                                enablePersistentSelection={true}
                                initialSelectedItemId={currentSequenceUid}
                            />
                        )}
                    </div>

                    <div className="flex flex-col min-w-96 flex-grow border-l-2 border-slate-300 pl-4 min-h-[45rem]">
                        <span className="flex flex-start gap-8">
                            <button
                                className="flex flex-col items-center gap-1 p-2 transition-colors text-sky-800"
                                title="Line Plot"
                                disabled={true}
                            >
                                <ChartLine size={24} weight="regular" />
                                <span className="text-xs font-light">Line Plot</span>
                            </button>
                        </span>

                        <div
                            className="flex flex-grow flex-row gap-4 h-fit justify-center"
                            key={viewMode}
                        >
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-sm font-medium text-center text-slate-600 mb-1">
                                    Z scan
                                </h3>
                                <TiledWriterScatterPlot
                                    key={zRunId || 'z-empty'}
                                    blueskyRunId={zRunId}
                                    tiledTrace={zTrace}
                                    className="max-h-[42rem] h-[42rem]"
                                    plotClassName="h-[calc(100%-2rem)]"
                                    showStatusText={false}
                                    tiledBaseUrl={tiledBaseUrl}
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-sm font-medium text-center text-slate-600 mb-1">
                                    Y scan
                                </h3>
                                <TiledWriterScatterPlot
                                    key={yRunId || 'y-empty'}
                                    blueskyRunId={yRunId}
                                    tiledTrace={yTrace}
                                    className="max-h-[42rem] h-[42rem]"
                                    plotClassName="h-[calc(100%-2rem)]"
                                    showStatusText={false}
                                    tiledBaseUrl={tiledBaseUrl}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
