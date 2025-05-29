import { AllowedDevices } from './types/types';
type SingleSelectInputProps = {
    label: string;
    isItemInArray: (item: string) => boolean;
    addItem: (item: string) => void;
    clearItem: () => void;
    allowedDevices: AllowedDevices;
    description?: string;
    required: boolean;
    styles?: string;
    value: string;
};
export default function SingleSelectInput({ label, isItemInArray, addItem, clearItem, allowedDevices, description, required, styles, value }: SingleSelectInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SingleSelectInput.d.ts.map