import { CSSProperties, useState } from "react";
import { cn } from "@/lib/utils"; 
import styles from "./styles.json"; 

type CSIButtonProps = {
    label?: string;
    onSubmit?: (value: number) => void;
    isDisabled?: boolean;
    style?: CSSProperties;
    val?: number;
};

export default function CSIButton({
    label = '',
    onSubmit = (input) => { console.log('submit ' + input) },
    isDisabled = false,
    style,
    val
}: CSIButtonProps) {
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = () => {
        if (!isDisabled) {
            setIsPressed(true);
            setTimeout(() => setIsPressed(false), 200);

            if (val !== undefined) {
                onSubmit(val);
            }
        }
    };

    return (
        <button
            disabled={isDisabled}
            onClick={handleClick}
            className={cn(

                // Conditional styles
                isDisabled
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'text-white hover:brightness-90',
                isPressed && 'transform scale-95',
                // Additional styles
                'rounded border border-slate-300 transition-colors duration-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-300',
                'flex flex-col justify-center',
                // Base styles from JSON
                styles.variants.default.button,
            )}
            style={style}
        >
            <span className="text-[0.85em]">{label}</span>
        </button>
    );
}