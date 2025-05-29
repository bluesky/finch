import { Parameter, Device, QueueItem } from './apiTypes';
export interface PopupItem extends QueueItem {
    result?: {
        exit_status: string;
        time_start: number;
        time_stop: number;
        run_uids: string[];
        scan_ids: string[];
        traceback: string;
        msg: string;
    };
}
export interface HistoryResultRow {
    name: string;
    icon: JSX.Element;
    content: JSX.Element | null;
}
export type Plan = {
    name: string;
    kwargs: Record<string, any>;
    item_type: string;
};
export interface PlanInput {
    name: string;
    parameters: ParameterInputDict;
}
export interface ParameterInput extends Parameter {
    value: string | string[];
    required: boolean;
    [key: string]: any;
}
export interface ParameterInputDict {
    [key: string]: ParameterInput;
}
export interface CopiedPlan {
    name: string;
    parameters: ParameterInputDict;
}
export interface AllowedDevices {
    [key: string]: Device;
}
export interface GlobalMetadata {
    [key: string]: any;
}
//# sourceMappingURL=types.d.ts.map