import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartLine, ClockCounterClockwise, PersonSimpleRun } from '@phosphor-icons/react';
import {
    useQueueGetDevicesAllowedQuery,
    useQueueGetPlansAllowedQuery,
    type ArbitraryKwargs,
    type Device,
    type Plan,
    type PostItemAddResponse,
} from '@/api/qServer';
import { useTiledSearchQuery } from '@/api/tiled';
import TiledWriterScatterPlot from '@/components/Tiled/TiledWriterScatterPlot';
import { useGetBlueskyRunList } from '@/components/QServer/utils/qServerApiUtils';
import { cn } from '@/lib/utils';
import ExperimentExecutePlanButtonGeneric from './ExperimentExecutePlanButtonGeneric';
import ExperimentFormGeneric from './ExperimentFormGeneric';
import ExperimentHistory from './ExperimentHistory';

/**
 * Columns every Bluesky primary stream has, so they are safe defaults for a plan nobody has
 * configured axes for yet.
 */
const DEFAULT_X_AXIS = 'seq_num';
const DEFAULT_Y_AXIS = 'time';

type ExperimentProps = {
    /** Additional CSS class names to apply to the root container. */
    className?: string;
    /** Heading shown above the panel. */
    title?: string;
    /** Callback invoked after a successful plan execution. Receives the raw API response. */
    onSuccess?: (response: PostItemAddResponse) => void;
    /** Callback invoked when plan execution fails. Receives a human-readable error message. */
    onError?: (error: string) => void;
    /** The base Tiled url, e.g. `http://localhost:8000/api/v1`. */
    tiledBaseUrl?: string;
    /** Initial path for the Tiled search, e.g. `beamline531`. */
    tiledInitialPath?: string;
    /** Plan selected on first render. Falls back to the first allowed plan. */
    defaultPlanName?: string;
    /** Column plotted on the x axis. Defaults to `seq_num`. */
    defaultXAxis?: string;
    /** Column plotted on the y axis. Defaults to `time`. */
    defaultYAxis?: string;
};

/**
 * Run any plan the queue server allows, and watch it come out of Tiled.
 *
 * Where `ExperimentXASScan` hard-codes one plan, its parameters and its axes, this asks the server
 * what it can run: `plans_allowed` fills the dropdown, the selected plan's parameter metadata
 * generates the form (`ExperimentFormGeneric`), and the plot's axes are editable — defaulting to
 * `seq_num` / `time`, which every primary stream has.
 *
 * The run being plotted is discovered two ways, because a plan can start from anywhere: after an
 * execute here, the queue server is polled for the run uid it produced; independently, Tiled is polled
 * for the newest run of the selected plan, so a scan started from a notebook shows up too.
 */
