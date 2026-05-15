import { AllowedDevices } from './types/types';
type SingleSelectInputProps = {
    label: string;
    isItemInArray: (item: string) => boolean;
    addItem: (item: string) => void;
    allowedDevices: AllowedDevices;
    description?: string;
    required: boolean;
    className?: string;
    value: string;
};
export default function SingleSelectInput({ label, isItemInArray, addItem, allowedDevices, description, required, className, value, }: SingleSelectInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SingleSelectInput.d.ts.map