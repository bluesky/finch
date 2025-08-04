import { TabData } from '../../Tabs/types/tabs';
export declare function useTabLS(fileName: string, P: string, R: string): {
    loadTabsFromStorage: () => TabData[];
    saveTabsToStorage: (tabsToSave: TabData[]) => void;
    loadActiveTabFromStorage: (tabs: TabData[]) => string;
    saveActiveTabToStorage: (activeTabId: string) => void;
};
//# sourceMappingURL=useTabsLS.d.ts.map