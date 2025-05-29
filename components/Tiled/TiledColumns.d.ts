import { TiledSearchResult, Breadcrumb } from './types';
type TiledColumnsProps = {
    columns: TiledSearchResult[];
    onItemClick: Function;
    breadcrumbs: Breadcrumb[];
    handleSelectClick?: Function;
};
export default function TiledColumns({ columns, onItemClick, breadcrumbs, handleSelectClick, ...props }: TiledColumnsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledColumns.d.ts.map