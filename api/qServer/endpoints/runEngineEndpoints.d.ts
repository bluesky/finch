import { GetWithBodyOptions, QServerPayload, QServerRequestOptions } from '../types/common';
import { QServerEndpointDescriptor } from '../types/registry';
import { GetReMetadataResponse, GetRunsBody, GetRunsResponse, ReControlResponse, RePauseBody, ReResumeBody } from '../types/runEngine';
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
    getREMetadata(payload?: QServerPayload, options?: GetWithBodyOptions<GetReMetadataResponse>): Promise<GetReMetadataResponse>;
}
export declare const runEngineEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=runEngineEndpoints.d.ts.map