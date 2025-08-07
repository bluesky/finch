import { TabData } from "@/components/Tabs/types/tabs";

export function useTabLS(fileName: string, P: string, R: string) {
  const STORAGE_KEY = `adl-tabs-${fileName}`;
  const ACTIVE_TAB_KEY = `adl-active-tab-${fileName}`;

  const createDefaultTab = (): TabData => ({
    id: "tab1",
    label: fileName,
    content: null, // gets populated from component that calls it
    fileName,
    args: { P, R },
    isMainTab: true,
  });

  const loadTabsFromStorage = (): TabData[] => {
    try {
      const storedTabs = localStorage.getItem(STORAGE_KEY);
      if (storedTabs) {
        const parsedTabs: TabData[] = JSON.parse(storedTabs);
        
        // Check if main tab exists
        const hasMainTab = parsedTabs.some((tab) => tab.fileName === fileName);
        if (!hasMainTab) {
          return [createDefaultTab(), ...parsedTabs];
        }
        
        return parsedTabs;
      }
    } catch (error) {
      console.error("Error loading tabs from localStorage:", error);
    }
    
    return [createDefaultTab()];
  };

  const saveTabsToStorage = (tabsToSave: TabData[]) => {
    try {
      const storedTabs = tabsToSave.map((tab) => ({
        id: tab.id,
        label: tab.label,
        fileName: tab.fileName,
        args: tab.args,
        isMainTab: tab.isMainTab,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedTabs));
    } catch (error) {
      console.error("Error saving tabs to localStorage:", error);
    }
  };

  const loadActiveTabFromStorage = (tabs: TabData[]): string => {
    try {
      const storedActiveTab = localStorage.getItem(ACTIVE_TAB_KEY);
      if (storedActiveTab && tabs.some((tab) => tab.id === storedActiveTab)) {
        return storedActiveTab;
      }
    } catch (error) {
      console.error("Error loading active tab from localStorage:", error);
    }
    return tabs[0]?.id || "tab1";
  };

  const saveActiveTabToStorage = (activeTabId: string) => {
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
    } catch (error) {
      console.error("Error saving active tab to localStorage:", error);
    }
  };

  return {
    loadTabsFromStorage,
    saveTabsToStorage,
    loadActiveTabFromStorage,
    saveActiveTabToStorage,
  };
}