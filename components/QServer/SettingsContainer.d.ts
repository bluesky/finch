import { WidgetStyleProps } from './Widget';
import { GlobalMetadata } from './types/types';
type SettingsContainerProps = WidgetStyleProps & {
    isGlobalMetadataChecked: boolean;
    handleGlobalMetadataCheckboxChange: (isChecked: boolean) => void;
    updateGlobalMetadata: (newGlobalMetadata: GlobalMetadata) => void;
};
export default function SettingsContainer({ isGlobalMetadataChecked, handleGlobalMetadataCheckboxChange, updateGlobalMetadata }: SettingsContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SettingsContainer.d.ts.map