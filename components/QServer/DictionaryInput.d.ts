import { CopiedPlan } from './types/types';
type DictionaryInputProps = {
    cb: (dict: {
        [key: string]: string;
    }, deleteParam?: boolean) => void;
    label: string;
    required: boolean;
    description: string | undefined;
    styles?: string;
    resetInputsTrigger: boolean;
    copiedPlan: CopiedPlan | null;
    isGlobalMetadataChecked: boolean;
    globalMetadata: {
        [key: string]: any;
    };
};
export default function DictionaryInput({ cb, label, required, description, styles, resetInputsTrigger, copiedPlan, isGlobalMetadataChecked, globalMetadata }: DictionaryInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DictionaryInput.d.ts.map