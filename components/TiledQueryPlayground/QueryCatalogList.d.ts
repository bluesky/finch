export interface QueryCatalogListProps {
    selectedId: string;
    onSelect: (id: string) => void;
    pinnedIds: readonly string[];
    onTogglePin: (id: string) => void;
}
/** Grouped, filterable list of every query hook. */
export default function QueryCatalogList({ selectedId, onSelect, pinnedIds, onTogglePin, }: QueryCatalogListProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=QueryCatalogList.d.ts.map