import { PopupItem } from './types/types';
import { ArbitraryKwargs } from '../../api/qServer/types';
type QItemPopupProps = {
    popupItem: PopupItem;
    handleQItemPopupClose: () => void;
    isItemDeleteButtonVisible?: boolean;
    handleCopyItemClick?: (name: string, kwargs: ArbitraryKwargs) => void;
    isItemRunning?: boolean;
};
export default function QItemPopup({ popupItem, handleQItemPopupClose, isItemDeleteButtonVisible, handleCopyItemClick, isItemRunning, }: QItemPopupProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QItemPopup.d.ts.map