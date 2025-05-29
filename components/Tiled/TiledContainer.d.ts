type TiledContainerProps = {
    url: string | undefined;
    onSelectCallback?: Function;
    closeOnSelect?: boolean;
    setIsClosed: Function;
    singleColumnMode?: boolean;
    handleExpandClick: Function;
    isExpanded: boolean;
};
export default function TiledContainer({ url, onSelectCallback, closeOnSelect, setIsClosed, singleColumnMode, handleExpandClick, isExpanded, ...props }: TiledContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TiledContainer.d.ts.map