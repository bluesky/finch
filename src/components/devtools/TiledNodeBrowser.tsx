import { useTiledSearchQuery } from '@/api/tiled';

export interface TiledNodeBrowserProps {
    /** The container currently being listed. `''` is the root. */
    path: string;
    onPathChange: (path: string) => void;
}

/**
 * A one-level node browser, used to pick the path most endpoints are addressed by.
 *
 * Typing a Tiled path by hand is the single most tedious part of exercising this API — nearly every
 * route takes one, and the interesting paths are uuids. This lists the current container's children
 * and lets you walk down into them, so a path can be assembled by clicking.
 *
 * Deliberately one level at a time rather than a full tree: a Tiled container can hold thousands of
 * children, and a recursive tree would issue a request per expanded node.
 */
export default function TiledNodeBrowser({ path, onPathChange }: TiledNodeBrowserProps) {
    const children = useTiledSearchQuery(path, { searchOptions: { pageLimit: 100 } });

    const segments = path.split('/').filter(Boolean);

    return (
        <div className="rounded border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-2 flex flex-wrap items-center gap-1 text-sm">
                <button
                    type="button"
                    className="rounded px-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={() => onPathChange('')}
                >
                    root
                </button>
                {segments.map((segment, index) => (
                    <span key={`${segment}-${index}`} className="flex items-center gap-1">
                        <span className="text-slate-400">/</span>
                        <button
                            type="button"
                            className="rounded px-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                            onClick={() => onPathChange(segments.slice(0, index + 1).join('/'))}
                        >
                            {segment}
                        </button>
                    </span>
                ))}
            </div>

            <input
                type="text"
                value={path}
                onChange={(event) => onPathChange(event.target.value)}
                placeholder="Tiled path — empty is the root container"
                className="mb-2 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />

            {children.isPending && <p className="text-xs text-slate-500">listing…</p>}
            {children.isError && (
                <p className="text-xs text-red-600 dark:text-red-400">{children.error.message}</p>
            )}

            {children.data && (
                <ul className="max-h-48 space-y-0.5 overflow-auto">
                    {children.data.data.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                className="w-full rounded px-1 text-left font-mono text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                                onClick={() => onPathChange(path ? `${path}/${item.id}` : item.id)}
                            >
                                <span className="text-slate-500">
                                    [{item.attributes.structure_family}]
                                </span>{' '}
                                {item.id}
                            </button>
                        </li>
                    ))}
                    {children.data.data.length === 0 && (
                        <li className="px-1 text-xs text-slate-500">no children</li>
                    )}
                </ul>
            )}
        </div>
    );
}
