import { useState } from 'react';
import JsonResultViewer from '../devtools/JsonResultViewer';
import type { StreamLog, StreamLogEntry } from './useStreamLog';

const KIND_COLORS: Record<string, string> = {
    status: 'text-slate-500',
    error: 'text-rose-600',
};

/**
 * A subscription's event log: per-type counters, a filter, a pause switch, and expandable rows.
 *
 * Pausing freezes what is on screen. Messages keep arriving and being counted, so you can read a
 * fast stream without it scrolling away.
 */
export default function StreamLogView({ log }: { log: StreamLog }) {
    const [filter, setFilter] = useState('all');
    const [paused, setPaused] = useState<StreamLogEntry[] | null>(null);
    const [openId, setOpenId] = useState<number | null>(null);

    const source = paused ?? log.entries;
    const shown = filter === 'all' ? source : source.filter((entry) => entry.kind === filter);
    const kinds = Object.keys(log.counts).sort();

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-medium text-slate-800">
                    {log.total.toLocaleString()} messages
                </span>
                <span>{log.rate.toFixed(1)}/s</span>
                {kinds.map((kind) => (
                    <span key={kind} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">
                        {kind} ×{log.counts[kind]}
                    </span>
                ))}
                <select
                    aria-label="filter log"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="ml-auto rounded border border-slate-300 bg-white px-1 py-0.5"
                >
                    <option value="all">all</option>
                    {[...kinds, 'status', 'error'].map((kind) => (
                        <option key={kind} value={kind}>
                            {kind}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                    onClick={() => setPaused((current) => (current ? null : log.entries))}
                >
                    {paused ? 'Resume view' : 'Pause view'}
                </button>
                <button
                    type="button"
                    className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                    onClick={() => {
                        log.clear();
                        setPaused(null);
                    }}
                >
                    Clear
                </button>
            </div>

            <ol
                data-testid="stream-log"
                className="max-h-72 overflow-auto rounded border border-slate-200 bg-white font-mono text-xs"
            >
                {shown.length === 0 && <li className="px-2 py-1 text-slate-400">(nothing yet)</li>}
                {shown.map((entry) => (
                    <li key={entry.id} className="border-b border-slate-100 last:border-0">
                        <button
                            type="button"
                            disabled={entry.detail === undefined}
                            onClick={() => setOpenId(openId === entry.id ? null : entry.id)}
                            className="flex w-full gap-2 px-2 py-0.5 text-left hover:bg-slate-50 disabled:cursor-default"
                        >
                            <span className="shrink-0 text-slate-400">
                                {new Date(entry.receivedAt).toLocaleTimeString()}
                            </span>
                            <span className="w-10 shrink-0 text-right text-slate-500">
                                {entry.sequence !== undefined ? `#${entry.sequence}` : ''}
                            </span>
                            <span
                                className={`shrink-0 font-semibold ${KIND_COLORS[entry.kind] ?? 'text-sky-700'}`}
                            >
                                {entry.kind}
                            </span>
                            <span className="truncate text-slate-700">{entry.summary}</span>
                        </button>
                        {openId === entry.id && entry.detail !== undefined && (
                            <div className="px-2 pb-2">
                                <JsonResultViewer value={entry.detail} maxHeightClass="max-h-64" />
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}
