import { PopupItem } from './types/types';
type QItemPopupProps = {
    popupItem: PopupItem;
    handleQItemPopupClose: () => void;
    isItemDeleteButtonVisible?: boolean;
    handleCopyItemClick: (name: string, kwargs: {
        [key: string]: any;
    }) => void;
};
export default function QItemPopup({ popupItem, handleQItemPopupClose, isItemDeleteButtonVisible, handleCopyItemClick }: QItemPopupProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QItemPopup.d.ts.map