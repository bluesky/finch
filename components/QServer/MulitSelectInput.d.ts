import { AllowedDevices } from './types/types';
type MultiSelectInputProps = {
    label: string;
    isItemInArray: (item: string) => boolean;
    addItem: (item: string) => void;
    removeItem: (item: string) => void;
    selectedItems: string[];
    allowedDevices: AllowedDevices;
    description: string | undefined;
    required: boolean;
    styles?: string;
};
export default function MultiSelectInput({ label, isItemInArray, addItem, removeItem, selectedItems, allowedDevices, description, required, styles }: MultiSelectInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MulitSelectInput.d.ts.map