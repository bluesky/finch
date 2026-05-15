export interface TestItem {
    name: string;
    element: JSX.Element;
    info?: string;
    link?: string;
    command?: string;
}

export interface TestItemCollection {
    [key: string]: TestItem;
}

export interface ComponentViewerItemRow extends TestItem {
    comment?: string;
    isPassing: boolean;
}

export interface ComponentViewerCollection {
    [key: string]: ComponentViewerItemRow;
}
