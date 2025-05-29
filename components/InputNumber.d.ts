type InputNumberProps = {
    label?: string;
    labelPosition?: 'left' | 'right';
    onChange?: (input: number | null) => void;
    warningMessage?: string;
    isWarningVisible?: boolean;
    min?: number;
    max?: number;
    handleEnter?: (input: number | null) => void;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
};
export default function InputNumber({ label, onChange, warningMessage, isWarningVisible, min, max, handleEnter, labelPosition, className, inputClassName, disabled }: InputNumberProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InputNumber.d.ts.map