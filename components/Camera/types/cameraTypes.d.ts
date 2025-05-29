export interface DetectorSetting {
    title: string;
    icon: null | JSX.Element;
    prefix: string | null;
    inputs: DetectorInput[];
}
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
export interface IntegerProperties extends NumberProperties {
}
export interface FloatProperties extends NumberProperties {
}
export type DetectorProperties = EnumProperties | NumberProperties | IntegerProperties | FloatProperties;
export interface CameraSettingsState {
    [key: string]: {
        value: string | number | boolean | null;
        lastUpdated: number;
        pv: string;
        connected: boolean;
        text?: string;
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
//# sourceMappingURL=cameraTypes.d.ts.map