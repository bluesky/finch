/* eslint-disable react-refresh/only-export-components --
 * `emptyTiledConnection` is the default value for this component's own config type; a separate file
 * for one factory would be ceremony. Dev-harness module, so HMR granularity is not worth it.
 */
import { useState } from 'react';
import type { TiledApiKeyLocation, TiledApiKeyScheme } from '@/api/tiled';

/**
 * Server and credentials for a Tiled dev harness.
 *
 * Presentational: it owns the form state and hands back a committed config. What a harness does
 * with that is its own business — `TestTiled` builds a client directly, the query playground feeds
 * it to a `TiledApiProvider`.
 *
 * **Apply is explicit.** Committing on every keystroke would rebuild the client, which in the
 * playground remounts every live query and fires a request per character typed. The form stages
 * edits and the bar says when they are uncommitted.
 */

export interface TiledConnectionConfig {
    /** Must include the `/api/v1` segment; nothing appends it. */
    baseUrl: string;
    /** Prefix prepended to relative paths. Part of the cache scope, which is why it is here. */
    initialPath: string;
    apiKey: string;
    apiKeyScheme: TiledApiKeyScheme;
    apiKeyLocation: TiledApiKeyLocation;
    /** Sent as `Authorization: Bearer …`; takes precedence over the API key. */
    accessToken: string;
    /** The other half of the session, so the 401 refresh path can be exercised by hand. */
    refreshToken: string;
    /**
     * Whether tokens go to `localStorage` rather than to an in-memory store.
     *
     * Off by default, and that default matters: the browser keys (`tiledAccessToken` /
     * `tiledRefreshToken`) are **shared with the `<Tiled>` viewer component**, so an experimental
     * token typed here would otherwise change the session for the rest of the app.
     */
    useBrowserStorage: boolean;
}

export interface TiledConnectionBarProps {
    /** The committed config — what the harness is actually using. */
    applied: TiledConnectionConfig;
    onApply: (config: TiledConnectionConfig) => void;
    /** Rendered beside the controls: version, auth mode, whatever the harness knows. */
    status?: React.ReactNode;
    /** Extra controls (sweep buttons, counters) rendered on the action row. */
    actions?: React.ReactNode;
}

const inputClass =
    'w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-900 ' +
    'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

const buttonClass =
    'rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 ' +
    'dark:border-slate-600 dark:hover:bg-slate-700';

export default function TiledConnectionBar({
    applied,
    onApply,
    status,
    actions,
}: TiledConnectionBarProps) {
    const [draft, setDraft] = useState<TiledConnectionConfig>(applied);
    const [showSecrets, setShowSecrets] = useState(false);

    const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
    const set = <K extends keyof TiledConnectionConfig>(key: K, value: TiledConnectionConfig[K]) =>
        setDraft((current) => ({ ...current, [key]: value }));

    return (
        <section className="space-y-2 rounded border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Connection</h2>
                {dirty && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                        uncommitted changes — Apply to use them
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <label className="text-xs">
                    <span className="text-slate-500">base URL — must include /api/v1</span>
                    <input
                        type="text"
                        value={draft.baseUrl}
                        onChange={(event) => set('baseUrl', event.target.value)}
                        className={inputClass}
                    />
                </label>
                <label className="text-xs">
                    <span className="text-slate-500">
                        initial path — prepended to relative paths, and part of the cache scope
                    </span>
                    <input
                        type="text"
                        value={draft.initialPath}
                        onChange={(event) => set('initialPath', event.target.value)}
                        placeholder="(none)"
                        className={inputClass}
                    />
                </label>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <label className="text-xs">
                    <span className="text-slate-500">API key</span>
                    <input
                        type={showSecrets ? 'text' : 'password'}
                        value={draft.apiKey}
                        onChange={(event) => set('apiKey', event.target.value)}
                        className={inputClass}
                    />
                </label>
                <label className="text-xs">
                    <span className="text-slate-500">scheme</span>
                    <select
                        value={draft.apiKeyScheme}
                        onChange={(event) =>
                            set('apiKeyScheme', event.target.value as TiledApiKeyScheme)
                        }
                        className={inputClass}
                    >
                        <option value="ApiKey">ApiKey</option>
                        <option value="Apikey">Apikey</option>
                    </select>
                </label>
                <label className="text-xs">
                    <span className="text-slate-500">location</span>
                    <select
                        value={draft.apiKeyLocation}
                        onChange={(event) =>
                            set('apiKeyLocation', event.target.value as TiledApiKeyLocation)
                        }
                        className={inputClass}
                    >
                        <option value="header">header</option>
                        <option value="query">query (?api_key=)</option>
                    </select>
                </label>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <label className="text-xs">
                    <span className="text-slate-500">
                        access token — sent as Bearer, wins over the API key
                    </span>
                    <input
                        type={showSecrets ? 'text' : 'password'}
                        value={draft.accessToken}
                        onChange={(event) => set('accessToken', event.target.value)}
                        className={inputClass}
                    />
                </label>
                <label className="text-xs">
                    <span className="text-slate-500">
                        refresh token — exchanged automatically on a 401
                    </span>
                    <input
                        type={showSecrets ? 'text' : 'password'}
                        value={draft.refreshToken}
                        onChange={(event) => set('refreshToken', event.target.value)}
                        className={inputClass}
                    />
                </label>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                    type="checkbox"
                    checked={draft.useBrowserStorage}
                    onChange={(event) => set('useBrowserStorage', event.target.checked)}
                />
                persist tokens to localStorage —{' '}
                <span className="text-amber-600 dark:text-amber-400">
                    shares keys with the &lt;Tiled&gt; viewer, so this changes its session too
                </span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={buttonClass} onClick={() => onApply(draft)}>
                    Apply
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => setDraft(applied)}
                    disabled={!dirty}
                >
                    Revert
                </button>
                <button
                    type="button"
                    className={buttonClass}
                    onClick={() => setShowSecrets((value) => !value)}
                >
                    {showSecrets ? 'Hide' : 'Show'} secrets
                </button>
                {actions}
            </div>

            {status && <p className="text-xs text-slate-500">{status}</p>}
        </section>
    );
}

/** A config pointing nowhere, for a harness that has not read its Finch config yet. */
export function emptyTiledConnection(baseUrl = ''): TiledConnectionConfig {
    return {
        baseUrl,
        initialPath: '',
        apiKey: '',
        apiKeyScheme: 'ApiKey',
        apiKeyLocation: 'header',
        accessToken: '',
        refreshToken: '',
        useBrowserStorage: false,
    };
}
