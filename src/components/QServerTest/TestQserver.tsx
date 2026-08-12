import { useMemo, useState } from 'react';
import {
    createQServerApiClient,
    getReadOnlyEndpoints,
    normalizeQServerBaseUrl,
    QSERVER_ENDPOINTS,
    type QServerApiClient,
    type QServerEndpointGroup,
} from '@/api/qServer_new';
import { useQueueServerApiUrls } from '@/utils/apiUtils';
import ConnectionBar from './ConnectionBar';
import EndpointGroupAccordion from './EndpointGroupAccordion';
import InterceptorPlayground from './InterceptorPlayground';
import SocketPane from './SocketPane';
import { groupEndpoints } from './testQserverUtils';
import { useEndpointRunner } from './useEndpointRunner';

export interface TestQserverProps {
    /** Exercise a caller-supplied client instead of one built from the Finch config. */
    client?: QServerApiClient;
    /** Server origin. Defaults to the configured queue-server URL, minus any `/api`. */
    initialBaseUrl?: string;
    initialApiKey?: string;
    /** Groups expanded on first render. */
    defaultOpenGroups?: QServerEndpointGroup[];
    hideSockets?: boolean;
    className?: string;
}

/**
 * Manual test harness for the `qServer_new` client.
 *
 * Every row is rendered from `QSERVER_ENDPOINTS`, so the harness covers all 70 operations by
 * construction and gains new ones automatically. Alongside the endpoints it exercises the
 * three parts that are hard to unit test convincingly: hot API-key swapping, the interceptor
 * utilities, and the websockets in both auth modes.
 */
export default function TestQserver({
    client: injectedClient,
    initialBaseUrl,
    initialApiKey,
    defaultOpenGroups = ['status'],
    hideSockets = false,
    className = '',
}: TestQserverProps) {
    const { httpBaseUrl, apiKey: configApiKey } = useQueueServerApiUrls();

    const client = useMemo(
        () =>
            injectedClient ??
            createQServerApiClient({
                baseUrl: normalizeQServerBaseUrl(initialBaseUrl ?? httpBaseUrl),
                apiKey: initialApiKey ?? configApiKey ?? null,
            }),
        [injectedClient, initialBaseUrl, initialApiKey, httpBaseUrl, configApiKey],
    );

    const runner = useEndpointRunner(client);
    const [busy, setBusy] = useState(false);
    // Bumped after Apply so panes reading client config (the sockets) pick up new values.
    const [configVersion, setConfigVersion] = useState(0);

    const buckets = useMemo(() => groupEndpoints(QSERVER_ENDPOINTS), []);
    const snapshot = client.getConfigSnapshot();
    const exercised = runner.exercisedIds.length;

    const runReadOnly = async () => {
        setBusy(true);
        try {
            await runner.runMany(getReadOnlyEndpoints());
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={`mx-auto max-w-5xl pb-16 text-slate-900 dark:text-slate-100 ${className}`}>
            <ConnectionBar
                key={configVersion}
                client={client}
                busy={busy}
                onRunReadOnly={() => {
                    setConfigVersion((value) => value + 1);
                    void runReadOnly();
                }}
                onReset={runner.reset}
            />

            <div className="space-y-4 p-3">
                <header>
                    <h2 className="text-lg font-semibold">Queue Server client test harness</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {QSERVER_ENDPOINTS.length} operations · exercising{' '}
                        <code>{snapshot.baseUrl || '(no base URL)'}</code> · key{' '}
                        {snapshot.apiKey ? 'set' : 'not set'} ({snapshot.apiKeyLocation})
                    </p>
                </header>

                {!hideSockets && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">Websockets</h3>
                        {(['console', 'status', 'info'] as const).map((channel) => (
                            <SocketPane
                                key={`${channel}-${configVersion}`}
                                channel={channel}
                                baseUrl={snapshot.baseUrl}
                                apiKey={snapshot.apiKey}
                            />
                        ))}
                    </div>
                )}

                <InterceptorPlayground client={client} />

                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Endpoints</h3>
                    {buckets.map((bucket) => (
                        <EndpointGroupAccordion
                            key={bucket.group}
                            group={bucket.group}
                            endpoints={bucket.endpoints}
                            states={runner.states}
                            defaultOpen={defaultOpenGroups.includes(bucket.group)}
                            onRun={(endpoint, input) => void runner.run(endpoint, input)}
                        />
                    ))}
                </div>

                <footer className="text-xs text-slate-500 dark:text-slate-400">
                    {exercised} / {QSERVER_ENDPOINTS.length} endpoints exercised this session.
                    {exercised < QSERVER_ENDPOINTS.length && (
                        <details className="mt-1">
                            <summary className="cursor-pointer">Show the ones not yet run</summary>
                            <p className="mt-1 font-mono">
                                {QSERVER_ENDPOINTS.filter((endpoint) => !runner.states[endpoint.id])
                                    .map((endpoint) => endpoint.id)
                                    .join(', ')}
                            </p>
                        </details>
                    )}
                </footer>
            </div>
        </div>
    );
}
