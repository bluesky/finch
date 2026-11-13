import { TiledSearchItem, TiledStructures, Breadcrumb, TiledSearchResult } from './types';
import { cn } from '@/lib/utils';
import { TiledRowItem } from './TiledRowItem';
import dayjs from 'dayjs';

type TiledColumnProps = {
    data: TiledSearchItem<TiledStructures>[];
    links: TiledSearchResult['links'];
    meta: TiledSearchResult['meta'];
    onItemClick: (item: TiledSearchItem<TiledStructures>, index: number) => void;
    index: number;
    breadcrumbs: Breadcrumb[];
    handleSelectClick?: (item: TiledSearchItem<TiledStructures>) => void;
    className?: string;
    showTooltip?: boolean;
    handleNewPageClick: (link: string, columnIndex: number) => void;
    showPlanName?: boolean;
    showPlanStartTime?: boolean;
};

export function TiledColumn({
    data,
    meta,
    links,
    index,
    onItemClick,
    breadcrumbs,
    handleSelectClick,
    className,
    showTooltip = true,
    handleNewPageClick,
    showPlanName = true,
    showPlanStartTime = true,
}: TiledColumnProps) {
    //parse the links.self to get the value after ...page[offset]=
    const currentOffset = (() => {
        if (!links.self) return 0;
        const offsetMatch = links.self.match(/page\[offset\]=(\d+)/);
        return offsetMatch ? parseInt(offsetMatch[1]) : 0;
    })();
    const totalResults = meta.count;
    const currentlyDisplayedStartIndex = currentOffset + (data.length > 0 ? 1 : 0);
    const currentlyDisplayedEndIndex = currentlyDisplayedStartIndex + data.length - 1;
    const nextResultsLink = links.next ? links.next : null;
    const prevResultsLink = links.prev ? links.prev : null;
    return (
        <div
            className={cn(
                'flex flex-col-reverse border-r border-r-slate-300 min-w-56 w-fit max-w-xs px-4 h-auto pt-2',
                className,
            )}
        >
            {nextResultsLink || prevResultsLink ? (
                <p className="text-center text-sm py-1">
                    {`${currentlyDisplayedStartIndex} - ${currentlyDisplayedEndIndex} of ${totalResults}`}
                    <span
                        onClick={
                            prevResultsLink
                                ? () => handleNewPageClick(prevResultsLink, index)
                                : () => {}
                        }
                        className={`${prevResultsLink ? 'text-slate-600 hover:text-sky-500 hover:cursor-pointer' : 'text-slate-300'} text-base pl-4 pr-2`}
                    >
                        &lt;
                    </span>
                    <span
                        onClick={
                            nextResultsLink
                                ? () => handleNewPageClick(nextResultsLink, index)
                                : () => {}
                        }
                        className={`${nextResultsLink ? 'text-slate-600 hover:text-sky-500 hover:cursor-pointer' : 'text-slate-300'} text-base`}
                    >
                        &gt;
                    </span>
                </p>
            ) : null}
            <ul className="scrollbar-always-visible overflow-y-auto flex-grow peer-hover:text-slate-500 peer-hover:border peer-hover:border-blue-400 rounded-md">
                {data.map((item: TiledSearchItem<TiledStructures>) => {
                    const id = `item-${item.id}${index}`;
                    const blueskyRunPlanName = item?.attributes?.metadata?.start?.plan_name || '';
                    const blueskyRunPlanStartTime = item?.attributes?.metadata?.start?.time
                        ? dayjs.unix(item.attributes.metadata.start.time).format('MM/DD HH:mm')
                        : '';
                    const displayText = `${showPlanStartTime ? blueskyRunPlanStartTime : ''} ${showPlanName ? blueskyRunPlanName : ''}  ${item.id}`;
                    return (
                        <TiledRowItem
                            key={id}
                            id={id}
                            item={item}
                            displayText={displayText}
                            isSelected={
                                breadcrumbs.length > index && breadcrumbs[index].label === item.id
                            }
                            onClick={() => onItemClick(item, index)}
                            handleSelectClick={handleSelectClick}
                            showTooltip={showTooltip}
                            columnMode
                        />
                    );
                })}
            </ul>
        </div>
    );
}
