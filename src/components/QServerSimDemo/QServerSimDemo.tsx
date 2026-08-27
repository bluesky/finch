import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQServerApiClient } from '@/api/qServerRuntime';
import QServerConsoleOutput from './QServerConsoleOutput';
import type { GetStatusResponse } from '@/api/qServer/types/status';
import type { HistoryItem } from '@/api/qServer/types/history';
import type { Plan } from '@/api/qServer/types/plansDevices';
import type { QueueItem, RunningQueueItem } from '@/api/qServer/types/queue';

export interface QServerSimDemoProps {
    /** Poll interval in ms. Set to 0 to refresh only on demand. */
    pollIntervalMs?: number;
    /** Show the live console-output websocket panel. Default true. */
    showConsole?: boolean;
    className?: string;
}

interface Snapshot {
    status: GetStatusResponse | null;
    queue: QueueItem[];
    running: RunningQueueItem | null;
    history: HistoryItem[];
    plans: Record<string, Plan>;
}

const EMPTY: Snapshot = { status: null, queue: [], running: null, history: [], plans: {} };

/**
 * A minimal queue-server client exercise: what's queued, what ran, and a button to run a plan.
 *
 * Uses the API client from `QServerApiProvider` and nothing else — no TanStack Query, no caching
 * layer — so it reads as a direct test of the client against whatever is behind the provider
 * (the simulator in Storybook, a real server in the app).
 */
