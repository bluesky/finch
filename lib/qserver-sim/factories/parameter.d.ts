import { Parameter } from '../../../api/qServer/types/plansDevices';
/**
 * Python parameter kinds as the queue server reports them, so callers write
 * `kind: 'KEYWORD_ONLY'` instead of remembering that it pairs with `value: 3`.
 */
export declare const PARAMETER_KINDS: {
    readonly POSITIONAL_ONLY: {
        readonly name: "POSITIONAL_ONLY";
        readonly value: 0;
    };
    readonly POSITIONAL_OR_KEYWORD: {
        readonly name: "POSITIONAL_OR_KEYWORD";
        readonly value: 1;
    };
    readonly VAR_POSITIONAL: {
        readonly name: "VAR_POSITIONAL";
        readonly value: 2;
    };
    readonly KEYWORD_ONLY: {
        readonly name: "KEYWORD_ONLY";
        readonly value: 3;
    };
    readonly VAR_KEYWORD: {
        readonly name: "VAR_KEYWORD";
        readonly value: 4;
    };
};
export type ParameterKindName = keyof typeof PARAMETER_KINDS;
export interface ParameterOptions {
    name: string;
    /** Defaults to `'POSITIONAL_OR_KEYWORD'`. */
    kind?: ParameterKindName;
    description?: string;
    /** The queue server reports defaults as strings, e.g. `'1'` or `'None'`. */
    default?: string | string[];
    /** Device or enum annotation; drives which input widget a form renders. */
    annotation?: Parameter['annotation'];
    enums?: string[];
    min?: string;
    max?: string;
    step?: string;
    convertDeviceNames?: boolean;
}
/** Build one plan parameter. `Parameter` has eleven optional fields; this keeps callers sane. */
export declare function parameter(options: ParameterOptions): Parameter;
/** Annotation marking a parameter as taking one device name from `devices`. */
export declare function deviceAnnotation(devices: string[]): Parameter['annotation'];
/** Annotation marking a parameter as taking a list of device names. */
export declare function deviceListAnnotation(devices: string[]): Parameter['annotation'];
//# sourceMappingURL=parameter.d.ts.map