import { TiledSearchItem, TiledStructures } from '../Tiled/types/tempTypes';
type ExperimentHistoryProps = {
    /** Filters results to only Bluesky runs whose `start.exact_plan_name` matches this value. */
    planName?: string;
    /** Additional CSS class names to apply to the results table. */
    className?: string;
    /** Full-text search string applied to run metadata (e.g. a username). */
    metadataFulltextSearch?: string;
    /** Base URL of the Tiled server. Falls back to the application default when omitted. */
    tiledBaseUrl?: string;
    /** Initial Tiled path to search under. Falls back to the application default when omitted. */
    tiledInitialSearchPath?: string;
    /** Maximum number of results to fetch per page. Defaults to 10. */
    tiledPageLimit?: number;
    /** Callback invoked when a history row is clicked. Receives the full Tiled search item. */
    onItemClick?: (item: TiledSearchItem<TiledStructures>) => void;
    /** When true, highlights the clicked row until a different row is selected. */
    enablePersistentSelection?: boolean;
    /** The Tiled item ID to pre-select on first render when `enablePersistentSelection` is true. */
    initialSelectedItemId?: string;
};
export default function ExperimentHistory({ planName, className, metadataFulltextSearch, tiledBaseUrl, tiledInitialSearchPath, tiledPageLimit, onItemClick, enablePersistentSelection, initialSelectedItemId, }: ExperimentHistoryProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExperimentHistory.d.ts.map