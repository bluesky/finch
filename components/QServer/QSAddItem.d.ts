import { CopiedPlan, GlobalMetadata } from './types/types';
import { WidgetStyleProps } from './Widget';
type QsAddItemProps = WidgetStyleProps & {
    copiedPlan?: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata?: GlobalMetadata;
};
export default function QSAddItem({ copiedPlan, isGlobalMetadataChecked, globalMetadata, }: QsAddItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QSAddItem.d.ts.map