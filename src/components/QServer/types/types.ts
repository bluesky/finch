import {
    Parameter,
    Device,
    QueueItem,
    HistoryItem,
    RunningQueueItem,
    ArbitraryKwargs,
} from '@/api/qServer/types';

export type PopupItem = QueueItem | HistoryItem | RunningQueueItem;

export interface HistoryResultRow {
    name: string;
    icon: JSX.Element;
    content: JSX.Element | null;
}

/* export type Parameter = {
    name: string;
    description?: string;
    value: string | string[] | object;
    required: boolean;
    [key: string]: any;
    annotation?: {type: string};
    enums?: string[];
};

export type Parameters = {
    [key: string]: Parameter;
}; */

export type Plan = {
    name: string;
    kwargs: Record<string, unknown>;
    item_type: string;
};

export interface PlanInput {
    name: string;
    parameters: ParameterInputDict;
}

export interface ParameterInput extends Parameter {
    value: string | string[];
    required: boolean;
    [key: string]: unknown; //required for metadata field which allows writing of any key/value pair. should be refactored so that md lives inside 'value' as dict
}

export interface ParameterInputDict {
    [key: string]: ParameterInput;
}

export type BaseParameterDict = Record<string, ParameterInput | unknown>;

// export interface CopiedPlan {
//     name: string;
//     parameters: ParameterInputDict;
// }

export interface CopiedPlan {
    name: string;
    parameters: ArbitraryKwargs;
}

export interface AllowedDevices {
    [key: string]: Device;
}

export interface GlobalMetadata {
    [key: string]: string;
}
