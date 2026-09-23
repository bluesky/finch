import { GetWithBodyOptions } from '../types/common';
import { GetDevicesAllowedResponse, GetDevicesExistingResponse, GetPlansAllowedResponse, GetPlansExistingResponse, PlansDevicesBody } from '../types/plansDevices';
import { QServerEndpointDescriptor } from '../types/registry';
export interface QServerPlansDevicesEndpoints {
    /** `GET /api/plans/allowed` — plans the caller's user group may run. */
    getPlansAllowed(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetPlansAllowedResponse>): Promise<GetPlansAllowedResponse>;
    /** `GET /api/devices/allowed` — devices the caller's user group may use. */
    getDevicesAllowed(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetDevicesAllowedResponse>): Promise<GetDevicesAllowedResponse>;
    /** `GET /api/plans/existing` — every plan in the worker namespace. */
    getPlansExisting(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetPlansExistingResponse>): Promise<GetPlansExistingResponse>;
    /** `GET /api/devices/existing` — every device in the worker namespace. */
    getDevicesExisting(payload?: PlansDevicesBody, options?: GetWithBodyOptions<GetDevicesExistingResponse>): Promise<GetDevicesExistingResponse>;
}
export declare const plansDevicesEndpointDescriptors: QServerEndpointDescriptor[];
//# sourceMappingURL=plansDevicesEndpoints.d.ts.map