import { useState } from "react";

type InputIntegerProps = {
    label?: string;
    onSubmit?: (value: number) => void;
    isDisabled?: boolean;
};
export default function InputInteger ({label='', onSubmit=(input)=>{console.log('submit ' + input )}, isDisabled=false }: InputIntegerProps) {
    const [value, setValue] = useState<string | number>('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        var newValue = e.target.value;
        if (!newValue.endsWith('.') && (!isNaN(parseInt(newValue)) || newValue==='')) {
            if (newValue === '') {
                setValue('')
            } else {
                setValue(parseInt(newValue));
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (typeof value === 'number') {
                onSubmit(value);
            }
        }
    };

    return (
        <label className={`${isDisabled ? 'text-slate-400' : 'text-black'} w-full max-w-64 flex justify-between text-lg`}>
            {label}
            <input
                disabled={isDisabled}
                type="text" 
                value={value} 
                className={`${isDisabled ? 'hover:cursor-not-allowed' : ''} w-1/2 border border-slate-300 pl-2`} 
                onKeyDown={handleKeyPress} 
                onChange={handleChange}
            />
        </label>
    )
}
