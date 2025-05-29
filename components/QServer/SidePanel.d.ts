import { default as React } from '../../../node_modules/react';
type SidePanelProps = {
    queueData: any[];
    queueHistoryData: any[];
    isREToggleOn: boolean;
    handleSidepanelExpandClick: (isExpanded: boolean) => void;
    isSidepanelExpanded: boolean;
    children: React.ReactNode;
};
export default function SidePanel({ queueData, queueHistoryData, isREToggleOn, handleSidepanelExpandClick, isSidepanelExpanded, children }: SidePanelProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SidePanel.d.ts.map