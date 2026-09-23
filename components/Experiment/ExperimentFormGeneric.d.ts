import { AllowedDevices, GlobalMetadata } from '../QServer/types/types';
import { ArbitraryKwargs, Plan } from '../../api/qServer';
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
export default function ExperimentFormGeneric({ plan, allowedDevices, onChange, globalMetadata, className, classNameInput, }: ExperimentFormGenericProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExperimentFormGeneric.d.ts.map