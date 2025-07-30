import { TabData } from "@/components/Tabs/types/tabs";

export function useTabLS(fileName: string, P: string, R: string, instanceId: string, oldFileName?: string) {
  const STORAGE_KEY = `csi-tabs-${instanceId}`;
  const ACTIVE_TAB_KEY = `csi-active-tab-${instanceId}`;

  const createDefaultTab = (): TabData => ({
    id: "tab1",
    label: fileName,
    content: null, // gets populated from component that calls it
    fileName: fileName, // Use current fileName instead of oldFileName
    args: { P, R },
    isMainTab: true,
    scale: 0.85, // Add default scale
  });

  const clearTabStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_TAB_KEY);
    } catch (error) {
      console.error("Error clearing tab storage:", error);
    }
  };

  const loadTabsFromStorage = (): TabData[] => {
    try {
      const storedTabs = localStorage.getItem(STORAGE_KEY);
      if (storedTabs) {
        const parsedTabs: TabData[] = JSON.parse(storedTabs);

        // Check if main tab exists
        const mainTab = parsedTabs.find((tab) => tab.isMainTab);

        // If oldFileName is provided and different from stored main tab filename, clear storage
        if (oldFileName && mainTab && mainTab.fileName !== oldFileName) {
          clearTabStorage();
          return [createDefaultTab()];
        }

        // If no oldFileName provided but we have a fileName prop, check against that
        if (!oldFileName && mainTab && mainTab.fileName !== fileName) {
          clearTabStorage();
          return [createDefaultTab()];
        }

        // Check if main tab exists with current filename
        // Check if main tab exists with current filename
        const hasMainTab = parsedTabs.some((tab) => tab.isMainTab && tab.fileName === fileName);
        if (!hasMainTab) {
          // Check if there are any main tabs at all
          const anyMainTab = parsedTabs.some((tab) => tab.isMainTab);

          if (anyMainTab) {
            // Update the main tab's filename if it exists but has wrong filename
            const updatedTabs = parsedTabs.map(tab =>
              tab.isMainTab ? { ...tab, fileName, label: fileName } : tab
            );
            return updatedTabs;
          }

          // If no main tab exists at all, that's fine - just return the existing tabs
          // Only create a default tab if there are no tabs at all
          if (parsedTabs.length === 0) {
            return [createDefaultTab()];
          }

          return parsedTabs.map(tab => ({
            ...tab,
            scale: tab.scale || 0.85
          }));
        }
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
        scale: tab.scale || 0.85, // Include scale in saved data
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
    clearTabStorage,
  };
}