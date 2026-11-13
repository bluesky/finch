import { Breadcrumb } from './types';
import { getDefaultTiledApiClient } from '@/api/tiled';
import blueskyLogo from './bluesky_logo.png';
import { CaretLeft, CaretRight, ArrowsIn, ArrowsOut } from '@phosphor-icons/react';
import TiledSearchBar from './TiledSearchBar';

const defaultUrl = getDefaultTiledApiClient().getBaseUrl();

type TiledHeaderProps = {
    breadcrumbs?: Breadcrumb[];
    onLeftArrowClick?: () => void;
    onRightArrowClick?: () => void;
    onHomeClick?: () => void;
    imageUrl?: string;
    title?: string;
    secondaryTitle?: string;
    handleExpandClick: () => void;
    isExpanded: boolean;
    showExpandButton?: boolean;
    showSearchBar?: boolean;
    handleSearchId?: (id: string) => void;
    handleSearchMetadata?: (metadata: string) => void;
    handleSearchSpec?: (spec: string) => void;
};
export default function TiledHeader({
    breadcrumbs = [],
    onLeftArrowClick,
    onRightArrowClick,
    onHomeClick,
    imageUrl = blueskyLogo,
    title = 'Tiled',
    secondaryTitle = defaultUrl,
    handleExpandClick,
    isExpanded,
    showExpandButton = true,
    showSearchBar = true,
    handleSearchId,
    handleSearchMetadata,
    handleSearchSpec,
    ...props
}: TiledHeaderProps) {
    type ArrowProps = {
        onClick?: () => void;
        icon: JSX.Element;
    };
    const Arrow = ({ onClick, icon }: ArrowProps) => {
        return (
            <div
                className={`w-6 aspect-square flex-shrink-0 ${onClick ? 'hover:text-slate-400 hover:cursor-pointer text-slate-600' : 'text-slate-200'} `}
                onClick={onClick || (() => {})}
            >
                {icon}
            </div>
        );
    };

    return (
        <div className="flex w-full min-h-14 pb-2 pt-2 relative pl-4 " {...props}>
            <div className="flex items-end w-1/4">
                <Arrow onClick={onLeftArrowClick} icon={<CaretLeft className="w-full h-full" />} />
                <Arrow
                    onClick={onRightArrowClick}
                    icon={<CaretRight className="w-full h-full" />}
                />
                <p className="truncate">
                    {' '}
                    {breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].label}
                </p>
            </div>

            <div
                data-testid="tiled-header"
                onClick={onHomeClick || (() => {})}
                className="w-4/5 flex items-end justify-center space-x-4 mx-auto absolute left-1/2 transform -translate-x-1/2 hover:cursor-pointer hover:opacity-70"
            >
                <img src={imageUrl} className="w-16 h-auto" alt="Bluesky Logo" />
                <div className="flex items-center gap-4">
                    <h2 className="text-sky-900 font-semibold text-lg">{title}</h2>
                    <p className="text-sm">{secondaryTitle}</p>
                </div>
            </div>
            <div className="absolute top-0 right-0 mr-3 mt-3 h-10 items-center aspect-square  flex gap-2">
                {showSearchBar && (
                    <TiledSearchBar
                        handleSearchIdClick={handleSearchId}
                        handleSearchMetadataClick={handleSearchMetadata}
                        handleSearchSpecClick={handleSearchSpec}
                    />
                )}
                {showExpandButton && (
                    <div
                        className="h-6 aspect-square text-slate-500 hover:text-slate-900 hover:cursor-pointer"
                        onClick={handleExpandClick}
                    >
                        {isExpanded ? (
                            <ArrowsIn className="w-full h-full" />
                        ) : (
                            <ArrowsOut className="w-full h-full" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
