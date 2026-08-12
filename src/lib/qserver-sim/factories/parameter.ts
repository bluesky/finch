import type { Parameter } from '@/api/qServer_new/types/plansDevices';

/**
 * Python parameter kinds as the queue server reports them, so callers write
 * `kind: 'KEYWORD_ONLY'` instead of remembering that it pairs with `value: 3`.
 */
export const PARAMETER_KINDS = {
    POSITIONAL_ONLY: { name: 'POSITIONAL_ONLY', value: 0 },
    POSITIONAL_OR_KEYWORD: { name: 'POSITIONAL_OR_KEYWORD', value: 1 },
    VAR_POSITIONAL: { name: 'VAR_POSITIONAL', value: 2 },
    KEYWORD_ONLY: { name: 'KEYWORD_ONLY', value: 3 },
    VAR_KEYWORD: { name: 'VAR_KEYWORD', value: 4 },
} as const;

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
export function parameter(options: ParameterOptions): Parameter {
    const kind = PARAMETER_KINDS[options.kind ?? 'POSITIONAL_OR_KEYWORD'];
    return {
        name: options.name,
        kind: { ...kind },
        ...(options.description !== undefined ? { description: options.description } : {}),
        ...(options.default !== undefined ? { default: options.default } : {}),
        ...(options.annotation !== undefined ? { annotation: options.annotation } : {}),
        ...(options.enums !== undefined ? { enums: options.enums } : {}),
        ...(options.min !== undefined ? { min: options.min } : {}),
        ...(options.max !== undefined ? { max: options.max } : {}),
        ...(options.step !== undefined ? { step: options.step } : {}),
        ...(options.convertDeviceNames !== undefined
            ? { convert_device_names: options.convertDeviceNames }
            : {}),
    };
}

/** Annotation marking a parameter as taking one device name from `devices`. */
export function deviceAnnotation(devices: string[]): Parameter['annotation'] {
    return { type: '__DEVICE__', devices: { __DEVICE__: devices } };
}

/** Annotation marking a parameter as taking a list of device names. */
export function deviceListAnnotation(devices: string[]): Parameter['annotation'] {
    return { type: 'typing.List[__DEVICE__]', devices: { __DEVICE__: devices } };
}
