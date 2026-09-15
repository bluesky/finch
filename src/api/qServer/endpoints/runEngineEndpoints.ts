import type { GetWithBodyOptions, QServerPayload, QServerRequestOptions } from '../types/common';
import { QSERVER_PATHS } from '../types/paths';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';
import type {
    GetReMetadataResponse,
    GetRunsBody,
    GetRunsResponse,
    ReControlResponse,
    RePauseBody,
    ReResumeBody,
} from '../types/runEngine';

export interface QServerRunEngineEndpoints {
    /** `POST /api/re/pause` — pause the Run Engine, deferred by default. */
    pauseRE(body?: RePauseBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
    /** `POST /api/re/resume` — resume a paused plan. */
    resumeRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
    /** `POST /api/re/stop` — stop a paused plan cleanly, marking it successful. */
    stopRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
    /** `POST /api/re/abort` — abort a paused plan, marking it failed. */
    abortRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
    /** `POST /api/re/halt` — halt immediately, skipping cleanup handlers. */
    haltRE(body?: ReResumeBody, options?: QServerRequestOptions): Promise<ReControlResponse>;
    /** `POST /api/re/runs` — run list selected by `option`. */
    getRuns(body?: GetRunsBody, options?: QServerRequestOptions): Promise<GetRunsResponse>;
    /** `GET /api/re/runs/active` — runs belonging to the currently executing plan. */
    getRunsActive(options?: QServerRequestOptions): Promise<GetRunsResponse>;
    /** `GET /api/re/runs/open` — runs that have been opened but not closed. */
    getRunsOpen(options?: QServerRequestOptions): Promise<GetRunsResponse>;
    /** `GET /api/re/runs/closed` — runs completed by the current plan. */
    getRunsClosed(options?: QServerRequestOptions): Promise<GetRunsResponse>;
    /**
     * `GET /api/re/metadata` — Run Engine metadata.
     *
     * Not implemented by every RE Manager build; v0.0.19 answers 400.
     */
    getREMetadata(
        payload?: QServerPayload,
        options?: GetWithBodyOptions<GetReMetadataResponse>,
    ): Promise<GetReMetadataResponse>;
}

export const runEngineEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 're.pause',
        group: 'runEngine',
        method: 'POST',
        path: QSERVER_PATHS.rePause,
        fn: 'pauseRE',
        summary: 'Pause the Run Engine.',
        browserSafe: true,
        sampleBody: { option: 'deferred' },
        call: (client, input) => client.pauseRE(payloadAs<RePauseBody>(input)),
    },
    {
        id: 're.resume',
        group: 'runEngine',
        method: 'POST',
        path: QSERVER_PATHS.reResume,
        fn: 'resumeRE',
        summary: 'Resume a paused plan.',
        browserSafe: true,
        call: (client) => client.resumeRE(),
    },
    {
        id: 're.stop',
        group: 'runEngine',
        method: 'POST',
        path: QSERVER_PATHS.reStop,
        fn: 'stopRE',
        summary: 'Stop a paused plan, marking it successful.',
        browserSafe: true,
        destructive: true,
        call: (client) => client.stopRE(),
    },
    {
        id: 're.abort',
        group: 'runEngine',
        method: 'POST',
        path: QSERVER_PATHS.reAbort,
        fn: 'abortRE',
        summary: 'Abort a paused plan, marking it failed.',
        browserSafe: true,
        destructive: true,
        call: (client) => client.abortRE(),
    },
    {
        id: 're.halt',
        group: 'runEngine',
        method: 'POST',
        path: QSERVER_PATHS.reHalt,
        fn: 'haltRE',
        summary: 'Halt immediately, skipping cleanup handlers.',
        browserSafe: true,
        destructive: true,
        call: (client) => client.haltRE(),
    },
    {
        id: 're.runs',
        group: 'runEngine',
        method: 'POST',
        path: QSERVER_PATHS.reRuns,
        fn: 'getRuns',
        summary: 'Run list selected by option.',
        browserSafe: true,
        sampleBody: { option: 'active' },
        call: (client, input) => client.getRuns(payloadAs<GetRunsBody>(input)),
    },
    {
        id: 're.runsActive',
        group: 'runEngine',
        method: 'GET',
        path: QSERVER_PATHS.reRunsActive,
        fn: 'getRunsActive',
        summary: 'Runs of the currently executing plan.',
        browserSafe: true,
        call: (client) => client.getRunsActive(),
    },
    {
        id: 're.runsOpen',
        group: 'runEngine',
        method: 'GET',
        path: QSERVER_PATHS.reRunsOpen,
        fn: 'getRunsOpen',
        summary: 'Runs opened but not yet closed.',
        browserSafe: true,
        call: (client) => client.getRunsOpen(),
    },
    {
        id: 're.runsClosed',
        group: 'runEngine',
        method: 'GET',
        path: QSERVER_PATHS.reRunsClosed,
        fn: 'getRunsClosed',
        summary: 'Runs closed by the current plan.',
        browserSafe: true,
        call: (client) => client.getRunsClosed(),
    },
    {
        id: 're.metadata',
        group: 'runEngine',
        method: 'GET',
        path: QSERVER_PATHS.reMetadata,
        fn: 'getREMetadata',
        summary: 'Run Engine metadata (unsupported by RE Manager v0.0.19).',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getREMetadata(input.payload),
    },
];
