import { TabData } from '../../Tabs/types/tabs';
export declare function useTabLS(fileName: string, P: string, R: string, instanceId: string, oldFileName?: string): {
    loadTabsFromStorage: () => TabData[];
    saveTabsToStorage: (tabsToSave: TabData[]) => void;
    loadActiveTabFromStorage: (tabs: TabData[]) => string;
    saveActiveTabToStorage: (activeTabId: string) => void;
    clearTabStorage: () => void;
    cleanupEmptyLocalStorage: () => void;
};
//# sourceMappingURL=useTabsLocalStorage.d.ts.map