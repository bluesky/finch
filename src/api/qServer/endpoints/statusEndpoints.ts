import type { GetWithBodyOptions, QServerPayload } from '../types/common';
import type { QServerEndpointDescriptor } from '../types/registry';
import type { GetConfigResponse, GetStatusResponse, PingResponse } from '../types/status';
import { QSERVER_PATHS } from '../types/paths';

export interface QServerStatusEndpoints {
    /** `GET /api/ping` — returns the full status payload. */
    ping(
        payload?: QServerPayload,
        options?: GetWithBodyOptions<PingResponse>,
    ): Promise<PingResponse>;
    /** `GET /api/` — identical to {@link ping}. */
    getRoot(
        payload?: QServerPayload,
        options?: GetWithBodyOptions<PingResponse>,
    ): Promise<PingResponse>;
    /** `GET /api/status` — RE Manager state, queue/history sizes, and change uids. */
    getStatus(
        payload?: QServerPayload,
        options?: GetWithBodyOptions<GetStatusResponse>,
    ): Promise<GetStatusResponse>;
    /** `GET /api/config/get` — server configuration, e.g. IPython connection info. */
    getConfig(
        payload?: QServerPayload,
        options?: GetWithBodyOptions<GetConfigResponse>,
    ): Promise<GetConfigResponse>;
}

export const statusEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'status.ping',
        group: 'status',
        method: 'GET',
        path: QSERVER_PATHS.ping,
        fn: 'ping',
        summary: 'Liveness check; returns the status payload.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.ping(input.payload),
    },
    {
        id: 'status.root',
        group: 'status',
        method: 'GET',
        path: QSERVER_PATHS.root,
        fn: 'getRoot',
        summary: 'Same payload as /api/ping.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getRoot(input.payload),
    },
    {
        id: 'status.status',
        group: 'status',
        method: 'GET',
        path: QSERVER_PATHS.status,
        fn: 'getStatus',
        summary: 'RE Manager status.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getStatus(input.payload),
    },
    {
        id: 'status.config',
        group: 'status',
        method: 'GET',
        path: QSERVER_PATHS.configGet,
        fn: 'getConfig',
        summary: 'Server configuration.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getConfig(input.payload),
    },
];