export default function Experiment({
    className,
    title = 'Experiment',
    onSuccess,
    onError,
    tiledBaseUrl,
    tiledInitialPath,
    defaultPlanName,
    defaultXAxis = DEFAULT_X_AXIS,
    defaultYAxis = DEFAULT_Y_AXIS,
}: ExperimentProps) {
    const plansQuery = useQueueGetPlansAllowedQuery();
    const devicesQuery = useQueueGetDevicesAllowedQuery();

    const [selectedPlanName, setSelectedPlanName] = useState<string>(defaultPlanName ?? '');
    const [kwargs, setKwargs] = useState<ArbitraryKwargs>({});
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [viewMode, setViewMode] = useState<'form' | 'history'>('form');
    const [executedItemUid, setExecutedItemUid] = useState<string>('');
    const [blueskyRunId, setBlueskyRunId] = useState<string>('');
    const [xAxis, setXAxis] = useState<string>(defaultXAxis);
    const [yAxis, setYAxis] = useState<string>(defaultYAxis);

    const allowedPlans = useMemo<Record<string, Plan>>(() => {
        const plans = plansQuery.data?.plans_allowed;
        if (!plans) return {};
        return Object.fromEntries(Object.entries(plans).sort(([a], [b]) => a.localeCompare(b)));
    }, [plansQuery.data]);

    const allowedDevices = useMemo<Record<string, Device>>(() => {
        const devices = devicesQuery.data?.devices_allowed;
        if (!devices) return {};
        return Object.fromEntries(Object.entries(devices).sort(([a], [b]) => a.localeCompare(b)));
    }, [devicesQuery.data]);

    const planNames = useMemo(() => Object.keys(allowedPlans), [allowedPlans]);
    const selectedPlan = selectedPlanName ? (allowedPlans[selectedPlanName] ?? null) : null;

    // Select something as soon as the catalog arrives, so the form is never pointlessly empty. A
    // `defaultPlanName` the server does not allow is ignored rather than left selected-but-broken.
    useEffect(() => {
        if (planNames.length === 0) return;
        if (selectedPlanName && planNames.includes(selectedPlanName)) return;
        setSelectedPlanName(
            defaultPlanName && planNames.includes(defaultPlanName) ? defaultPlanName : planNames[0],
        );
    }, [planNames, selectedPlanName, defaultPlanName]);

    const handleFormChange = useCallback((nextKwargs: ArbitraryKwargs, complete: boolean) => {
        setKwargs(nextKwargs);
        setIsFormComplete(complete);
    }, []);

    const handleSuccess = useCallback(
        (response: PostItemAddResponse) => {
            if (response.item && 'item_uid' in response.item) {
                setExecutedItemUid(response.item.item_uid);
            }
            onSuccess?.(response);
        },
        [onSuccess],
    );

    const handleError = useCallback(
        (error: string) => {
            console.error('Plan execution failed:', error);
            onError?.(error);
        },
        [onError],
    );

    const getBlueskyRunList = useGetBlueskyRunList();

    // Poll the queue server for the run uid(s) the executed item produced, until one appears.
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

    const pollRunId = runList.length > 0 ? runList[0] : '';
    useEffect(() => {
        if (pollRunId) setBlueskyRunId(pollRunId);
    }, [pollRunId]);

    // Independently, watch Tiled for the newest run of this plan, so one started elsewhere (a
    // notebook, another browser) is picked up as well. Held while browsing history so it cannot yank
    // the plot off the run being inspected.
    const { data: latestRunResult } = useTiledSearchQuery(
        '',
        {
            searchOptions: { pageLimit: 1, sort: '-' },
            searchFilters: {
                specs: { include: ['BlueskyRun'], exclude: [] },
                ...(selectedPlanName
                    ? { contains: { key: 'start.plan_name', value: `"${selectedPlanName}"` } }
                    : {}),
            },
        },
        { baseUrl: tiledBaseUrl, initialPath: tiledInitialPath },
        { refetchInterval: 5000, enabled: Boolean(selectedPlanName) && viewMode === 'form' },
    );

    useEffect(() => {
        if (viewMode === 'history') return;
        const tiledRunId = latestRunResult?.data[0]?.id;
        if (!tiledRunId || tiledRunId === blueskyRunId) return;
        setBlueskyRunId(tiledRunId);
    }, [latestRunResult, blueskyRunId, viewMode]);

    // A different plan means a different run and different columns; keep nothing stale on screen.
    useEffect(() => {
        setBlueskyRunId('');
        setExecutedItemUid('');
    }, [selectedPlanName]);

    const planLoadError = plansQuery.isError
        ? 'Could not read the allowed plans from the queue server.'
        : plansQuery.data && !plansQuery.data.success
          ? plansQuery.data.msg || 'The queue server refused the allowed-plans request.'
          : null;

    return (
        <div className={cn('text-slate-700', className)}>
            <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4 h-fit min-h-[48rem]">
                <div className="flex gap-6">
                    <div className="w-96 space-y-4">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-12">
                                <button
                                    onClick={() => setViewMode('form')}
                                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                                        viewMode === 'form'
                                            ? 'text-sky-800'
                                            : 'text-gray-400 hover:text-sky-600'
                                    }`}
                                    title="Run a new plan"
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
                                    title="View run history"
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
                                    <label
                                        htmlFor="experiment-plan-select"
                                        className="block text-sm font-medium mb-1"
                                    >
                                        Plan:
                                    </label>
                                    <select
                                        id="experiment-plan-select"
                                        value={selectedPlanName}
                                        onChange={(event) =>
                                            setSelectedPlanName(event.target.value)
                                        }
                                        disabled={plansQuery.isLoading || planNames.length === 0}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white disabled:text-gray-400"
                                    >
                                        {planNames.length === 0 && (
                                            <option value="">
                                                {plansQuery.isLoading
                                                    ? 'Loading plans…'
                                                    : 'No plans available'}
                                            </option>
                                        )}
                                        {planNames.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                    {planLoadError && (
                                        <p className="text-sm text-red-600 mt-1">{planLoadError}</p>
                                    )}
                                </div>

                                {/* The device inputs snapshot `allowedDevices` when they mount, so
                                    rendering the form before the catalog lands would leave every
                                    device dropdown permanently empty. The uid in the key remounts them
                                    if the catalog later changes — which happens when the environment
                                    is reopened, and invalidates any half-filled form anyway. */}
                                {devicesQuery.isPending ? (
                                    <p className="text-sm text-gray-500">Loading devices…</p>
                                ) : (
                                    <ExperimentFormGeneric
                                        key={devicesQuery.data?.devices_allowed_uid ?? 'no-devices'}
                                        plan={selectedPlan}
                                        allowedDevices={allowedDevices}
                                        onChange={handleFormChange}
                                    />
                                )}

                                {selectedPlanName && (
                                    <div className="pt-2 m-auto w-fit">
                                        <ExperimentExecutePlanButtonGeneric
                                            planName={selectedPlanName}
                                            kwargs={kwargs}
                                            disabled={!isFormComplete}
                                            onSuccess={handleSuccess}
                                            onError={handleError}
                                        />
                                        {!isFormComplete && (
                                            <p className="text-xs text-gray-500 mt-1 text-center">
                                                Fill in every required parameter to run.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <ExperimentHistory
                                planName={selectedPlanName}
                                // Any plan: bluesky records `plan_name` for every run, where
                                // `exact_plan_name` is only set by the beamline's own plans.
                                planNameMetadataKey="start.plan_name"
                                onItemClick={(item) => setBlueskyRunId(item.id)}
                                enablePersistentSelection={true}
                                initialSelectedItemId={blueskyRunId}
                                tiledBaseUrl={tiledBaseUrl}
                                tiledInitialSearchPath={tiledInitialPath}
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

                        {/* Axis pickers: the column names come from the run's own table, which is why
                            they are free text rather than a dropdown — the table is not read until a
                            run exists, and `seq_num` / `time` are always present. */}
                        <div className="flex flex-wrap items-end gap-3 pb-2">
                            <div>
                                <label
                                    htmlFor="experiment-x-axis"
                                    className="block text-xs font-medium mb-1"
                                >
                                    X axis column:
                                </label>
                                <input
                                    id="experiment-x-axis"
                                    type="text"
                                    value={xAxis}
                                    onChange={(event) => setXAxis(event.target.value)}
                                    placeholder={DEFAULT_X_AXIS}
                                    className="w-44 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="experiment-y-axis"
                                    className="block text-xs font-medium mb-1"
                                >
                                    Y axis column:
                                </label>
                                <input
                                    id="experiment-y-axis"
                                    type="text"
                                    value={yAxis}
                                    onChange={(event) => setYAxis(event.target.value)}
                                    placeholder={DEFAULT_Y_AXIS}
                                    className="w-44 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setXAxis(defaultXAxis);
                                    setYAxis(defaultYAxis);
                                }}
                                className="px-2 py-1 text-sm text-sky-800 hover:text-sky-600"
                                title={`Reset to ${defaultXAxis} / ${defaultYAxis}`}
                            >
                                reset axes
                            </button>
                        </div>

                        <div
                            className="flex flex-grow items-center gap-4 h-fit justify-center"
                            key={viewMode}
                        >
                            <TiledWriterScatterPlot
                                key={`${blueskyRunId}-${xAxis}-${yAxis}`}
                                blueskyRunId={blueskyRunId}
                                tiledTrace={{
                                    x: xAxis || DEFAULT_X_AXIS,
                                    y: yAxis || DEFAULT_Y_AXIS,
                                }}
                                className="max-h-[42rem] h-[42rem]"
                                plotClassName="h-[calc(100%-2rem)]"
                                showStatusText={false}
                                tiledBaseUrl={tiledBaseUrl}
                                initialPath={tiledInitialPath}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
