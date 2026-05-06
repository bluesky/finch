import { BaseQueueItem, QueueItem, HistoryItem, RunningQueueItem } from '../../api/qServer/types';
type QItemProps = {
    item: BaseQueueItem | QueueItem | HistoryItem | RunningQueueItem | null;
    label?: string;
    text?: string;
    styles?: string;
    handleClick?: () => void;
    type: 'history' | 'current' | 'blank';
};
export default function QItem({ item, label, text, styles, handleClick, type }: QItemProps): import("react/jsx-runtime").JSX.Element | undefined;
export {};
//# sourceMappingURL=QItem.d.ts.map