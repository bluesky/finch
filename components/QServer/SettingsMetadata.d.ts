import { GlobalMetadata } from './types/types';
type SettingsMetadataProps = {
    isGlobalMetadataChecked: boolean;
    handleGlobalMetadataCheckboxChange: (isChecked: boolean) => void;
    updateGlobalMetadata: (newGlobalMetadata: GlobalMetadata) => void;
};
export default function SettingsMetadata({ isGlobalMetadataChecked, handleGlobalMetadataCheckboxChange, updateGlobalMetadata, }: SettingsMetadataProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SettingsMetadata.d.ts.map