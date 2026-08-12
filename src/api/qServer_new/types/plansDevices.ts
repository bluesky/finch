import type { QServerSuccessResponse } from './common';

export interface Component {
    is_readable: boolean;
    is_movable: boolean;
    is_flyable: boolean;
    classname: string;
    module: string;
    components?: { [key: string]: Component };
}

export interface Device {
    is_readable: boolean;
    is_movable: boolean;
    is_flyable: boolean;
    classname: string;
    module: string;
    components?: { [key: string]: Component };
}

/**
 * One plan parameter as introspected by the queue server.
 *
 * `annotation.enums` / `enums` drive input widgets; the exact shape varies by how the
 * plan was decorated, so most fields are optional.
 */
export interface Parameter {
    name: string;
    kind?: {
        name: string;
        value: number;
    };
    description?: string;
    default?: string | string[];
    convert_device_names?: boolean;
    default_defined_in_decorator?: boolean;
    annotation?: {
        type: string;
        devices?: { [key: string]: string[] };
        enums?: string[];
    };
    module?: string;
    min?: string;
    max?: string;
    step?: string;
    enums?: string[];
}

export interface Plan {
    name: string;
    properties: {
        is_generator: boolean;
    };
    parameters: Parameter[];
    module: string;
    description?: string;
}

export interface PlansDevicesBody {
    /** Defaults to the calling user's group. */
    user_group?: string;
}

export interface GetPlansAllowedResponse extends QServerSuccessResponse {
    plans_allowed: { [key: string]: Plan };
    plans_allowed_uid: string;
}

export interface GetDevicesAllowedResponse extends QServerSuccessResponse {
    devices_allowed: { [key: string]: Device };
    devices_allowed_uid: string;
}

export interface GetPlansExistingResponse extends QServerSuccessResponse {
    plans_existing: { [key: string]: Plan };
    plans_existing_uid: string;
}

export interface GetDevicesExistingResponse extends QServerSuccessResponse {
    devices_existing: { [key: string]: Device };
    devices_existing_uid: string;
}
