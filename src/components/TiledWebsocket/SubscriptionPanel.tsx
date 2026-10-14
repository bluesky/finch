import { useEffect, useMemo, useState } from 'react';
import {
    TiledWebSocketClient,
    buildTiledWebSocketUrl,
    resolveTiledPath,
    useTiledArraySubscription,
    useTiledContainerSubscription,
    useTiledInvalidate,
    useTiledSubscription,
    useTiledTableSubscription,
} from '@/api/tiled';
import type {
    ArrayDataMessage,
    ArrayRefMessage,
    ContainerChildCreatedMessage,
    ContainerChildMetadataUpdatedMessage,
    TiledConnectionStatus,
    TiledSocketFactory,
    TiledSubscription,
    TiledSubscriptionError,
    TiledSubscriptionOptions,
} from '@/api/tiled';
import type { TiledConnectionConfig } from '../devtools/TiledConnectionBar';
import JsonResultViewer from '../devtools/JsonResultViewer';
import ArrayPreview from './ArrayPreview';
import { MODE_LABELS, modeForFamily, type SubscriptionMode } from './modes';
import StreamLogView from './StreamLogView';
import { useStreamLog, type StreamLog } from './useStreamLog';

// #region options

/** The form's fields, as typed. Numbers stay strings until Subscribe, so a field can be empty. */
interface DraftOptions {
    start: string;
    reconnect: boolean;
    reconnectDelay: string;
    maxReconnectDelay: string;
    maxReconnectAttempts: string;
    accumulate: boolean;
    maxRows: string;
    trackLatest: boolean;
    invalidateOnChange: boolean;
}

const DEFAULT_DRAFT: DraftOptions = {
    start: '',
    reconnect: true,
    reconnectDelay: '1000',
    maxReconnectDelay: '30000',
    maxReconnectAttempts: '',
    accumulate: false,
    maxRows: '500',
    trackLatest: true,
    invalidateOnChange: true,
};

interface CommittedOptions {
    subscription: TiledSubscriptionOptions;
    accumulate: boolean;
    maxRows?: number;
    trackLatest: boolean;
    invalidateOnChange: boolean;
}

function commit(draft: DraftOptions): CommittedOptions {
    const number = (value: string) => {
        const parsed = Number(value);
        return value.trim() === '' || Number.isNaN(parsed) ? undefined : parsed;
    };
    return {
        subscription: {
            start: number(draft.start),
            reconnect: draft.reconnect,
            reconnectDelay: number(draft.reconnectDelay),
            maxReconnectDelay: number(draft.maxReconnectDelay),
            maxReconnectAttempts: number(draft.maxReconnectAttempts),
        },
        accumulate: draft.accumulate,
        maxRows: number(draft.maxRows),
        trackLatest: draft.trackLatest,
        invalidateOnChange: draft.invalidateOnChange,
    };
}

// #endregion

export interface SubscriptionPanelProps {
    initialPath: string;
    initialMode: SubscriptionMode;
    connection: TiledConnectionConfig;
    onRemove: () => void;
    /** Open another panel, e.g. on a child a container subscription just reported. */
    onSubscribeChild: (path: string, mode: SubscriptionMode) => void;
    /** Overrides the browser `WebSocket`; for tests. */
    socketFactory?: TiledSocketFactory;
}

const inputClass =
    'w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-900 disabled:bg-slate-100';
const buttonClass =
    'rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-50';

/**
 * One subscription: pick a hook, set its options, subscribe, and watch what arrives.
 *
 * Options are staged and only take effect on Subscribe, the same way the connection bar stages its
 * edits, because changing `start` or a reconnect option opens a new socket.
 */
