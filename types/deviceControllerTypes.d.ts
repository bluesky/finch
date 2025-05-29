import { ValueUpdateResponse, MetaUpdateResponseBase } from './ophydSocketTypes';
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
//# sourceMappingURL=deviceControllerTypes.d.ts.map