import { default as React } from '../../../node_modules/react';
import { HistoryItem, QueueItem } from '../../api/qServer/types';
type SidePanelProps = {
    queueData: QueueItem[];
    queueHistoryData: HistoryItem[];
    handleSidepanelExpandClick: (isExpanded: boolean) => void;
    isSidepanelExpanded: boolean;
    runEngineState?: string | null;
    children: React.ReactNode;
};
export default function SidePanel({ queueData, queueHistoryData, handleSidepanelExpandClick, isSidepanelExpanded, runEngineState, children }: SidePanelProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SidePanel.d.ts.map