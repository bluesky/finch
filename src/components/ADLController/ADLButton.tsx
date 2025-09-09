import { CSSProperties, useState } from "react";

type ADLButtonProps = {
    label?: string;
    onSubmit?: (value: number) => void;
    isDisabled?: boolean;
    style?: CSSProperties;
    val?: number;
};

export default function ADLButton({
    label = '',
    onSubmit = (input) => { console.log('submit ' + input) },
    isDisabled = false,
    style,
    val
}: ADLButtonProps) {
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
            className={`
                ${isDisabled ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}
                ${isPressed ? 'transform scale-95' : ''}
                 rounded border border-slate-300 transition-all duration-100
                focus:outline-none focus:ring-2 focus:ring-blue-300
                flex flex-col justify-center
            `}
            style={style}
        >
            <small className="text-xs">{label}</small>
        </button>
    );
}