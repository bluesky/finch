export type TiledProps = {
    onSelectCallback?: Function;
    size?: 'small' | 'medium' | 'large';
    closeOnSelect?: boolean;
    isPopup?: boolean;
    enableStartupScreen?: boolean;
    tiledBaseUrl?: string;
    backgroundClassName?: string;
    singleColumnMode?: boolean;
    contentClassName?: string;
    isFullWidth?: boolean;
};
export default function Tiled({ onSelectCallback, size, closeOnSelect, isPopup, enableStartupScreen, tiledBaseUrl, backgroundClassName, contentClassName, singleColumnMode, isFullWidth, ...props }: TiledProps): import("react/jsx-runtime").JSX.Element | undefined;
//# sourceMappingURL=Tiled.d.ts.map