import { QServerRequestOptions } from '../types/common';
import { EnvironmentResponse, EnvironmentUpdateBody, EnvironmentUpdateResponse } from '../types/environment';
import { QServerEndpointDescriptor } from '../types/registry';
export interface QServerEnvironmentEndpoints {
    /** `POST /api/environment/open` — start the worker environment. */
    openEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
    /** `POST /api/environment/close` — shut the worker environment down cleanly. */
    closeEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
    /** `POST /api/environment/destroy` — kill the worker, even mid-plan. */
    destroyEnvironment(options?: QServerRequestOptions): Promise<EnvironmentResponse>;
    /** `POST /api/environment/update` — re-run startup scripts in the live environment. */
    updateEnvironment(body?: EnvironmentUpdateBody, options?: QServerRequestOptions): Promise<EnvironmentUpdateResponse>;
}
export declare const environmentEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=environmentEndpoints.d.ts.map