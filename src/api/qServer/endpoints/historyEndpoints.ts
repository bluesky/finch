import type { GetWithBodyOptions, QServerPayload, QServerRequestOptions } from '../types/common';
import type { ClearHistoryResponse, GetHistoryResponse } from '../types/history';
import { QSERVER_PATHS } from '../types/paths';
import type { QServerEndpointDescriptor } from '../types/registry';

export interface QServerHistoryEndpoints {
    /** `GET /api/history/get` — completed items with their results. */
    getQueueHistory(
        payload?: QServerPayload,
        options?: GetWithBodyOptions<GetHistoryResponse>,
    ): Promise<GetHistoryResponse>;
    /** `POST /api/history/clear` — discard the history. */
    clearHistory(options?: QServerRequestOptions): Promise<ClearHistoryResponse>;
}

export const historyEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'history.get',
        group: 'history',
        method: 'GET',
        path: QSERVER_PATHS.historyGet,
        fn: 'getQueueHistory',
        summary: 'Plan history with results.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getQueueHistory(input.payload),
    },
    {
        id: 'history.clear',
        group: 'history',
        method: 'POST',
        path: QSERVER_PATHS.historyClear,
        fn: 'clearHistory',
        summary: 'Discard the plan history.',
        browserSafe: true,
        destructive: true,
        call: (client) => client.clearHistory(),
    },
];
