import { Breadcrumb } from './types';
type TiledHeaderProps = {
    breadcrumbs?: Breadcrumb[];
    onLeftArrowClick?: Function;
    onRightArrowClick?: Function;
    onHomeClick?: Function;
    imageUrl?: string;
    title?: string;
    secondaryTitle?: string;
    handleExpandClick: Function;
    isExpanded: boolean;
};
export default function TiledHeader({ breadcrumbs, onLeftArrowClick, onRightArrowClick, onHomeClick, imageUrl, title, secondaryTitle, handleExpandClick, isExpanded, ...props }: TiledHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledHeader.d.ts.map