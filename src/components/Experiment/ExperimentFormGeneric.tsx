import { useCallback, useEffect, useMemo, useState } from 'react';
import QSParameterInput from '@/components/QServer/QSParameterInput';
import type {
    AllowedDevices,
    GlobalMetadata,
    ParameterInputDict,
} from '@/components/QServer/types/types';
import type { ArbitraryKwargs, Parameter, Plan } from '@/api/qServer';
import { cn } from '@/lib/utils';

/**
 * Stable stand-in for "no global metadata".
 *
 * It has to be a single frozen object rather than a `{}` literal in the render body: `DictionaryInput`
 * lists `globalMetadata` in an effect's dependencies and calls back from that effect, so a fresh object
 * each render is an infinite update loop.
 */
const NO_GLOBAL_METADATA: GlobalMetadata = Object.freeze({});

type ExperimentFormGenericProps = {
    /**
     * The plan to build a form for, as introspected by the queue server
     * (`plans_allowed[name]`). `null` renders a placeholder.
     */
    plan: Plan | null;
    /** `devices_allowed` from the queue server, used to populate the device dropdowns. */
    allowedDevices: AllowedDevices;
    /**
     * Called whenever a field changes, with the kwargs to send and whether every required parameter
     * has a value. Empty fields are omitted so the plan's own defaults apply.
     */
    onChange: (kwargs: ArbitraryKwargs, isComplete: boolean) => void;
    /** Merged into the `md` parameter, for callers that keep global metadata. */
    globalMetadata?: GlobalMetadata;
    /** Additional CSS class names applied to the field container. */
    className?: string;
    /**
     * Additional CSS class names applied to the input widgets themselves. The default is a
     * fractional width that fits the wide QServer panel; a caller can override it to make the inputs
     * fill a narrower column.
     */
    classNameInput?: string;
};

/**
 * A form generated from any queue-server plan's parameter metadata.
 *
 * Widget selection is delegated to `QSParameterInput`, the same component the QServer "Add Item" panel
 * uses — so a device parameter gets a device dropdown, an enum gets a select, `md` gets the key/value
 * editor, and everything else gets a text input. The value type decides between single and multi
 * select, which is why the initial value matters (see `initialValueFor`).
 *
 * This component owns the parameter *values* and reports kwargs upward; it does not submit anything.
 * Pair it with `ExperimentExecutePlanButtonGeneric`.
 */
