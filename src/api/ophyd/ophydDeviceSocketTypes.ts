//Types for the responses and calls made to /api/v1/device-socket


//Responses
export interface MessageResponse {
    message: string;
}

export interface ErrorResponse {
    error: string;
}

export interface ValueUpdateResponse {
    device: string;
    value: string | number | boolean;
    timestamp: number;
    connected: boolean;
    read_access: boolean;
    write_access: boolean;
}

export interface MetaUpdateResponseBase {
    status: number;
    severity: number;
    precision: number;
    setpoint_timestamp: null | number;
    setpoint_status: null | number;
    setpoint_severity: null | number;
    lower_ctrl_limit: null | number;
    upper_ctrl_limit: null | number;
    units: string;
    enum_strs: null | string[];
    setpoint_precision: null | number;
    sub_type: 'meta';
}
//split up to make device types more flexible when they aren't connected
export interface MetaUpdateResponse extends MetaUpdateResponseBase, ValueUpdateResponse {
}

//Requests

export interface ActionRequest {
    action: 'subscribe' | 'subscribeSafely' | 'subscribeReadOnly' | 'unsubscribe' | 'refresh' | 'set';
    device?: string;
    value?: string | number | boolean;
}

export interface ActionRequestSubscribe {
    action: 'subscribe' | 'subscribeSafely' | 'subscribeReadOnly';
    device: string;
}

export interface ActionRequestUnsubscribe {
    action: 'unsubscribe';
    device: string;
}

export interface ActionRequestRefresh {
    action: 'refresh';
}

export interface ActionRequestSet {
    action: 'set';
    device: string;
    value: string | number | boolean;
}