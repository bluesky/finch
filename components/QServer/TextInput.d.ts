import { CopiedPlan } from './types/types';
type TextInputProps = {
    cb: (value: string | number) => void;
    value?: string | number;
    label: string;
    description?: string;
    required?: boolean;
    styles?: string;
    resetInputsTrigger?: boolean;
    copiedPlan?: CopiedPlan | null;
    type?: string;
};
export default function TextInput({ cb, value, label, description, required, styles, resetInputsTrigger, copiedPlan, type }: TextInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TextInput.d.ts.map