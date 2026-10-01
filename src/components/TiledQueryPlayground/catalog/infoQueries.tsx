/* eslint-disable react-refresh/only-export-components --
 * A Runner has to live beside its descriptor: the descriptor's whole purpose is to pair a hook's
 * metadata with the one component allowed to call it. Splitting them to satisfy fast refresh would
 * scatter 41 one-hook components across 41 files and leave the catalog pointing at them from
 * elsewhere. These are dev-harness modules; losing component-level HMR granularity here costs
 * nothing.
 */
import {
    useTiledAboutQuery,
    useTiledHealthQuery,
    useTiledMetricsQuery,
    useTiledServerInfoQuery,
    useTiledUiSettingsQuery,
    useTiledWhoamiQuery,
} from '@/api/tiled';
import QueryResultPanel from '../QueryResultPanel';
import type { QueryDescriptor, QueryRunnerProps } from '../types';

/**
 * Whole-server reads, and `whoami`.
 *
 * None of these take an argument, which makes them the right group to open the playground on: no
 * field to fill before anything happens.
 */

function ServerInfoRunner({ queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledServerInfoQuery(queryOptions, requestOptions);
    return <QueryResultPanel result={result} resultKind="json" />;
}

function AboutRunner({ queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledAboutQuery(queryOptions, requestOptions);
    return <QueryResultPanel result={result} resultKind="json" />;
}

function HealthRunner({ queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledHealthQuery(queryOptions, requestOptions);
    return <QueryResultPanel result={result} resultKind="json" />;
}

function UiSettingsRunner({ queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledUiSettingsQuery(queryOptions, requestOptions);
    return <QueryResultPanel result={result} resultKind="json" />;
}

function MetricsRunner({ queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledMetricsQuery(queryOptions, requestOptions);
    return <QueryResultPanel result={result} resultKind="text" />;
}

function WhoamiRunner({ queryOptions, requestOptions }: QueryRunnerProps) {
    const result = useTiledWhoamiQuery(queryOptions, requestOptions);
    return <QueryResultPanel result={result} resultKind="json" />;
}

export const infoQueryDescriptors: readonly QueryDescriptor[] = [
    {
        id: 'info.serverInfo',
        group: 'info',
        hookName: 'useTiledServerInfoQuery',
        summary:
            'The About document, resolving null for an unreachable server rather than erroring.',
        fields: [],
        resultKind: 'json',
        Runner: ServerInfoRunner,
    },
    {
        id: 'info.about',
        group: 'info',
        hookName: 'useTiledAboutQuery',
        summary:
            'The same document, rejecting on failure. Keyed separately — compare the two in the cache.',
        fields: [],
        resultKind: 'json',
        Runner: AboutRunner,
    },
    {
        id: 'info.healthz',
        group: 'info',
        hookName: 'useTiledHealthQuery',
        summary: 'Liveness. Outside /api/v1, so it goes to the origin derived from the base URL.',
        fields: [],
        resultKind: 'json',
        Runner: HealthRunner,
    },
    {
        id: 'info.uiSettings',
        group: 'info',
        hookName: 'useTiledUiSettingsQuery',
        summary: "The server's hints for its own web UI. Also origin-scoped.",
        fields: [],
        resultKind: 'json',
        Runner: UiSettingsRunner,
    },
    {
        id: 'info.metrics',
        group: 'info',
        hookName: 'useTiledMetricsQuery',
        summary: 'Prometheus text. Often restricted, so a 403 here is a deployment choice.',
        fields: [],
        resultKind: 'text',
        Runner: MetricsRunner,
    },
    {
        id: 'auth.whoami',
        group: 'auth',
        hookName: 'useTiledWhoamiQuery',
        summary:
            'Who the current credentials identify. Fails on a server whose authentication.links is null.',
        fields: [],
        resultKind: 'json',
        Runner: WhoamiRunner,
    },
];
