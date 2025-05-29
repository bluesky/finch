import { TiledSearchItem, TiledStructures, Breadcrumb } from './types';
type TiledColumnProps = {
    data: TiledSearchItem<TiledStructures>[];
    onItemClick: Function;
    index: number;
    breadcrumbs: Breadcrumb[];
    handleSelectClick?: Function;
    className?: string;
    showTooltip?: boolean;
};
export declare function TiledColumn({ data, index, onItemClick, breadcrumbs, handleSelectClick, className, showTooltip }: TiledColumnProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledColumn.d.ts.map