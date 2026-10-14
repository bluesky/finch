import { useState } from 'react';
import { useTiledApiClient } from '@/api/tiled';
import type { PostMetadataRequest, PutMetadataRequest } from '@/api/tiled';
import type { SubscriptionMode } from './modes';

interface CreatedNode {
    path: string;
    family: 'container' | 'array';
    /** Current `[rows, cols]` for arrays; it grows as rows are appended. */
    shape?: [number, number];
    stopped?: boolean;
}

export interface WriteHelpersProps {
    /** The container new nodes are created under. */
    parentPath: string;
    onSubscribe: (path: string, mode: SubscriptionMode) => void;
}

const buttonClass =
    'rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-50';

/**
 * Buttons that make the server emit stream events, so the harness can be driven without a Python
 * session. They write over HTTP through the harness's own client, with the connection bar's key.
 *
 * Only containers and arrays are covered. A table append needs an Arrow IPC body, and Finch has no
 * Arrow encoder (Tiled answers JSON with "No dispatch", and its CSV path is broken), so for tables
 * the panel shows a Python snippet instead.
 */
export default function WriteHelpers({ parentPath, onSubscribe }: WriteHelpersProps) {
    const client = useTiledApiClient();
    const [created, setCreated] = useState<CreatedNode[]>([]);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
    const [blueskySpec, setBlueskySpec] = useState(true);
    const [rows, setRows] = useState('32');
    const [cols, setCols] = useState('32');

    const run = async (label: string, action: () => Promise<string | void>) => {
        setBusy(true);
        try {
            const detail = await action();
            setResult({ ok: true, text: detail ? `${label}: ${detail}` : `${label}: done` });
        } catch (error) {
            setResult({
                ok: false,
                text: `${label}: ${error instanceof Error ? error.message : String(error)}`,
            });
        } finally {
            setBusy(false);
        }
    };

    const childPath = (key: string) => (parentPath ? `${parentPath}/${key}` : key);
    const newKey = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

    const createContainer = () =>
        run('create container', async () => {
            const key = newKey('ws-run');
            await client.createNode(parentPath, {
                id: key,
                structure_family: 'container',
                metadata: { start: { uid: key, time: Date.now() / 1000 } },
                specs: blueskySpec ? [{ name: 'BlueskyRun', version: '3.0' }] : [],
                data_sources: [],
            } as unknown as PostMetadataRequest);
            setCreated((current) => [...current, { path: childPath(key), family: 'container' }]);
            return childPath(key);
        });

    const stopContainer = (node: CreatedNode) =>
        run('add metadata.stop', async () => {
            const key = node.path.split('/').at(-1);
            await client.updateMetadata(node.path, {
                metadata: {
                    start: { uid: key },
                    stop: { exit_status: 'success', time: Date.now() / 1000 },
                },
            } as unknown as PutMetadataRequest);
            setCreated((current) =>
                current.map((entry) => (entry === node ? { ...entry, stopped: true } : entry)),
            );
        });

    const createArray = () =>
        run('create array', async () => {
            const shape: [number, number] = [
                Math.max(1, Number(rows) || 32),
                Math.max(1, Number(cols) || 32),
            ];
            const key = newKey('ws-array');
            await client.createNode(parentPath, {
                id: key,
                structure_family: 'array',
                metadata: {},
                specs: [],
                data_sources: [
                    {
                        structure_family: 'array',
                        structure: {
                            data_type: {
                                endianness: 'little',
                                kind: 'f',
                                itemsize: 8,
                                dt_units: null,
                            },
                            chunks: [[shape[0]], [shape[1]]],
                            shape,
                            dims: null,
                            resizable: false,
                        },
                        mimetype: 'application/x-zarr',
                        parameters: {},
                        assets: [],
                        management: 'writable',
                    },
                ],
            } as unknown as PostMetadataRequest);
            setCreated((current) => [...current, { path: childPath(key), family: 'array', shape }]);
            return `${childPath(key)} [${shape.join(' × ')}] float64`;
        });

    const writeFrame = (node: CreatedNode) =>
        run('write frame (PUT, full payload)', async () => {
            const [height, width] = node.shape!;
            await client.putArrayFull(node.path, testPattern(height, width));
        });

    const appendRow = (node: CreatedNode) =>
        run('append row (PATCH, extend)', async () => {
            const [height, width] = node.shape!;
            const row = new Float64Array(width).map(() => Math.random());
            await client.patchArrayFull(node.path, row.buffer, {
                offset: [height, 0],
                shape: [1, width],
                extend: true,
            });
            setCreated((current) =>
                current.map((entry) =>
                    entry === node ? { ...entry, shape: [height + 1, width] } : entry,
                ),
            );
        });

    const deleteAll = () =>
        run('delete created nodes', async () => {
            // Children before parents, in case one was created under another.
            for (const node of [...created].reverse()) {
                await client.deleteNode(node.path, { recursive: true, external_only: false });
            }
            const count = created.length;
            setCreated([]);
            return `${count} deleted`;
        });

    return (
        <section className="space-y-2 rounded border border-slate-300 bg-white p-3">
            <h2 className="font-semibold">Make events happen</h2>
            <p className="text-xs text-slate-500">
                Writes under <code className="font-mono">{parentPath || '/'}</code> (the node
                selected above) using the connection bar&apos;s API key. Subscribe to that container
                first to see <code>container-child-created</code>.
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    className={buttonClass}
                    disabled={busy}
                    onClick={createContainer}
                >
                    Create child container
                </button>
                <label className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                        type="checkbox"
                        checked={blueskySpec}
                        onChange={(event) => setBlueskySpec(event.target.checked)}
                    />
                    with BlueskyRun spec
                </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={buttonClass} disabled={busy} onClick={createArray}>
                    Create 2-D array
                </button>
                <input
                    aria-label="array rows"
                    value={rows}
                    onChange={(event) => setRows(event.target.value)}
                    className="w-14 rounded border border-slate-300 px-1 py-0.5 font-mono text-xs"
                />
                <span className="text-xs text-slate-500">×</span>
                <input
                    aria-label="array columns"
                    value={cols}
                    onChange={(event) => setCols(event.target.value)}
                    className="w-14 rounded border border-slate-300 px-1 py-0.5 font-mono text-xs"
                />
            </div>

            {created.length > 0 && (
                <ul className="space-y-1">
                    {created.map((node) => (
                        <li
                            key={node.path}
                            className="flex flex-wrap items-center gap-2 font-mono text-xs"
                        >
                            <span className="text-slate-500">[{node.family}]</span>
                            <span className="break-all">{node.path}</span>
                            {node.shape && (
                                <span className="text-slate-500">[{node.shape.join(' × ')}]</span>
                            )}
                            <button
                                type="button"
                                className={buttonClass}
                                onClick={() => onSubscribe(node.path, node.family)}
                            >
                                Subscribe
                            </button>
                            {node.family === 'container' && (
                                <button
                                    type="button"
                                    className={buttonClass}
                                    disabled={busy}
                                    onClick={() => stopContainer(node)}
                                >
                                    {node.stopped ? 'Update stop again' : 'Add metadata.stop'}
                                </button>
                            )}
                            {node.family === 'array' && (
                                <>
                                    <button
                                        type="button"
                                        className={buttonClass}
                                        disabled={busy}
                                        onClick={() => writeFrame(node)}
                                    >
                                        Write frame
                                    </button>
                                    <button
                                        type="button"
                                        className={buttonClass}
                                        disabled={busy}
                                        onClick={() => appendRow(node)}
                                    >
                                        Append row
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                    <li>
                        <button
                            type="button"
                            className={`${buttonClass} text-rose-700`}
                            disabled={busy}
                            onClick={deleteAll}
                        >
                            Delete all {created.length} created
                        </button>
                    </li>
                </ul>
            )}

            {result && (
                <p
                    role="status"
                    className={`break-all text-xs ${result.ok ? 'text-emerald-700' : 'text-rose-600'}`}
                >
                    {result.text}
                </p>
            )}

            <TableSnippet parentPath={parentPath} />
        </section>
    );
}

function TableSnippet({ parentPath }: { parentPath: string }) {
    const [copied, setCopied] = useState(false);
    const target = parentPath ? `c["${parentPath.split('/').join('"]["')}"]` : 'c';
    const snippet = `from tiled.client import from_uri
import pyarrow as pa, time

c = from_uri("http://localhost:8000", api_key="…")
# SQL-backed, so it can be appended to (a write_table() Parquet table cannot).
t = ${target}.create_appendable_table(
    pa.schema([("x", pa.int64()), ("y", pa.float64())]), key="ws-table"
)
for i in range(20):
    # Pass a pyarrow Table: a pandas DataFrame drags its index in as an extra column.
    t.append_partition(0, pa.table({"x": [i], "y": [i * 0.5]}))
    time.sleep(0.5)`;

    return (
        <details className="text-xs">
            <summary className="cursor-pointer text-slate-600">
                Tables: append rows from Python
            </summary>
            <p className="my-1 text-slate-500">
                Subscribe to <code>{parentPath ? `${parentPath}/ws-table` : 'ws-table'}</code> with
                useTiledTableSubscription once the table exists, then run the loop.
            </p>
            <pre className="overflow-auto rounded bg-slate-950 px-2 py-1 font-mono text-slate-100">
                {snippet}
            </pre>
            <button
                type="button"
                className={`${buttonClass} mt-1`}
                onClick={() =>
                    void navigator.clipboard?.writeText(snippet).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                    })
                }
            >
                {copied ? 'Copied' : 'Copy'}
            </button>
        </details>
    );
}

/** A moving diagonal gradient, so successive frames look different. */
function testPattern(height: number, width: number): ArrayBuffer {
    const phase = Math.random() * Math.PI * 2;
    const values = new Float64Array(height * width);
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            values[y * width + x] = Math.sin((x + y) / 4 + phase) + Math.random() * 0.2;
        }
    }
    return values.buffer;
}
