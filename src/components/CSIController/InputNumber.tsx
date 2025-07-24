import { cn } from "@/lib/utils";
import { CSSProperties, useState, useEffect, useRef } from "react";
import styles from "./styles.json"; // adjust path to your styles.json

type InputNumberProps = {
    label?: string;
    onSubmit?: (value: number) => void;
    isDisabled?: boolean;
    precision?: number | null
    style?: CSSProperties;
    val?: number | string | boolean;
};

export default function InputNumber({
    label = '',
    onSubmit = (input) => { console.log('submit ' + input) },
    isDisabled = false,
    precision,
    style,
    val
}: InputNumberProps) {
    const [inputValue, setInputValue] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof val === 'number') {
            if (precision === null) {
                setInputValue(Math.round(val).toString());
            } else {
                setInputValue(val.toFixed(precision));
            }
        } else {
            setInputValue('');
        }
    }, [val, precision]);

    if (typeof val !== 'number') {
        return null; 
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        
        if (precision === null) {
            // Only allow integers (whole numbers)
            if (/^$|^[0-9]*$/.test(newValue)) {
                setInputValue(newValue);
            }
        } else {
            // Allow decimals for float input
            if (/^$|^[0-9]*\.?[0-9]*$/.test(newValue)) {
                setInputValue(newValue);
            }
        }
    };

    const formatValue = () => {
        if (inputValue === '') {
            setInputValue('');
            return;
        }
        
        const num = parseFloat(inputValue);
        if (!isNaN(num)) {
            if (precision === null) {
                // Round to nearest integer
                const rounded = Math.round(num);
                setInputValue(rounded.toString());
            } else {
                // Format to specified precision
                setInputValue(num.toFixed(precision));
            }
        } else {
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            formatValue();
            const num = parseFloat(inputValue);
            if (!isNaN(num)) {
                if (precision === null) {
                    onSubmit(Math.round(num));
                } else {
                    onSubmit(parseFloat(num.toFixed(precision)));
                }
            }
        }
    };

    return (
        <label className={`${isDisabled ? 'text-slate-400' : 'text-black'} w-full max-w-64 flex justify-between`}>
            
            <input
                ref={inputRef}
                disabled={isDisabled}
                type="text"
                value={inputValue}
                className={cn(`${isDisabled ? 'hover:cursor-not-allowed' : ''} w-1/2 border border-slate-300 pl-1`,
                // Base styles from JSON
                styles.styles.default.button,)}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                onBlur={formatValue}
                onFocus={handleFocus}
                style={style}
            />
        </label>
    );
}