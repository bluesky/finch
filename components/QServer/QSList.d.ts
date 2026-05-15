import { PopupItem } from './types/types';
import { HistoryItem } from '../../api/qServer/types';
type QSListProps = {
    queueData: PopupItem[] | HistoryItem[];
    handleQItemClick: (arg: PopupItem | HistoryItem, showDeleteButton: boolean) => void;
    type: 'default' | 'history' | 'short';
};
export default function QSList({ queueData, handleQItemClick, type, }: QSListProps): import("react/jsx-runtime").JSX.Element | undefined;
export {};
//# sourceMappingURL=QSList.d.ts.map