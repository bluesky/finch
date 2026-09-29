import { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { CopiedPlan } from './types/types';
import { cn } from '@/lib/utils';

type TextInputProps = {
    cb: (value: string | number) => void;
    value?: string | number;
    label: string;
    description?: string;
    required?: boolean;
    className?: string;
    resetInputsTrigger?: boolean;
    copiedPlan?: CopiedPlan | null;
    type?: string;
};
export default function TextInput({
    cb,
    value = '',
    label = '',
    description = '',
    required = false,
    className = '',
    resetInputsTrigger = false,
    copiedPlan = null,
    type = 'text',
}: TextInputProps) {
    const [inputValue, setInputValue] = useState(value);
    // What this input last handed to `cb`. The effect below uses it to recognise its own change coming
    // back through the `value` prop, which must not overwrite what is being typed.
    const lastEmittedRef = useRef<string | number>(value);

    const intTypeList = ['num'];
    const floatTypeList = ['delay', 'start', 'stop', 'min_step', 'step_factor'];

    /**
     * Report a value upward, remembering it so the sync effect can ignore the echo.
     *
     * A numeric draft that does not parse yet — `-`, `.`, `-.` — is reported as `''`, i.e. "nothing
     * entered". Reporting `NaN` instead put it in three bad places at once: `JSON.stringify` turns it
     * into `null`, so it could be sent as a real argument; length-based emptiness checks read it as a
     * value; and echoed back into `value` it rendered the literal text `NaN` over the digits being
     * typed.
     */
    const emit = (parsed: string | number) => {
        const safe = typeof parsed === 'number' && !Number.isFinite(parsed) ? '' : parsed;
        lastEmittedRef.current = safe;
        cb(safe);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (intTypeList.includes(label) || type === 'int') {
            if (/^-?\d*$/.test(newValue)) {
                setInputValue(newValue);
                emit(newValue === '' ? '' : parseInt(newValue));
            }
        } else if (floatTypeList.includes(label) || type == 'float') {
            if (/^-?\d*\.?\d*$/.test(newValue)) {
                setInputValue(newValue);
                emit(newValue === '' ? '' : parseFloat(newValue));
            }
        } else {
            setInputValue(newValue);
            emit(newValue);
        }
    };

    useEffect(() => {
        setInputValue('');
        lastEmittedRef.current = '';
    }, [resetInputsTrigger]);

    useEffect(() => {
        // Adopt the prop only when it is news — a reset, or a copied plan being loaded. Without this,
        // any parse that changes the stored value replaces the draft with its parsed form mid-typing:
        // that is how a lone `-` used to become the literal text `NaN` in the box.
        if (value === lastEmittedRef.current) return;
        setInputValue(typeof value === 'number' && !Number.isFinite(value) ? '' : value);
    }, [copiedPlan, value]);

    return (
        <div
            className={cn(
                'border-2 border-slate-300 rounded-lg w-5/12 max-w-48 min-w-36 mt-2 h-fit',
                className,
            )}
        >
            <p
                id={label + 'ParamInputTooltip'}
                className="text-sm pl-4 text-gray-500 border-b border-dashed border-slate-300"
            >{`${label} ${required ? '(required)' : '(optional)'}`}</p>
            <Tooltip
                anchorSelect={'#' + label + 'ParamInputTooltip'}
                children={<p className="whitespace-pre-wrap">{description}</p>}
                place="top"
                variant="info"
                style={{ maxWidth: '500px', height: 'fit-content' }}
                delayShow={400}
            />
            <input
                className="w-full rounded-b-lg outline-none h-8 text-lg pl-2 text-center"
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e)}
            />
        </div>
    );
}