export default function SubscriptionPanel({
    initialPath,
    initialMode,
    connection,
    onRemove,
    onSubscribeChild,
    socketFactory,
}: SubscriptionPanelProps) {
    const [mode, setMode] = useState<SubscriptionMode>(initialMode);
    const [path, setPath] = useState(initialPath);
    const [draft, setDraft] = useState<DraftOptions>(DEFAULT_DRAFT);
    const [active, setActive] = useState<CommittedOptions | null>(null);
    const [generation, setGeneration] = useState(0);
    const log = useStreamLog();

    const set = <K extends keyof DraftOptions>(key: K, value: DraftOptions[K]) =>
        setDraft((current) => ({ ...current, [key]: value }));

    const preview = useMemo(() => {
        try {
            return buildTiledWebSocketUrl(
                connection.baseUrl,
                resolveTiledPath(path, connection.initialPath),
                { start: commit(draft).subscription.start },
            );
        } catch {
            return '(invalid base URL)';
        }
    }, [connection.baseUrl, connection.initialPath, path, draft]);

    const subscribe = () => {
        log.pushNote('status', `subscribe ${path || '/'} with ${MODE_LABELS[mode]}`);
        setActive(commit(draft));
        setGeneration((value) => value + 1);
    };

    const unsubscribe = () => {
        log.pushNote('status', 'unsubscribed (component unmounted the subscription)');
        setActive(null);
    };

    const locked = active !== null;
    const bodyProps: BodyProps = {
        path,
        connection,
        options: active ?? commit(draft),
        log,
        socketFactory,
        onSubscribeChild,
    };

    return (
        <section
            data-testid="subscription-panel"
            className="space-y-2 rounded border border-slate-300 bg-white p-3"
        >
            <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-[14rem] flex-1 text-xs">
                    <span className="text-slate-500">node path (empty is the root container)</span>
                    <input
                        aria-label="subscription path"
                        type="text"
                        value={path}
                        disabled={locked}
                        onChange={(event) => setPath(event.target.value)}
                        className={inputClass}
                    />
                </label>
                <label className="text-xs">
                    <span className="text-slate-500">API</span>
                    <select
                        aria-label="subscription mode"
                        value={mode}
                        disabled={locked}
                        onChange={(event) => setMode(event.target.value as SubscriptionMode)}
                        className={inputClass}
                    >
                        {(Object.keys(MODE_LABELS) as SubscriptionMode[]).map((key) => (
                            <option key={key} value={key}>
                                {MODE_LABELS[key]}
                            </option>
                        ))}
                    </select>
                </label>
                {locked ? (
                    <button type="button" className={buttonClass} onClick={unsubscribe}>
                        Unsubscribe
                    </button>
                ) : (
                    <button
                        type="button"
                        className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white"
                        onClick={subscribe}
                    >
                        Subscribe
                    </button>
                )}
                <button type="button" className={buttonClass} onClick={onRemove}>
                    Remove
                </button>
            </div>

            <OptionsForm mode={mode} draft={draft} set={set} disabled={locked} />

            <p className="break-all font-mono text-[11px] text-slate-500">{preview}</p>

            {active && (
                <div key={generation} className="space-y-2">
                    {mode === 'container' && <ContainerBody {...bodyProps} />}
                    {mode === 'table' && <TableBody {...bodyProps} />}
                    {mode === 'array' && <ArrayBody {...bodyProps} />}
                    {mode === 'generic' && <GenericBody {...bodyProps} />}
                    {mode === 'raw' && <RawBody {...bodyProps} />}
                </div>
            )}

            <StreamLogView log={log} />
        </section>
    );
}

function OptionsForm({
    mode,
    draft,
    set,
    disabled,
}: {
    mode: SubscriptionMode;
    draft: DraftOptions;
    set: <K extends keyof DraftOptions>(key: K, value: DraftOptions[K]) => void;
    disabled: boolean;
}) {
    const numberField = (key: keyof DraftOptions, label: string, placeholder: string) => (
        <label className="w-36 text-xs">
            <span className="text-slate-500">{label}</span>
            <input
                aria-label={label}
                type="text"
                inputMode="numeric"
                value={draft[key] as string}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(event) => set(key, event.target.value as never)}
                className={inputClass}
            />
        </label>
    );
    const checkbox = (key: keyof DraftOptions, label: string, title?: string) => (
        <label className="flex items-center gap-1 text-xs text-slate-600" title={title}>
            <input
                type="checkbox"
                checked={draft[key] as boolean}
                disabled={disabled}
                onChange={(event) => set(key, event.target.checked as never)}
            />
            {label}
        </label>
    );

    return (
        <div className="flex flex-wrap items-end gap-2">
            {numberField('start', 'start (replay from)', 'live only')}
            {numberField('reconnectDelay', 'reconnect delay ms', '1000')}
            {numberField('maxReconnectDelay', 'max delay ms', '30000')}
            {numberField('maxReconnectAttempts', 'max attempts', 'unlimited')}
            {checkbox('reconnect', 'auto-reconnect')}
            {mode === 'table' && (
                <>
                    {checkbox(
                        'accumulate',
                        'accumulate rows',
                        'Concatenate every payload into `rows` (re-renders per message).',
                    )}
                    {numberField('maxRows', 'maxRows', 'unbounded')}
                </>
            )}
            {(mode === 'table' || mode === 'array') &&
                checkbox('trackLatest', 'trackLatest', 'Keep the newest message in state.')}
            {mode === 'container' &&
                checkbox(
                    'invalidateOnChange',
                    'invalidate search cache on change',
                    'Calls useTiledInvalidate().roots("search") from the callbacks, so the node browser refreshes.',
                )}
        </div>
    );
}

