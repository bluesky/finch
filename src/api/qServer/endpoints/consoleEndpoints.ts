import type { GetWithBodyOptions, QServerRequestOptions } from '../types/common';
import type {
    ConsoleOutputBody,
    ConsoleOutputUpdateBody,
    GetConsoleOutputResponse,
    GetConsoleOutputUidResponse,
    GetConsoleOutputUpdateResponse,
} from '../types/console';
import { QSERVER_PATHS } from '../types/paths';
import { payloadAs, type QServerEndpointDescriptor } from '../types/registry';

/**
 * Polling counterparts to the console websocket.
 *
 * For live output prefer `useQServerConsoleSocket`; these exist for one-shot reads and for
 * environments where a websocket is not available.
 */
export interface QServerConsoleEndpoints {
    /** `GET /api/console_output` — the last `nlines` of console text. */
    getConsoleOutput(
        payload?: ConsoleOutputBody,
        options?: GetWithBodyOptions<GetConsoleOutputResponse>,
    ): Promise<GetConsoleOutputResponse>;
    /** `GET /api/console_output/uid` — uid of the most recent console message. */
    getConsoleOutputUID(options?: QServerRequestOptions): Promise<GetConsoleOutputUidResponse>;
    /**
     * `GET /api/console_output_update` — messages newer than `last_msg_uid`.
     *
     * Requires a request body, so browsers get a synthesized response built from
     * `getConsoleOutput` + `getConsoleOutputUID` instead.
     */
    getConsoleOutputUpdate(
        payload?: ConsoleOutputUpdateBody,
        options?: GetWithBodyOptions<GetConsoleOutputUpdateResponse>,
    ): Promise<GetConsoleOutputUpdateResponse>;
    /** `GET /api/stream_console_output` — a never-ending text stream of console output. */
    streamConsoleOutput(options?: QServerRequestOptions): Promise<string>;
}

export const consoleEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'console.output',
        group: 'console',
        method: 'GET',
        path: QSERVER_PATHS.consoleOutput,
        fn: 'getConsoleOutput',
        summary: 'Recent console text.',
        payloadGet: true,
        browserSafe: true,
        sampleBody: { nlines: 200 },
        call: (client, input) => client.getConsoleOutput(payloadAs<ConsoleOutputBody>(input)),
    },
    {
        id: 'console.outputUid',
        group: 'console',
        method: 'GET',
        path: QSERVER_PATHS.consoleOutputUid,
        fn: 'getConsoleOutputUID',
        summary: 'Uid of the latest console message.',
        browserSafe: true,
        call: (client) => client.getConsoleOutputUID(),
    },
    {
        id: 'console.outputUpdate',
        group: 'console',
        method: 'GET',
        path: QSERVER_PATHS.consoleOutputUpdate,
        fn: 'getConsoleOutputUpdate',
        summary: 'Messages newer than a uid (body required; browsers use a fallback).',
        payloadGet: true,
        bodyRequired: true,
        browserSafe: true,
        hasFallback: true,
        sampleBody: { last_msg_uid: '' },
        call: (client, input) => client.getConsoleOutputUpdate(input.payload),
    },
    {
        id: 'console.stream',
        group: 'console',
        method: 'GET',
        path: QSERVER_PATHS.streamConsoleOutput,
        fn: 'streamConsoleOutput',
        summary: 'Open-ended text stream — prefer the console websocket.',
        browserSafe: true,
        streaming: true,
        call: (client) => client.streamConsoleOutput({ axiosConfig: { timeout: 3000 } }),
    },
];
