type QItemProps = {
    item: any;
    label?: string;
    text?: string;
    styles?: string;
    handleClick?: (arg: any) => void;
    type: 'history' | 'current' | 'blank';
};
export default function QItem({ item, label, text, styles, handleClick, type }: QItemProps): import("react/jsx-runtime").JSX.Element | undefined;
export {};
//# sourceMappingURL=QItem.d.ts.map