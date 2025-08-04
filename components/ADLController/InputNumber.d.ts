import { CSSProperties } from '../../../node_modules/react';
type InputNumberProps = {
    label?: string;
    onSubmit?: (value: number) => void;
    isDisabled?: boolean;
    precision?: number | null;
    style?: CSSProperties;
    val?: number | string | boolean;
};
export default function InputNumber({ label, onSubmit, isDisabled, precision, style, val }: InputNumberProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=InputNumber.d.ts.map