// #region bodies

interface BodyProps {
    path: string;
    connection: TiledConnectionConfig;
    options: CommittedOptions;
    log: StreamLog;
    socketFactory?: TiledSocketFactory;
    onSubscribeChild: (path: string, mode: SubscriptionMode) => void;
}

/** Callbacks every hook-based body passes, so lifecycle changes show up in the log. */
function lifecycle(log: StreamLog) {
    return {
        onStatus: (status: TiledConnectionStatus) => log.pushNote('status', status),
        onError: (error: TiledSubscriptionError) =>
            log.pushNote(
                'error',
                `${error.kind}${error.code !== undefined ? ` (${error.code})` : ''}: ${error.message}`,
            ),
    };
}

interface ChildRow {
    key: string;
    structureFamily?: string;
    specs: string[];
    createdAt?: string;
    updatedAt?: string;
    metadataKeys: string[];
    exitStatus?: string;
}

function ContainerBody({ path, options, log, socketFactory, onSubscribeChild }: BodyProps) {
    const invalidate = useTiledInvalidate();
    const [children, setChildren] = useState<Record<string, ChildRow>>({});

    const upsert = (
        message: ContainerChildCreatedMessage | ContainerChildMetadataUpdatedMessage,
    ) => {
        setChildren((current) => {
            const previous = current[message.key];
            const stop = message.metadata.stop as { exit_status?: string } | undefined;
            const created = message.type === 'container-child-created';
            return {
                ...current,
                [message.key]: {
                    key: message.key,
                    structureFamily: created ? message.structure_family : previous?.structureFamily,
                    specs: message.specs.map((spec) => spec.name),
                    createdAt: created ? message.timestamp : previous?.createdAt,
                    updatedAt: created ? previous?.updatedAt : message.timestamp,
                    metadataKeys: Object.keys(message.metadata),
                    exitStatus: stop?.exit_status ?? previous?.exitStatus,
                },
            };
        });
        if (options.invalidateOnChange) void invalidate.roots('search', 'metadata');
    };

    const result = useTiledContainerSubscription(path, {
        ...options.subscription,
        ...lifecycle(log),
        socketFactory,
        onSchema: log.pushMessage,
        onChildCreated(message) {
            log.pushMessage(message);
            upsert(message);
        },
        onChildMetadataUpdated(message) {
            log.pushMessage(message);
            upsert(message);
        },
    });

    const rows = Object.values(children);
    return (
        <>
            <StatusLine {...result} log={log} />
            <p className="text-xs text-slate-500">
                Reports <b>direct</b> children only. Create a child, or update one&apos;s metadata,
                and it appears here. Data written to a table or array further down does not; open
                that node in its own panel.
            </p>
            <table className="w-full text-left text-xs">
                <thead className="text-slate-500">
                    <tr>
                        <th className="py-1">key</th>
                        <th>family</th>
                        <th>specs</th>
                        <th title="Tiled's own timestamps, in the server's clock (no timezone).">
                            created (server)
                        </th>
                        <th title="Tiled's own timestamps, in the server's clock (no timezone).">
                            updated (server)
                        </th>
                        <th>stop</th>
                        <th />
                    </tr>
                </thead>
                <tbody className="font-mono">
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-1 text-slate-400">
                                (no child events since subscribing)
                            </td>
                        </tr>
                    )}
                    {rows.map((row) => (
                        <tr key={row.key} className="border-t border-slate-100">
                            <td className="py-1">{row.key}</td>
                            <td>{row.structureFamily ?? '?'}</td>
                            <td>{row.specs.join(', ') || '-'}</td>
                            <td>{row.createdAt?.slice(11, 19) ?? '-'}</td>
                            <td>{row.updatedAt?.slice(11, 19) ?? '-'}</td>
                            <td>{row.exitStatus ?? '-'}</td>
                            <td className="text-right">
                                <button
                                    type="button"
                                    className={buttonClass}
                                    onClick={() =>
                                        onSubscribeChild(
                                            path ? `${path}/${row.key}` : row.key,
                                            modeForFamily(row.structureFamily),
                                        )
                                    }
                                >
                                    Subscribe
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

function TableBody({ path, options, log, socketFactory }: BodyProps) {
    const result = useTiledTableSubscription(path, {
        ...options.subscription,
        ...lifecycle(log),
        socketFactory,
        accumulate: options.accumulate,
        maxRows: options.maxRows,
        trackLatest: options.trackLatest,
        onSchema: log.pushMessage,
        onData: log.pushMessage,
    });

    const rows = result.rows ?? (result.latest?.payload as Record<string, unknown[]> | undefined);
    const columns = rows ? Object.keys(rows) : [];
    const length = columns.length ? (rows?.[columns[0]]?.length ?? 0) : 0;
    const shownFrom = Math.max(0, length - 50);

    return (
        <>
            <StatusLine {...result} log={log} />
            <p className="text-xs text-slate-500">
                {result.schema
                    ? `table-schema received (${result.schema.arrow_schema.length.toLocaleString()}-char Arrow schema; not decoded). It describes the columns, not existing rows: pass start=0 to replay retained rows.`
                    : 'waiting for table-schema…'}
            </p>
            <p className="text-xs font-medium text-slate-700">
                {options.accumulate
                    ? `accumulated rows: ${length.toLocaleString()}${options.maxRows ? ` (max ${options.maxRows})` : ''}`
                    : options.trackLatest
                      ? `latest payload: ${length} rows`
                      : 'callback mode: no state kept; see the log'}
                {length > 50 && ` · showing the last 50`}
            </p>
            {columns.length > 0 && (
                <div className="max-h-64 overflow-auto rounded border border-slate-200">
                    <table className="w-full text-left font-mono text-xs">
                        <thead className="sticky top-0 bg-slate-100 text-slate-600">
                            <tr>
                                <th className="px-2">#</th>
                                {columns.map((column) => (
                                    <th key={column} className="px-2">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: length - shownFrom }, (_, offset) => {
                                const index = shownFrom + offset;
                                return (
                                    <tr key={index} className="border-t border-slate-100">
                                        <td className="px-2 text-slate-400">{index}</td>
                                        {columns.map((column) => (
                                            <td key={column} className="px-2">
                                                {formatCell(rows?.[column]?.[index])}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

function ArrayBody({ path, options, log, socketFactory }: BodyProps) {
    const result = useTiledArraySubscription<unknown>(path, {
        ...options.subscription,
        ...lifecycle(log),
        socketFactory,
        trackLatest: options.trackLatest,
        onSchema: log.pushMessage,
        onData: log.pushMessage,
        onRef: log.pushMessage,
    });
    const latest = result.latest;
    const dtype = result.schema?.data_type;

    return (
        <>
            <StatusLine {...result} log={log} />
            <p className="text-xs text-slate-500">
                {dtype
                    ? `dtype ${dtype.kind}${dtype.itemsize} (${dtype.endianness}). `
                    : 'waiting for array-schema… '}
                Every array-data message carries the written data in full; the server cannot leave
                it out. Only data registered with put_data_source arrives as a lightweight
                array-ref.
            </p>
            {!options.trackLatest && (
                <p className="text-xs text-slate-600">
                    trackLatest is off: nothing is kept in state. Messages only reach the log.
                </p>
            )}
            {latest?.type === 'array-data' && <ArrayDataView message={latest} />}
            {latest?.type === 'array-ref' && <ArrayRefView message={latest} />}
        </>
    );
}

function ArrayDataView({ message }: { message: ArrayDataMessage<unknown> }) {
    return (
        <div className="flex flex-wrap items-start gap-3">
            <ArrayPreview payload={message.payload} />
            <dl className="grid grid-cols-[auto_auto] gap-x-3 font-mono text-xs">
                <dt className="text-slate-500">sequence</dt>
                <dd>{message.sequence}</dd>
                <dt className="text-slate-500">shape</dt>
                <dd>[{message.shape.join(', ')}]</dd>
                <dt className="text-slate-500">offset</dt>
                <dd>{message.offset ? `[${message.offset.join(', ')}]` : 'null (full write)'}</dd>
                <dt className="text-slate-500">block</dt>
                <dd>{message.block ? `[${message.block.join(', ')}]` : 'null'}</dd>
                <dt className="text-slate-500">mimetype</dt>
                <dd>{message.mimetype}</dd>
            </dl>
        </div>
    );
}

function ArrayRefView({ message }: { message: ArrayRefMessage }) {
    return (
        <div className="space-y-1 text-xs">
            <p>
                array-ref #{message.sequence}: shape [{message.shape.join(', ')}]
                {message.patch && ` · patch offset [${message.patch.offset.join(', ')}]`}
            </p>
            <a
                href={message.uri}
                target="_blank"
                rel="noreferrer"
                className="break-all font-mono text-sky-700 underline"
            >
                {message.uri}
            </a>
        </div>
    );
}

function GenericBody({ path, options, log, socketFactory }: BodyProps) {
    const result = useTiledSubscription(path, {
        ...options.subscription,
        ...lifecycle(log),
        socketFactory,
        onMessage: log.pushMessage,
    });
    return (
        <>
            <StatusLine {...result} log={log} />
            <p className="text-xs text-slate-500">
                lastMessage (re-renders once per message, because trackLastMessage defaults to
                true):
            </p>
            <JsonResultViewer
                value={result.lastMessage ?? '(none yet)'}
                maxHeightClass="max-h-48"
            />
        </>
    );
}

/**
 * Drives `TiledSubscription` directly, as non-React code would. Unlike the hooks under a provider,
 * this can send the connection bar's access token, so it is the way to test token auth.
 */
function RawBody({ path, connection, options, log, socketFactory }: BodyProps) {
    const [subscription, setSubscription] = useState<TiledSubscription | null>(null);
    const [status, setStatus] = useState<TiledConnectionStatus>('idle');
    const [error, setError] = useState<TiledSubscriptionError>();
    const [, setTick] = useState(0);

    useEffect(() => {
        const client = new TiledWebSocketClient({
            baseUrl: connection.baseUrl,
            apiKey: connection.apiKey || null,
            accessToken: connection.accessToken || null,
            socketFactory,
        });
        const next = client.subscribe(
            resolveTiledPath(path, connection.initialPath),
            options.subscription,
        );
        const offs = [
            next.onStatus((value) => {
                setStatus(value);
                log.pushNote('status', value);
            }),
            next.onMessage((message) => {
                log.pushMessage(message);
                setTick((value) => value + 1);
            }),
            next.onError((value) => {
                setError(value);
                lifecycle(log).onError(value);
            }),
        ];
        setSubscription(next);
        next.connect();
        return () => {
            for (const off of offs) off();
            next.disconnect();
        };
        // The panel remounts this body on every Subscribe, so these are fixed for its lifetime.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <StatusLine
                log={log}
                status={status}
                sequence={subscription?.getLastSequence()}
                error={error}
                disconnect={() => subscription?.disconnect()}
                reconnect={() => {
                    setError(undefined);
                    subscription?.reconnect();
                }}
                extra={
                    <>
                        <button
                            type="button"
                            className={buttonClass}
                            onClick={() => subscription?.connect()}
                        >
                            connect()
                        </button>
                        <span className="text-xs text-slate-500">
                            dropped {subscription?.getDroppedCount() ?? 0} ·{' '}
                            {connection.accessToken
                                ? 'auth frame: access_token'
                                : connection.apiKey
                                  ? 'auth frame: api_key'
                                  : 'no auth frame'}
                        </span>
                    </>
                }
            />
        </>
    );
}

// #endregion

const STATUS_COLORS: Record<TiledConnectionStatus, string> = {
    idle: 'bg-slate-300',
    connecting: 'bg-amber-400',
    reconnecting: 'bg-amber-500',
    connected: 'bg-emerald-500',
    closed: 'bg-slate-400',
    error: 'bg-rose-500',
};

function StatusLine({
    status,
    sequence,
    log,
    error,
    disconnect,
    reconnect,
    extra,
}: {
    status: TiledConnectionStatus;
    /** What the hook returned as `sequence`. In callback mode it only refreshes on status changes. */
    sequence?: number;
    log: StreamLog;
    error?: TiledSubscriptionError;
    disconnect: () => void;
    reconnect: () => void;
    extra?: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className={`${STATUS_COLORS[status]} h-2.5 w-2.5 rounded-full`} />
                <span data-testid="subscription-status" className="text-sm font-medium">
                    {status}
                </span>
                <span className="text-xs text-slate-500">
                    last sequence delivered {log.lastSequence ?? '-'}
                    {log.lastSequence !== undefined &&
                        ` · a reconnect asks for start=${log.lastSequence + 1}`}
                    {' · '}
                    <span title="The hook's own `sequence`. With trackLastMessage off (the typed hooks), it only refreshes when the status changes, to avoid a render per message.">
                        hook.sequence {sequence ?? '-'}
                    </span>
                </span>
                <button type="button" className={`${buttonClass} ml-auto`} onClick={disconnect}>
                    disconnect()
                </button>
                <button type="button" className={buttonClass} onClick={reconnect}>
                    reconnect()
                </button>
                {extra}
            </div>
            {error && (
                <p className="text-xs text-rose-600">
                    {error.kind}
                    {error.code !== undefined ? ` (close ${error.code})` : ''}: {error.message}
                </p>
            )}
        </div>
    );
}

function formatCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number')
        return Number.isInteger(value) ? String(value) : value.toPrecision(6);
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
