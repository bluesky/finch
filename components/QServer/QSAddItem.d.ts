import { CopiedPlan } from './types/types';
import { WidgetStyleProps } from './Widget';
type QsAddItemProps = WidgetStyleProps & {
    copiedPlan?: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata?: {
        [key: string]: any;
    };
};
export default function QSAddItem({ copiedPlan, isGlobalMetadataChecked, globalMetadata }: QsAddItemProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QSAddItem.d.ts.map