export interface DetectorSetting {
    title: string;
    icon: null | JSX.Element;
    prefix: string | null;
    inputs: DetectorInput[];
}

//we only need float, integer, enum for the current camera app
//but technically for EPICS we could have string and boolean too
export interface DetectorInput {
    suffix: string;
    label: string;
    type: 'enum' | 'float' | 'integer' | 'string' | 'boolean';
    min?: number;
    max?: number;
    enums?: string[];
}

export interface EnumProperties {
    enums: string[];
}

export interface NumberProperties {
    min: number;
    max: number;
}

export type DetectorProperties = EnumProperties | NumberProperties;

export interface CameraSettingsState {
    [key: string]: {
        value: string | number | boolean | null; //number for both enums and intengers/float
        lastUpdated: number;
        pv: string;
        connected: boolean;
        text?: string; //only exists for enums
    };
}

export interface CameraControlPV {
    pv: string;
    readonly: string;
    type: string;
    seconds: number;
    nanos: number;
    value?: string | number | boolean | null;
    vtype?: string;
    labels?: string[];
    severity?: string;
}
