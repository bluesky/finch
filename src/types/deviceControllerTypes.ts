//Everything related to EPICS / OPHYD device
import {ValueUpdateResponse, MetaUpdateResponseBase } from "./ophydSocketTypes";
import { ValueUpdateResponse as OphydValueUpdateResponse } from "./ophydDeviceSocketTypes";

export interface Device extends ValueUpdateResponse, Partial<MetaUpdateResponseBase> {
    min?: number | null;
    max?: number | null;
    name: string;
    locked: boolean;
    timestamp: number;
    expanded: boolean;
    units?: string;
};

export interface Devices {
    [key: string]: Device;
}

export interface OphydDevice extends OphydValueUpdateResponse, Partial<MetaUpdateResponseBase> {
    min?: number | null;
    max?: number | null;
    name: string;
    locked: boolean;
    timestamp: number;
    expanded: boolean;
    units?: string;
};

export interface OphydDevices {
    [key: string]: OphydDevice;
}