import type { GetWithBodyOptions } from '../types/common';
import { QSERVER_PATHS } from '../types/paths';
import type {
    GetDevicesAllowedResponse,
    GetDevicesExistingResponse,
    GetPlansAllowedResponse,
    GetPlansExistingResponse,
    PlansDevicesBody,
} from '../types/plansDevices';
import type { QServerEndpointDescriptor } from '../types/registry';

export interface QServerPlansDevicesEndpoints {
    /** `GET /api/plans/allowed` — plans the caller's user group may run. */
    getPlansAllowed(
        payload?: PlansDevicesBody,
        options?: GetWithBodyOptions<GetPlansAllowedResponse>,
    ): Promise<GetPlansAllowedResponse>;
    /** `GET /api/devices/allowed` — devices the caller's user group may use. */
    getDevicesAllowed(
        payload?: PlansDevicesBody,
        options?: GetWithBodyOptions<GetDevicesAllowedResponse>,
    ): Promise<GetDevicesAllowedResponse>;
    /** `GET /api/plans/existing` — every plan in the worker namespace. */
    getPlansExisting(
        payload?: PlansDevicesBody,
        options?: GetWithBodyOptions<GetPlansExistingResponse>,
    ): Promise<GetPlansExistingResponse>;
    /** `GET /api/devices/existing` — every device in the worker namespace. */
    getDevicesExisting(
        payload?: PlansDevicesBody,
        options?: GetWithBodyOptions<GetDevicesExistingResponse>,
    ): Promise<GetDevicesExistingResponse>;
}

export const plansDevicesEndpointDescriptors: QServerEndpointDescriptor[] = [
    {
        id: 'plansDevices.plansAllowed',
        group: 'plansDevices',
        method: 'GET',
        path: QSERVER_PATHS.plansAllowed,
        fn: 'getPlansAllowed',
        summary: 'Plans allowed for the calling user group.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getPlansAllowed(input.payload),
    },
    {
        id: 'plansDevices.devicesAllowed',
        group: 'plansDevices',
        method: 'GET',
        path: QSERVER_PATHS.devicesAllowed,
        fn: 'getDevicesAllowed',
        summary: 'Devices allowed for the calling user group.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getDevicesAllowed(input.payload),
    },
    {
        id: 'plansDevices.plansExisting',
        group: 'plansDevices',
        method: 'GET',
        path: QSERVER_PATHS.plansExisting,
        fn: 'getPlansExisting',
        summary: 'All plans in the worker namespace.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getPlansExisting(input.payload),
    },
    {
        id: 'plansDevices.devicesExisting',
        group: 'plansDevices',
        method: 'GET',
        path: QSERVER_PATHS.devicesExisting,
        fn: 'getDevicesExisting',
        summary: 'All devices in the worker namespace.',
        payloadGet: true,
        browserSafe: true,
        call: (client, input) => client.getDevicesExisting(input.payload),
    },
];
