import { useState, useEffect } from "react";
import { TabsGroup } from "@/components/Tabs/TabsGroup";
import { TabsList } from "@/components/Tabs/TabsList";
import { Tab } from "@/components/Tabs/Tab";
import { TabsPanel } from "@/components/Tabs/TabsPanel";
import { TabData } from "../Tabs/types/tabs";
import { TabManagementProvider } from "../Tabs/context/TabsContext";
import { useTabLS } from "./hooks/useTabsLS";
import ADLView from "./ADLView";

export type ADLControllerProps = {
  className?: string;
  fileName: string;
  P: string;
  R: string;
};

export default function ADLController({
  className,
  fileName,
  P,
  R,
}: ADLControllerProps) {
  // grab localstorage tab functions from webhook
  const {
    loadTabsFromStorage,
    saveTabsToStorage,
    loadActiveTabFromStorage,
    saveActiveTabToStorage,
  } = useTabLS(fileName, P, R);

  // populates tab content based on the tab filename and args
  const addContentToTabs = (tabsData: TabData[]): TabData[] => {
    return tabsData.map((tab) => ({
      ...tab,
      content: tab.isMainTab ? null : (
        <ADLView fileName={tab.fileName!} {...tab.args} />
      ),
    }));
  };

  // Initialize tabs
  const [tabs, setTabs] = useState<TabData[]>(() => {
    const storedTabs = loadTabsFromStorage();
    return addContentToTabs(storedTabs);
  });

  // Initialize active tab
  const [activeTab, setActiveTab] = useState(() =>
    loadActiveTabFromStorage(tabs)
  );

  // store tab info to localstorage when they change
  useEffect(() => {
    saveTabsToStorage(tabs);
  }, [tabs, saveTabsToStorage]);

  // store active tab to localstorage when it changes
  useEffect(() => {
    saveActiveTabToStorage(activeTab);
  }, [activeTab, saveActiveTabToStorage]);

  const removeTab = (tabId: string) => {
    const tabToRemove = tabs.find((tab) => tab.id === tabId);

    // Prevent deletion of main tab
    if (tabToRemove && tabToRemove.fileName === fileName) {
      return;
    }

    const currentTabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // Handle active tab switching
    if (activeTab === tabId && newTabs.length > 0) {
      if (currentTabIndex < newTabs.length) {
        setActiveTab(newTabs[currentTabIndex].id);
      } else {
        setActiveTab(newTabs[currentTabIndex - 1].id);
      }
    } else if (newTabs.length === 0) {
      setActiveTab("");
    }
  };

  // used when opening a related display (a new tab)
  const addTabWithContent = (
    label: string,
    content: React.ReactNode,
    fileName?: string,
    args?: Record<string, any>
  ) => {
    // Check if a tab with the same fileName and args already exists
    const existingTab = tabs.find((tab) => {
      if (tab.fileName !== fileName) return false;

      // comparison of args objects
      if (!tab.args && !args) return true;
      if (!tab.args || !args) return false;

      const tabArgsKeys = Object.keys(tab.args);
      const argsKeys = Object.keys(args);

      if (tabArgsKeys.length !== argsKeys.length) return false;

      return tabArgsKeys.every(key => tab.args![key] === args[key]);
    });

    // if the tab exists, make it active
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    // Tab doesn't exist, create a new one
    const newId = `tab${Date.now()}`;
    const newTab: TabData = {
      id: newId,
      label,
      content,
      fileName,
      args,
      isMainTab: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  const tabManagementValue = {
    addTab: addTabWithContent,
    removeTab,
    tabs,
    activeTab,
    setActiveTab,
  };

  return (
    <TabManagementProvider value={tabManagementValue}>
      <TabsGroup value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <div key={tab.id} className="flex items-center">
              <Tab
                value={tab.id}
                removeTab={removeTab}
                mainTab={tab.isMainTab}
              >
                {tab.label}
              </Tab>
            </div>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{ display: activeTab === tab.id ? "block" : "none" }}
          >
            {tab.isMainTab ? (
              <ADLView fileName={fileName} P={P} R={R} />
            ) : (
              tab.content
            )}
          </div>
        ))}
      </TabsGroup>
    </TabManagementProvider>
  );
}