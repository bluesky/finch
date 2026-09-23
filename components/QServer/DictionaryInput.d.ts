import { CopiedPlan, GlobalMetadata } from './types/types';
type DictionaryInputProps = {
    cb: (dict: {
        [key: string]: string;
    }, deleteParam?: boolean) => void;
    label: string;
    required: boolean;
    description: string | undefined;
    className?: string;
    resetInputsTrigger: boolean;
    copiedPlan: CopiedPlan | null;
    isGlobalMetadataChecked: boolean;
    globalMetadata: GlobalMetadata;
};
export default function DictionaryInput({ cb, label, required, description, className, resetInputsTrigger, copiedPlan, isGlobalMetadataChecked, globalMetadata, }: DictionaryInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DictionaryInput.d.ts.map