export default function ExperimentFormGeneric({
    plan,
    allowedDevices,
    onChange,
    globalMetadata,
    className,
    classNameInput,
}: ExperimentFormGenericProps) {
    const [parameters, setParameters] = useState<ParameterInputDict | null>(null);
    // Flipping this tells the text and dictionary inputs to drop their internal draft state.
    const [resetInputsTrigger, setResetInputsTrigger] = useState(false);

    // Rebuild the fields whenever the plan changes. Keyed on the name rather than the object so a
    // refetch of `plans_allowed` returning an equal plan does not wipe what the user has typed.
    const planName = plan?.name ?? null;
    useEffect(() => {
        if (!plan) {
            setParameters(null);
            return;
        }
        setParameters(initializeParameters(plan));
        setResetInputsTrigger((previous) => !previous);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planName]);

    const kwargs = useMemo(() => (parameters ? toKwargs(parameters) : {}), [parameters]);
    const isComplete = useMemo(
        () => (parameters ? hasEveryRequiredValue(parameters) : false),
        [parameters],
    );
    console.log('ExperimentFormGeneric: kwargs', kwargs, 'isComplete', isComplete);

    // Report upward after render rather than from inside the input callbacks, so the parent always
    // sees the committed state and never a half-applied edit.
    useEffect(() => {
        console.log(
            'ExperimentFormGeneric: calling onChange with kwargs',
            kwargs,
            'isComplete',
            isComplete,
        );
        onChange(kwargs, isComplete);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kwargs, isComplete]);

    /** `QSParameterInput` calls this on every edit; the kwargs are derived from state instead. */
    const noopUpdateBodyKwargs = useCallback(() => {}, []);

    if (!plan) {
        return (
            <p className={cn('text-sm text-gray-500', className)}>
                Select a plan to configure its parameters.
            </p>
        );
    }

    if (!parameters || plan.parameters.length === 0) {
        return (
            <p className={cn('text-sm text-gray-500', className)}>
                {plan.name} takes no parameters.
            </p>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            {plan.description && (
                <p className="text-xs text-gray-500 whitespace-pre-line">
                    {firstLine(plan.description)}
                </p>
            )}
            {plan.parameters.map((parameter) => {
                const field = parameters[parameter.name];
                if (!field) return null;
                return (
                    <QSParameterInput
                        key={`${plan.name}-${parameter.name}`}
                        allowedDevices={allowedDevices}
                        param={field}
                        parameter={field}
                        parameterName={parameter.name}
                        parameters={parameters}
                        setParameters={setParameters}
                        updateBodyKwargs={noopUpdateBodyKwargs}
                        resetInputsTrigger={resetInputsTrigger}
                        copiedPlan={null}
                        isGlobalMetadataChecked={Boolean(globalMetadata)}
                        globalMetadata={globalMetadata ?? NO_GLOBAL_METADATA}
                        className={classNameInput}
                    />
                );
            })}
        </div>
    );
}

/** Build the editable field set for a plan, every value empty. */
function initializeParameters(plan: Plan): ParameterInputDict {
    const fields: ParameterInputDict = {};
    for (const parameter of plan.parameters) {
        fields[parameter.name] = {
            ...parameter,
            value: initialValueFor(parameter),
            required: isParameterRequired(parameter),
        };
    }
    console.log('initializeParameters: plan', plan.name, 'fields', fields);
    return fields;
}

/**
 * An empty array for a parameter that takes several devices, an empty string otherwise.
 *
 * `QSParameterInput` switches to its multi-select widget on `Array.isArray(value)`, so this is what
 * decides between "pick one detector" and "pick several". The signal is the annotation the server
 * sends — `typing.List[__DEVICE__]` / `typing.Sequence[...]` — rather than a hard-coded list of
 * parameter names, so an unfamiliar plan gets the right widget too.
 */
function initialValueFor(parameter: Parameter): string | string[] {
    const annotationType = parameter.annotation?.type ?? '';
    const isCollection = /\b(List|Sequence|Tuple|Iterable)\b/i.test(annotationType);
    return isCollection ? [] : '';
}

/**
 * Whether the plan will refuse to run without this parameter.
 *
 * The queue server omits `default` for parameters the plan signature leaves unset, which is the
 * honest signal — `*args` and `**kwargs` never count, however they are declared. Some beamlines also
 * write "Required: …" at the front of a docstring, so that is honoured as well.
 */
function isParameterRequired(parameter: Parameter): boolean {
    const kind = parameter.kind?.name;
    if (kind === 'VAR_POSITIONAL' || kind === 'VAR_KEYWORD') return false;
    if (parameter.default === undefined) return true;
    return parameter.description?.toLowerCase().trim().startsWith('req') === true;
}

/**
 * Whether a field has been filled in.
 *
 * `ParameterInput.value` is *typed* `string | string[]`, but at runtime it is whatever the widget
 * stores, and the widgets do not all store strings:
 *
 * - `TextInput` emits a **number** for `num`, `delay`, `start`, `stop`, `min_step`, `step_factor`, and
 *   for anything the server annotates `int` or `float`. `(5).length` is `undefined`, so a length check
 *   reads a perfectly good value as missing — which is the bug this function exists to not have.
 * - `DictionaryInput` (`md`) stores a plain object.
 * - A typed-but-incomplete number such as a lone `-` parses to `NaN`, which is not a value.
 *
 * `0` and `false` count as filled in: they are answers, not blanks.
 */
function hasValue(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
}

/**
 * The kwargs to send.
 *
 * Empty fields are dropped rather than sent as `''`, so the plan's own defaults apply — the same rule
 * `useQSAddItem` uses when building an Add Item body. Dropping `NaN` matters beyond tidiness:
 * `JSON.stringify` turns it into `null`, which the server would accept as a real argument.
 */
function toKwargs(parameters: ParameterInputDict): ArbitraryKwargs {
    const kwargs: ArbitraryKwargs = {};
    for (const [name, field] of Object.entries(parameters)) {
        if (!hasValue(field.value)) continue;
        kwargs[name] = field.value;
    }
    return kwargs;
}

/** Every required parameter has a value, so the plan can run. */
function hasEveryRequiredValue(parameters: ParameterInputDict): boolean {
    return Object.values(parameters).every((field) => !field.required || hasValue(field.value));
}

/** Plan docstrings are long; the summary line is what fits beside a form. */
function firstLine(description: string): string {
    return description.split('\n')[0];
}
