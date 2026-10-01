import { useMemo, useState } from 'react';
import { TILED_GROUP_LABELS } from '@/api/tiled';
import { groupedQueries } from './catalog';
import type { QueryDescriptor } from './types';

export interface QueryCatalogListProps {
    selectedId: string;
    onSelect: (id: string) => void;
    pinnedIds: readonly string[];
    onTogglePin: (id: string) => void;
}

/** Grouped, filterable list of every query hook. */
export default function QueryCatalogList({
    selectedId,
    onSelect,
    pinnedIds,
    onTogglePin,
}: QueryCatalogListProps) {
    const [filter, setFilter] = useState('');

    const groups = useMemo(() => {
        const needle = filter.trim().toLowerCase();
        if (!needle) return groupedQueries();
        return groupedQueries()
            .map((entry) => ({
                ...entry,
                queries: entry.queries.filter(
                    (query) =>
                        query.id.toLowerCase().includes(needle) ||
                        query.hookName.toLowerCase().includes(needle) ||
                        query.summary.toLowerCase().includes(needle),
                ),
            }))
            .filter((entry) => entry.queries.length > 0);
    }, [filter]);

    const total = groups.reduce((count, entry) => count + entry.queries.length, 0);

    return (
        <nav className="space-y-2">
            <input
                type="text"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="filter by id, hook or summary"
                className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="text-[10px] text-slate-500">
                {total} quer{total === 1 ? 'y' : 'ies'}
                {pinnedIds.length > 0 && ` · ${pinnedIds.length} pinned`}
            </p>

            {groups.map((entry) => (
                <div key={entry.group}>
                    <h3 className="px-1 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                        {TILED_GROUP_LABELS[entry.group]}
                    </h3>
                    <ul>
                        {entry.queries.map((query) => (
                            <Row
                                key={query.id}
                                query={query}
                                selected={query.id === selectedId}
                                pinned={pinnedIds.includes(query.id)}
                                onSelect={() => onSelect(query.id)}
                                onTogglePin={() => onTogglePin(query.id)}
                            />
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

function Row({
    query,
    selected,
    pinned,
    onSelect,
    onTogglePin,
}: {
    query: QueryDescriptor;
    selected: boolean;
    pinned: boolean;
    onSelect: () => void;
    onTogglePin: () => void;
}) {
    return (
        <li className="flex items-center gap-1">
            <button
                type="button"
                onClick={onSelect}
                className={`flex-1 truncate rounded px-1 py-0.5 text-left text-xs ${
                    selected
                        ? 'bg-slate-300 font-medium text-slate-900 dark:bg-slate-600 dark:text-slate-100'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={query.summary}
            >
                {query.id.split('.')[1] ?? query.id}
            </button>
            <button
                type="button"
                onClick={onTogglePin}
                className={`px-1 text-[10px] ${pinned ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                title={pinned ? 'unpin' : 'pin — keeps it mounted alongside the selected query'}
            >
                {pinned ? '★' : '☆'}
            </button>
        </li>
    );
}
