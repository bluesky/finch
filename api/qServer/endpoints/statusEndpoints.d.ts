import { GetWithBodyOptions, QServerPayload } from '../types/common';
import { QServerEndpointDescriptor } from '../types/registry';
import { GetConfigResponse, GetStatusResponse, PingResponse } from '../types/status';
export interface QServerStatusEndpoints {
    /** `GET /api/ping` — returns the full status payload. */
    ping(payload?: QServerPayload, options?: GetWithBodyOptions<PingResponse>): Promise<PingResponse>;
    /** `GET /api/` — identical to {@link ping}. */
    getRoot(payload?: QServerPayload, options?: GetWithBodyOptions<PingResponse>): Promise<PingResponse>;
    /** `GET /api/status` — RE Manager state, queue/history sizes, and change uids. */
    getStatus(payload?: QServerPayload, options?: GetWithBodyOptions<GetStatusResponse>): Promise<GetStatusResponse>;
    /** `GET /api/config/get` — server configuration, e.g. IPython connection info. */
    getConfig(payload?: QServerPayload, options?: GetWithBodyOptions<GetConfigResponse>): Promise<GetConfigResponse>;
}
export declare const statusEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=statusEndpoints.d.ts.map