export default function QServerSimDemo({
    pollIntervalMs = 1000,
    showConsole = true,
    className = '',
}: QServerSimDemoProps) {
    const client = useQServerApiClient();

    const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    // Guards against a poll landing after unmount, and against overlapping refreshes.
    const mountedRef = useRef(true);
    const inFlightRef = useRef(false);

    const refresh = useCallback(async () => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        try {
            const [status, queue, history, plans] = await Promise.all([
                client.getStatus(),
                client.getQueue(),
                client.getQueueHistory(),
                client.getPlansAllowed(),
            ]);
            if (!mountedRef.current) return;
            const running = queue.running_item;
            setSnapshot({
                status,
                queue: queue.items ?? [],
                running: running && 'item_uid' in running ? (running as RunningQueueItem) : null,
                history: history.items ?? [],
                plans: plans.plans_allowed ?? {},
            });
        } catch (error) {
            if (mountedRef.current) setMessage(describe(error));
        } finally {
            inFlightRef.current = false;
        }
    }, [client]);

    useEffect(() => {
        mountedRef.current = true;
        void refresh();
        if (pollIntervalMs <= 0)
            return () => {
                mountedRef.current = false;
            };

        const handle = setInterval(() => void refresh(), pollIntervalMs);
        return () => {
            mountedRef.current = false;
            clearInterval(handle);
        };
    }, [refresh, pollIntervalMs]);

    const planNames = Object.keys(snapshot.plans);
    const planToRun = selectedPlan || planNames[0] || '';

    /** Queue the selected plan without starting it. */
    const addPlan = async () => {
        if (!planToRun) return;
        setBusy(true);
        try {
            const added = await client.addQueueItem({
                item: { name: planToRun, item_type: 'plan' },
            });
            setMessage(
                added.success
                    ? `Added ${planToRun} to the queue (${added.qsize} queued).`
                    : `Could not add ${planToRun}: ${added.msg}`,
            );
        } catch (error) {
            setMessage(describe(error));
        } finally {
            setBusy(false);
            await refresh();
        }
    };

    /** Queue the selected plan, then start the queue if it is not already running. */
    const runPlan = async () => {
        if (!planToRun) return;
        setBusy(true);
        try {
            const added = await client.addQueueItem({
                item: { name: planToRun, item_type: 'plan' },
            });
            if (!added.success) {
                setMessage(`Could not add ${planToRun}: ${added.msg}`);
                return;
            }

            const status = await client.getStatus();
            if (status.manager_state === 'idle') {
                const started = await client.startQueue();
                setMessage(
                    started.success
                        ? `Queued and started ${planToRun}.`
                        : `Queued ${planToRun}, but the queue did not start: ${started.msg}`,
                );
            } else {
                setMessage(`Queued ${planToRun}; the queue is already ${status.manager_state}.`);
            }
        } catch (error) {
            setMessage(describe(error));
        } finally {
            setBusy(false);
            await refresh();
        }
    };

    const act = async (label: string, action: () => Promise<{ success: boolean; msg: string }>) => {
        setBusy(true);
        try {
            const response = await action();
            setMessage(response.success ? `${label}: ok` : `${label} failed: ${response.msg}`);
        } catch (error) {
            setMessage(describe(error));
        } finally {
            setBusy(false);
            await refresh();
        }
    };

    const { status } = snapshot;

    return (
        <div
            data-testid="qserver-sim-demo"
            className={
                'mx-auto max-w-4xl space-y-4 rounded-lg border border-slate-300 bg-slate-50 p-4 ' +
                `text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`
            }
        >
            <header className="space-y-1">
                <h2 className="text-lg font-semibold">Queue Server client demo</h2>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-300">
                    {status
                        ? `${status.msg} · manager ${status.manager_state} · RE ${status.re_state ?? '—'} · ` +
                          `env ${status.worker_environment_state} · queued ${status.items_in_queue} · ` +
                          `history ${status.items_in_history}`
                        : 'loading…'}
                </p>
            </header>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={planToRun}
                    onChange={(event) => setSelectedPlan(event.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                >
                    {planNames.length === 0 && <option value="">no plans available</option>}
                    {planNames.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => void addPlan()}
                    disabled={busy || !planToRun}
                    className="rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600"
                >
                    Add plan
                </button>
                <button
                    type="button"
                    onClick={() => void runPlan()}
                    disabled={busy || !planToRun}
                    className="rounded bg-slate-800 px-3 py-1 text-sm font-medium text-white disabled:opacity-40 dark:bg-slate-200 dark:text-slate-900"
                >
                    Run plan
                </button>
                <button
                    type="button"
                    onClick={() => void act('Open environment', () => client.openEnvironment())}
                    disabled={busy}
                    className="rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600"
                >
                    Open environment
                </button>
                <button
                    type="button"
                    onClick={() => void act('Close environment', () => client.closeEnvironment())}
                    disabled={busy}
                    className="rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600"
                >
                    Close environment
                </button>
                <button
                    type="button"
                    onClick={() => void act('Start queue', () => client.startQueue())}
                    disabled={busy}
                    className="rounded border border-slate-400 px-3 py-1 text-sm disabled:opacity-40 dark:border-slate-600"
                >
                    Start queue
                </button>
                <button
                    type="button"
                    onClick={() => void refresh()}
                    className="rounded border border-slate-400 px-3 py-1 text-sm dark:border-slate-600"
                >
                    Refresh
                </button>
            </div>

            {/* Always rendered at a fixed height: appearing and disappearing shifted everything below. */}
            <p
                title={message}
                className="h-4 truncate font-mono text-xs leading-4 text-slate-600 dark:text-slate-300"
            >
                {message}
            </p>

            {/* Reserved whether or not a plan is running, for the same reason. */}
            <section
                className={
                    'h-20 rounded border p-3 ' +
                    (snapshot.running
                        ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950'
                        : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950')
                }
            >
                <h3 className="text-sm font-medium">Running</h3>
                <p className="truncate font-mono text-xs">
                    {snapshot.running
                        ? `${snapshot.running.name} · ${formatKwargs(snapshot.running)}`
                        : '—'}
                </p>
            </section>

            <section>
                <h3 className="mb-1 text-sm font-medium">Queue ({snapshot.queue.length})</h3>
                <ScrollBox>
                    <ItemTable
                        items={snapshot.queue}
                        empty="Nothing queued."
                        testId="qserver-sim-demo-queue"
                    />
                </ScrollBox>
            </section>

            <section>
                <h3 className="mb-1 text-sm font-medium">History ({snapshot.history.length})</h3>
                <ScrollBox>
                    <ItemTable
                        items={snapshot.history}
                        empty="No completed plans yet."
                        testId="qserver-sim-demo-history"
                        renderExtra={(item) => (item as HistoryItem).result?.exit_status ?? ''}
                        extraHeader="Exit status"
                    />
                </ScrollBox>
            </section>

            {showConsole && <QServerConsoleOutput />}
        </div>
    );
}

/**
 * Fixed-height, vertically scrolling container.
 *
 * The queue and history both grow as plans move through them; letting them size to content pushed
 * everything below around on every poll.
 */
function ScrollBox({ children }: { children: ReactNode }) {
    return (
        <div className="h-40 overflow-y-auto rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950">
            {children}
        </div>
    );
}

function ItemTable({
    items,
    empty,
    testId,
    renderExtra,
    extraHeader,
}: {
    items: (QueueItem | HistoryItem)[];
    empty: string;
    testId: string;
    renderExtra?: (item: QueueItem | HistoryItem) => string;
    extraHeader?: string;
}) {
    if (items.length === 0) {
        return <p className="text-xs text-slate-500 dark:text-slate-400">{empty}</p>;
    }

    return (
        <table data-testid={testId} className="w-full text-left text-xs">
            {/* Sticky so the column labels survive scrolling inside the fixed-height box. */}
            <thead className="sticky top-0 bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                    <th className="py-1 pr-2">Plan</th>
                    <th className="py-1 pr-2">Arguments</th>
                    {extraHeader && <th className="py-1 pr-2">{extraHeader}</th>}
                    <th className="py-1">Uid</th>
                </tr>
            </thead>
            <tbody className="font-mono">
                {items.map((item) => (
                    <tr
                        key={item.item_uid}
                        className="border-t border-slate-200 dark:border-slate-700"
                    >
                        <td className="py-1 pr-2">{item.name}</td>
                        <td className="py-1 pr-2">{formatKwargs(item)}</td>
                        {renderExtra && <td className="py-1 pr-2">{renderExtra(item)}</td>}
                        <td className="py-1 text-slate-500 dark:text-slate-400">{item.item_uid}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function formatKwargs(item: QueueItem | HistoryItem | RunningQueueItem): string {
    const parts: string[] = [];
    if (item.args?.length) parts.push(JSON.stringify(item.args));
    if (item.kwargs && Object.keys(item.kwargs).length > 0) parts.push(JSON.stringify(item.kwargs));
    return parts.join(' ') || '—';
}

function describe(error: unknown): string {
    return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}
