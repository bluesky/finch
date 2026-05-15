import { useState } from 'react';

type InputFloatProps = {
    /** Display label shown to the left of the number input. */
    label?: string;
    /** Callback invoked with the parsed float value when the user presses Enter. */
    onSubmit?: (value: number) => void;
    /** When `true`, prevents interaction and renders the input in a disabled style. */
    isDisabled?: boolean;
};
export default function InputFloat({
    label = '',
    onSubmit = (input) => console.log('submit: ' + input),
    isDisabled = false,
}: InputFloatProps) {
    const [value, setValue] = useState<number | string>('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (!isNaN(parseFloat(newValue)) || newValue === '') {
            if (newValue === '') {
                setValue('');
            } else {
                setValue(parseFloat(newValue));
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (typeof value === 'number') {
                onSubmit(value);
            }
        }
    };

    return (
        <label
            className={`${isDisabled ? 'text-slate-400' : 'text-black'} w-full max-w-64 flex justify-between text-lg`}
        >
            {label}
            <input
                disabled={isDisabled}
                type="number"
                value={value}
                className={`${isDisabled ? 'hover:cursor-not-allowed text-slate-400' : 'text-black'} w-1/2 border border-slate-300 pl-2`}
                onKeyDown={handleKeyPress}
                onChange={handleChange}
            />
        </label>
    );
}
