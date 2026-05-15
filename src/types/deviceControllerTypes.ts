//Everything related to EPICS / OPHYD device
import { ValueUpdateResponse, MetaUpdateResponseBase } from '../api/ophyd/ophydPVSocketTypes';
import { ValueUpdateResponse as OphydValueUpdateResponse } from '../api/ophyd/ophydDeviceSocketTypes';

export interface Device extends ValueUpdateResponse, Partial<MetaUpdateResponseBase> {
    min?: number | null;
    max?: number | null;
    name: string;
    locked: boolean;
    timestamp: number;
    expanded: boolean;
    units?: string;
}

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
}

export interface OphydDevices {
    [key: string]: OphydDevice;
}
