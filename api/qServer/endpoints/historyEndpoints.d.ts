import { GetWithBodyOptions, QServerPayload, QServerRequestOptions } from '../types/common';
import { ClearHistoryResponse, GetHistoryResponse } from '../types/history';
import { QServerEndpointDescriptor } from '../types/registry';
export interface QServerHistoryEndpoints {
    /** `GET /api/history/get` — completed items with their results. */
    getQueueHistory(payload?: QServerPayload, options?: GetWithBodyOptions<GetHistoryResponse>): Promise<GetHistoryResponse>;
    /** `POST /api/history/clear` — discard the history. */
    clearHistory(options?: QServerRequestOptions): Promise<ClearHistoryResponse>;
}
export declare const historyEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=historyEndpoints.d.ts.map