//Exploratory scan component, not for publishing

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ExperimentExecutePlanButtonGeneric from './ExperimentExecutePlanButtonGeneric';
import { useQueueQuery, useExecuteQueueItemMutation } from '@/api/qServer/hooks';
import TiledWriterScatterPlot from '@/components/Tiled/TiledWriterScatterPlot';
import { useGetBlueskyRunList } from '@/components/QServer/utils/qServerApiUtils';
import ExperimentHistory from './ExperimentHistory';

import { ClockCounterClockwise, PersonSimpleRun, ChartLine } from '@phosphor-icons/react';
import { PostItemAddResponse } from '@/api/qServer/types';
import { cn } from '@/lib/utils';
import { useSearchResultsQuery } from '@/api/tiled/hooks';

type ExperimentXASScanProps = {
    /** Additional CSS class names to apply to the root container. */
    className?: string;
    /** Callback invoked after a successful plan execution. Receives the raw API response. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan execution fails. Receives a human-readable error message. */
    onError?: (error: string) => void;
    /** The base Tiled url */
    tiledBaseUrl?: string;
};
const getLocalStorageNumber = (key: string, fallback: number) => {
    const stored = localStorage.getItem(key);
    return stored !== null ? Number(stored) : fallback;
};
const getLocalStorageEnergyStart = () => getLocalStorageNumber('xas_start_energy', 9000);
const getLocalStorageEnergyStop = () => getLocalStorageNumber('xas_stop_energy', 10000);
const getLocalStorageNumPoints = () => getLocalStorageNumber('xas_num_points', 10);
const getLocalStorageRoiLow = () => getLocalStorageNumber('xas_roi_low', 1800);
const getLocalStorageRoiHigh = () => getLocalStorageNumber('xas_roi_high', 2750);
export default function ExperimentXASScan({
    className,
    onSuccess,
    onError,
    tiledBaseUrl,
}: ExperimentXASScanProps) {
    // Angle scan form state
    const [user, setUser] = useState<string>(localStorage.getItem('angle_scan_user') ?? '');
    const [startEnergy, setStartEnergy] = useState<number | ''>(
        getLocalStorageEnergyStart() as number,
    );
    const [stopEnergy, setStopEnergy] = useState<number | ''>(
        getLocalStorageEnergyStop() as number,
    );
    const [roiLow, setRoiLow] = useState<number | ''>(getLocalStorageRoiLow() as number);
    const [roiHigh, setRoiHigh] = useState<number | ''>(getLocalStorageRoiHigh() as number);
    const [numPoints, setNumPoints] = useState<number | ''>(getLocalStorageNumPoints() as number);
    const [sample, setSample] = useState<string>(localStorage.getItem('xas_sample') ?? '');
    const [executedItemUid, setExecutedItemUid] = useState<string>('');
    const [viewMode, setViewMode] = useState<'form' | 'history'>('form');
    const [blueskyRunId, setBlueskyRunId] = useState<string>('');
    const [autoMode, setAutoMode] = useState(false);

    const queueQuery = useQueueQuery({ refetchInterval: 1000 });
    const executeMutation = useExecuteQueueItemMutation();
    const isQueueBusy = queueQuery.data?.running_item
        ? Object.keys(queueQuery.data.running_item).length > 0
        : false;
    // Prevent double-firing: track whether we already submitted in this idle window
    const autoSubmittedRef = useRef(false);

    // Energy scan form handlers
    const handleStartEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStartEnergy(value === '' ? '' : Number(value));
    };

    const handleStopEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStopEnergy(value === '' ? '' : Number(value));
    };

    const handleNumPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNumPoints(value === '' ? '' : Number(value));
    };

    const handleRoiLowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRoiLow(value === '' ? '' : Number(value));
    };

    const handleRoiHighChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRoiHigh(value === '' ? '' : Number(value));
    };

    const handleSampleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSample(value);
    };

    const handleSuccess = useCallback(
        async (response: PostItemAddResponse) => {
            console.log('XAS scan executed successfully!', response);

            // Set the item UID to trigger TanStack Query polling
            if (response.item && 'item_uid' in response.item) {
                setExecutedItemUid(response.item.item_uid);
            }

            onSuccess?.(response);
        },
        [onSuccess],
    );

    const handleError = useCallback(
        (error: string) => {
            console.error('XAS scan execution failed:', error);
            alert(`XAS scan execution failed: ${error}`);
            onError?.(error);
        },
        [onError],
    );

    useEffect(() => {
        localStorage.setItem('angle_scan_user', user);
        localStorage.setItem('xas_start_energy', startEnergy.toString());
        localStorage.setItem('xas_stop_energy', stopEnergy.toString());
        localStorage.setItem('xas_num_points', numPoints.toString());
        localStorage.setItem('xas_roi_low', roiLow.toString());
        localStorage.setItem('xas_roi_high', roiHigh.toString());
        localStorage.setItem('xas_sample', sample);
    }, [user, startEnergy, stopEnergy, numPoints, sample, roiHigh, roiLow]);

    const getBlueskyRunList = useGetBlueskyRunList();

    // TanStack Query to poll for Bluesky run list until we get results
    const { data: runList = [] } = useQuery<string[]>({
        queryKey: ['bluesky-run-list', executedItemUid],
        queryFn: () => getBlueskyRunList(executedItemUid),
        enabled: !!executedItemUid, // Only run when we have an item UID
        refetchInterval: (query) => {
            // Stop polling if we have at least one run or if there's an error
            const data = query.state.data;
            return data && Array.isArray(data) && data.length > 0 ? false : 1000;
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
    const pollRunId = runList && runList.length > 0 ? runList[0] : '';

    // Update blueskyRunId when polling returns new run
    useEffect(() => {
        if (pollRunId) {
            console.log('Found Bluesky run ID from polling:', pollRunId);
            setBlueskyRunId(pollRunId);
        }
    }, [pollRunId]);

    // Poll Tiled for the most recent xas_scan run and sync if started externally
    const { data: latestXasScanResult } = useSearchResultsQuery(
        {
            options: { pageLimit: 1, sort: '-' },
            filters: {
                specs: { include: ['BlueskyRun'], exclude: [] },
                contains: { key: 'start.exact_plan_name', value: 'xas_scan' },
            },
        },
        { refetchInterval: 5000 },
    );

    useEffect(() => {
        if (viewMode === 'history') return;
        const tiledRunId = latestXasScanResult?.data[0]?.id;
        if (!tiledRunId || tiledRunId === blueskyRunId) return;
        setBlueskyRunId(tiledRunId);
    }, [latestXasScanResult, blueskyRunId, viewMode]);

    // Auto mode: fire plan 3 s after queue becomes idle
    useEffect(() => {
        if (!autoMode || isQueueBusy || autoSubmittedRef.current || executeMutation.isPending) {
            if (!autoMode || isQueueBusy) autoSubmittedRef.current = false;
            return;
        }

        const timer = setTimeout(() => {
            if (autoSubmittedRef.current) return;
            autoSubmittedRef.current = true;
            executeMutation.mutate(
                {
                    item: {
                        name: 'xas_scan',
                        kwargs: {
                            roi_low: roiLow,
                            roi_high: roiHigh,
                            start_eV: startEnergy,
                            stop_eV: stopEnergy,
                            num: numPoints,
                            md: { exact_plan_name: 'xas_scan', user, sample },
                        },
                        item_type: 'plan',
                    },
                },
                {
                    onSuccess: (response) => {
                        if (response.success) handleSuccess(response);
                        else handleError(response.msg || 'Failed to execute xas_scan plan');
                    },
                    onError: (err) =>
                        handleError(err instanceof Error ? err.message : 'Network error'),
                },
            );
        }, 3000);

        return () => clearTimeout(timer);
    }, [
        handleError,
        handleSuccess,
        autoMode,
        isQueueBusy,
        executeMutation.isPending,
        executeMutation,
        roiLow,
        roiHigh,
        startEnergy,
        stopEnergy,
        numPoints,
        user,
        sample,
    ]);

    return (
        <div className={cn('text-slate-700', className)}>
            <h2 className="text-xl font-bold mb-4 text-white">XAS Scan</h2>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4 h-fit min-h-[48rem]">
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
                                    title="View scan history"
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
                                        onChange={handleSampleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter sample name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Start Energy (eV):
                                    </label>
                                    <input
                                        type="number"
                                        value={startEnergy}
                                        onChange={handleStartEnergyChange}
                                        min="2400"
                                        max="12000"
                                        step="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Stop Energy (eV):
                                    </label>
                                    <input
                                        type="number"
                                        value={stopEnergy}
                                        onChange={handleStopEnergyChange}
                                        min="2400"
                                        max="12000"
                                        step="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                {/* ROI Inputs */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        ROI Low:
                                    </label>
                                    <input
                                        type="number"
                                        value={roiLow}
                                        onChange={handleRoiLowChange}
                                        min="1800"
                                        max="2750"
                                        step="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        ROI High:
                                    </label>
                                    <input
                                        type="number"
                                        value={roiHigh}
                                        onChange={handleRoiHighChange}
                                        min="1800"
                                        max="2750"
                                        step="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Number of Points:
                                    </label>
                                    <input
                                        type="number"
                                        value={numPoints}
                                        onChange={handleNumPointsChange}
                                        min="2"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div className="flex items-start justify-around">
                                    <div className="flex flex-col">
                                        <div className="pt-2 m-auto w-fit">
                                            <ExperimentExecutePlanButtonGeneric
                                                planName="xas_scan"
                                                kwargs={{
                                                    roi_low: roiLow,
                                                    roi_high: roiHigh,
                                                    start_eV: startEnergy,
                                                    stop_eV: stopEnergy,
                                                    num: numPoints,
                                                    md: {
                                                        exact_plan_name: 'xas_scan',
                                                        user: user,
                                                        sample: sample,
                                                    },
                                                }}
                                                onSuccess={handleSuccess}
                                                onError={handleError}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center ml-4 gap-1">
                                        <span className="text-xs text-gray-500 text-center">
                                            Execution Mode
                                        </span>
                                        <button
                                            onClick={() => setAutoMode((prev) => !prev)}
                                            className={cn(
                                                'relative flex items-center w-28 h-7 rounded-full border transition-colors text-xs font-medium select-none',
                                                autoMode
                                                    ? 'bg-sky-700 border-sky-800 text-white'
                                                    : 'bg-gray-200 border-gray-300 text-gray-700',
                                            )}
                                            title={autoMode ? 'Switch to manual' : 'Switch to auto'}
                                        >
                                            <span
                                                className={cn(
                                                    'absolute left-1 z-10 transition-opacity duration-150',
                                                    autoMode ? 'opacity-30' : 'opacity-100',
                                                )}
                                            >
                                                manual
                                            </span>
                                            <span
                                                className={cn(
                                                    'absolute right-3 z-10 transition-opacity duration-150',
                                                    autoMode
                                                        ? 'opacity-100 text-sky-900'
                                                        : 'opacity-30',
                                                )}
                                            >
                                                auto
                                            </span>
                                            <span
                                                className={cn(
                                                    'absolute top-0.5 h-6 w-12 rounded-full bg-white shadow transition-all duration-200',
                                                    autoMode
                                                        ? 'left-[calc(100%-3.25rem)]'
                                                        : 'left-0.5',
                                                )}
                                            />
                                        </button>
                                        {autoMode && (
                                            <span className="text-xs text-sky-700 text-center">
                                                looping
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <ExperimentHistory
                                planName="xas_scan"
                                metadataFulltextSearch={user}
                                onItemClick={(item) => setBlueskyRunId(item.id)}
                                enablePersistentSelection={true}
                                initialSelectedItemId={blueskyRunId}
                            />
                        )}
                    </div>

                    <div className="flex flex-col min-w-96 flex-grow border-l-2 border-slate-300 pl-4  min-h-[45rem]">
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
                            className="flex flex-grow items-center gap-4 h-fit justify-center"
                            key={viewMode}
                        >
                            <TiledWriterScatterPlot
                                key={blueskyRunId}
                                blueskyRunId={blueskyRunId}
                                tiledTrace={{
                                    x:
                                        import.meta.env.VITE_XAS_SCATTER_X ??
                                        'mono_energy_energy_eV',
                                    y: import.meta.env.VITE_XAS_SCATTER_Y ?? 'amptek_fluo_roi_sum',
                                }}
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
    );
}
