import { CSSProperties } from '../../../node_modules/react';
type InputEnumProps = {
    label?: string;
    onSubmit?: (input: number) => void;
    isDisabled?: boolean;
    style?: CSSProperties;
    val?: number | string | boolean;
    enums?: string[] | null;
};
export default function InputEnum({ label, onSubmit, isDisabled, style, val, enums }: InputEnumProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=InputEnum.d.ts.map