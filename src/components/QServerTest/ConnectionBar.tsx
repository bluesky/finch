import { useState } from 'react';
import type {
    ApiKeyLocation,
    ApiKeyScheme,
    GetBodyStrategy,
    QServerApiClient,
} from '@/api/qServer_new';
import { formatError } from './testQserverUtils';

export interface ConnectionBarProps {
    client: QServerApiClient;
    onRunReadOnly: () => void;
    onReset: () => void;
    busy?: boolean;
}

const inputClass =
    'rounded border border-slate-300 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-800';

/**
 * Live connection controls.
 *
 * Applying a key or URL mutates the existing client rather than rebuilding it — which is
 * exactly the behaviour worth verifying by hand: subsequent calls pick up the new key with
 * no remount anywhere in the tree.
 */
export default function ConnectionBar({
    client,
    onRunReadOnly,
    onReset,
    busy,
}: ConnectionBarProps) {
    const snapshot = client.getConfigSnapshot();
    const [baseUrl, setBaseUrl] = useState(snapshot.baseUrl);
    const [apiKey, setApiKey] = useState(snapshot.apiKey ?? '');
    const [showKey, setShowKey] = useState(false);
    const [location, setLocation] = useState<ApiKeyLocation>(snapshot.apiKeyLocation);
    const [scheme, setScheme] = useState<ApiKeyScheme>(snapshot.apiKeyScheme);
    const [strategy, setStrategy] = useState<GetBodyStrategy>(snapshot.getBodyStrategy);
    const [ping, setPing] = useState<string>('');

    const looksLikeApiSuffix = /\/api\/?$/i.test(baseUrl);

    const apply = () => {
        client.setBaseUrl(baseUrl);
        client.setApiKey(apiKey || null);
        client.setApiKeyLocation(location);
        client.setApiKeyScheme(scheme);
        client.setGetBodyStrategy(strategy);
        setBaseUrl(client.getBaseUrl());
        setPing('');
    };

    const doPing = async () => {
        const started = performance.now();
        setPing('…');
        try {
            const status = await client.ping();
            setPing(`${Math.round(performance.now() - started)} ms — ${status.msg}`);
        } catch (error) {
            setPing(formatError(error));
        }
    };

    return (
        <div className="sticky top-0 z-10 space-y-2 border-b border-slate-300 bg-white/95 p-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs">
                    <span className="block text-slate-500 dark:text-slate-400">
                        Base URL (origin)
                    </span>
                    <input
                        value={baseUrl}
                        onChange={(event) => setBaseUrl(event.target.value)}
                        className={`${inputClass} w-64`}
                        placeholder="http://localhost:60610"
                    />
                </label>

                <label className="text-xs">
                    <span className="block text-slate-500 dark:text-slate-400">API key</span>
                    <span className="flex items-center gap-1">
                        <input
                            value={apiKey}
                            type={showKey ? 'text' : 'password'}
                            onChange={(event) => setApiKey(event.target.value)}
                            className={`${inputClass} w-40`}
                        />
                        <button
                            type="button"
                            className="text-xs text-slate-500 hover:underline"
                            onClick={() => setShowKey((value) => !value)}
                        >
                            {showKey ? 'hide' : 'show'}
                        </button>
                    </span>
                </label>

                <label className="text-xs">
                    <span className="block text-slate-500 dark:text-slate-400">Key location</span>
                    <select
                        value={location}
                        onChange={(event) => setLocation(event.target.value as ApiKeyLocation)}
                        className={inputClass}
                    >
                        <option value="header">header</option>
                        <option value="query">query</option>
                    </select>
                </label>

                <label className="text-xs">
                    <span className="block text-slate-500 dark:text-slate-400">Scheme</span>
                    <select
                        value={scheme}
                        onChange={(event) => setScheme(event.target.value as ApiKeyScheme)}
                        className={inputClass}
                    >
                        <option value="Apikey">Apikey</option>
                        <option value="ApiKey">ApiKey</option>
                    </select>
                </label>

                <label className="text-xs">
                    <span className="block text-slate-500 dark:text-slate-400">GET-body</span>
                    <select
                        value={strategy}
                        onChange={(event) => setStrategy(event.target.value as GetBodyStrategy)}
                        className={inputClass}
                    >
                        <option value="auto">auto</option>
                        <option value="body">body</option>
                        <option value="fallback">fallback</option>
                        <option value="throw">throw</option>
                    </select>
                </label>

                <button
                    type="button"
                    onClick={apply}
                    className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white dark:bg-slate-200 dark:text-slate-900"
                >
                    Apply
                </button>
                <button
                    type="button"
                    onClick={() => void doPing()}
                    className="rounded border border-slate-400 px-3 py-1 text-xs dark:border-slate-600"
                >
                    Ping
                </button>
                <button
                    type="button"
                    onClick={onRunReadOnly}
                    disabled={busy}
                    className="rounded border border-slate-400 px-3 py-1 text-xs disabled:opacity-40 dark:border-slate-600"
                >
                    Run all read-only
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    className="rounded border border-slate-400 px-3 py-1 text-xs dark:border-slate-600"
                >
                    Clear results
                </button>
            </div>

            {looksLikeApiSuffix && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                    This URL ends in <code>/api</code>. Spec paths already include it — Apply will
                    strip the suffix.
                </p>
            )}
            {ping && <p className="font-mono text-xs text-slate-600 dark:text-slate-300">{ping}</p>}
        </div>
    );
}
