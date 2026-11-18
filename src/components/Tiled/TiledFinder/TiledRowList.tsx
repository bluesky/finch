import { TiledSearchItem, TiledStructures, Breadcrumb } from './types';
import { useTiledColumnResult, type TiledColumnRequest } from './useTiledColumnResult';
import { isContainerStructure } from './types';
import { TiledRowItem } from './TiledRowItem';
import dayjs from 'dayjs';
import TiledLoading from './TiledLoading';

type TiledRowListProps = {
    /** One request per level; each level reads its own data through Finch's query hooks. */
    columns: TiledColumnRequest[];
    /** Called when a level's search fails. */
    onError?: (request: TiledColumnRequest, error: unknown) => void;
    breadcrumbs: Breadcrumb[];
    onItemClick: (item: TiledSearchItem<TiledStructures>, depth: number) => void;
    handleNewPageClick: (link: string, columnIndex: number) => void;
    showPlanName?: boolean;
    showPlanStartTime?: boolean;
};

export default function TiledRowList(props: TiledRowListProps) {
    if (props.columns.length === 0) return null;
    return (
        <ul className="py-2">
            <TiledRowLevel {...props} depth={0} />
        </ul>
    );
}

/** One level of the tree: its items, and the expanded container's level beneath it. */
function TiledRowLevel({
    columns,
    onError,
    breadcrumbs,
    onItemClick,
    handleNewPageClick,
    showPlanName = true,
    showPlanStartTime = true,
    depth,
}: TiledRowListProps & { depth: number }) {
    const request = columns[depth];
    const { result, isFirstLoad, requestUrl, failureCount } = useTiledColumnResult(
        request,
        (error) => onError?.(request, error),
    );
    const column = result ?? {
        data: [],
        links: { self: '', first: '', last: '', next: null, prev: null },
        meta: { count: 0 },
        error: null,
    };

    const currentOffset = (() => {
        if (!column.links.self) return 0;
        const match = column.links.self.match(/page\[offset\]=(\d+)/);
        return match ? parseInt(match[1]) : 0;
    })();
    const totalResults = column.meta.count;
    const startIndex = currentOffset + (column.data.length > 0 ? 1 : 0);
    const endIndex = startIndex + column.data.length - 1;
    const nextLink = column.links.next ?? null;
    const prevLink = column.links.prev ?? null;

    if (isFirstLoad) {
        return (
            <li className="list-none" style={{ paddingLeft: `${depth * 1.25}rem` }} aria-busy>
                <TiledLoading
                    size={depth === 0 ? 'large' : 'small'}
                    message={depth === 0 ? 'Connecting to Tiled' : 'Loading'}
                    requestUrl={requestUrl}
                    failureCount={failureCount}
                    className={depth === 0 ? 'py-16' : ''}
                />
            </li>
        );
    }

    return (
        <>
            {column.data.map((item: TiledSearchItem<TiledStructures>) => {
                const isContainer = isContainerStructure(item);
                const isExpanded =
                    isContainer &&
                    breadcrumbs.length > depth &&
                    breadcrumbs[depth].label === item.id;
                const blueskyPlanName = item?.attributes?.metadata?.start?.plan_name || '';
                const blueskyStartTime = item?.attributes?.metadata?.start?.time
                    ? dayjs.unix(item.attributes.metadata.start.time).format('MM/DD HH:mm')
                    : '';
                const displayText =
                    `${showPlanStartTime ? blueskyStartTime : ''} ${showPlanName ? blueskyPlanName : ''}  ${item.id}`.trim();

                return (
                    <div key={`${item.id}-${depth}`}>
                        <TiledRowItem
                            item={item}
                            displayText={displayText}
                            isSelected={
                                isExpanded ||
                                (!isContainer &&
                                    breadcrumbs.length > depth &&
                                    breadcrumbs[depth].label === item.id)
                            }
                            isExpanded={isExpanded}
                            onClick={() => onItemClick(item, depth)}
                            depth={depth}
                        />
                        {isExpanded && depth + 1 < columns.length && (
                            <TiledRowLevel
                                columns={columns}
                                onError={onError}
                                breadcrumbs={breadcrumbs}
                                onItemClick={onItemClick}
                                handleNewPageClick={handleNewPageClick}
                                showPlanName={showPlanName}
                                showPlanStartTime={showPlanStartTime}
                                depth={depth + 1}
                            />
                        )}
                    </div>
                );
            })}
            {(nextLink || prevLink) && (
                <p
                    className="text-center text-sm py-1"
                    style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
                >
                    {`${startIndex} - ${endIndex} of ${totalResults}`}
                    <span
                        onClick={prevLink ? () => handleNewPageClick(prevLink, depth) : undefined}
                        className={`${prevLink ? 'text-slate-600 hover:text-sky-500 hover:cursor-pointer' : 'text-slate-300'} text-base pl-4 pr-2`}
                    >
                        &lt;
                    </span>
                    <span
                        onClick={nextLink ? () => handleNewPageClick(nextLink, depth) : undefined}
                        className={`${nextLink ? 'text-slate-600 hover:text-sky-500 hover:cursor-pointer' : 'text-slate-300'} text-base`}
                    >
                        &gt;
                    </span>
                </p>
            )}
        </>
    );
}
