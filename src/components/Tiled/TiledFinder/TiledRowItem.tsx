import { TiledSearchItem, TiledStructures, isContainerStructure } from './types';
import { getTiledStructureIcon } from './utils';
import { CaretUp, CaretDown, CaretRight } from '@phosphor-icons/react';
import { Tooltip } from 'react-tooltip';
import Button from './ui/Button';
import { cn } from '@/lib/utils';

type TiledRowItemProps = {
    item: TiledSearchItem<TiledStructures>;
    displayText: string;
    isSelected: boolean;
    isExpanded?: boolean;
    onClick: () => void;
    depth?: number;
    id?: string;
    handleSelectClick?: (item: TiledSearchItem<TiledStructures>) => void;
    showTooltip?: boolean;
    columnMode?: boolean;
};

export function TiledRowItem({
    item,
    displayText,
    isSelected,
    isExpanded,
    onClick,
    depth,
    id,
    handleSelectClick,
    showTooltip,
    columnMode,
}: TiledRowItemProps) {
    const isContainer = isContainerStructure(item);
    const paddingLeft = `${(depth ?? 0) * 1.25 + 0.5}rem`;

    return (
        <li
            id={id}
            className={cn(
                'flex items-center space-x-2 px-2 rounded-sm hover:cursor-pointer hover:bg-sky-300',
                isSelected ? 'bg-sky-200 hover:bg-sky-300' : '',
            )}
            style={{ paddingLeft }}
            onClick={onClick}
        >
            <div className={`w-6 aspect-square flex-shrink-0 ${isContainer ? 'text-sky-700' : ''}`}>
                {getTiledStructureIcon(item)}
            </div>
            <p className="truncate flex-grow">{displayText}</p>
            {isContainer && (
                <div className="flex-shrink-0 text-slate-400 w-fit h-fit">
                    {columnMode ? (
                        <CaretRight className="w-full h-full" />
                    ) : isExpanded ? (
                        <CaretUp className="w-full h-full" />
                    ) : (
                        <CaretDown className="w-full h-full" />
                    )}
                </div>
            )}
            {handleSelectClick && showTooltip && id && (
                <Tooltip
                    children={
                        <Button
                            text="Select"
                            size="small"
                            cb={(e?: React.MouseEvent) => {
                                e?.stopPropagation();
                                handleSelectClick(item);
                            }}
                        />
                    }
                    anchorSelect={`#${id}`}
                    clickable
                    delayShow={600}
                    opacity={1}
                    offset={10}
                    place="top"
                    variant="info"
                    style={{
                        maxWidth: '500px',
                        margin: '0',
                        padding: '0.3rem',
                        height: 'fit-content',
                        backgroundColor: '#e9e8eb',
                        borderWidth: '1px',
                        borderRadius: '1rem',
                    }}
                />
            )}
        </li>
    );
}
