import { useState, useEffect, useCallback } from "react";
import { TabsGroup } from "@/components/Tabs/TabsGroup";
import { TabsList } from "@/components/Tabs/TabsList";
import { Tab } from "@/components/Tabs/Tab";
import { TabData } from "../Tabs/types/tabs";
import { TabManagementProvider } from "../Tabs/context/TabsContext";
import { useTabLS } from "./hooks/useTabsLocalStorage";
import CSIView from "./CSIView";

export type CSIControllerContentProps = {
    className?: string;
    hasFileProp: boolean;
    fileName: string;
    oldFileName?: string;
    P: string;
    R: string;
    instanceId: string;
};

export default function CSIControllerContent({
    className,
    hasFileProp,
    fileName,
    oldFileName,
    P,
    R,
    instanceId,
}: CSIControllerContentProps) {
    const {
        loadTabsFromStorage,
        saveTabsToStorage,
        loadActiveTabFromStorage,
        saveActiveTabToStorage,
    } = useTabLS(fileName, P, R, instanceId, oldFileName);

    // Function to update tab scale
    const updateTabScale = useCallback((tabId: string, newScale: number) => {
        setTabs(prevTabs =>
            prevTabs.map(tab =>
                tab.id === tabId
                    ? { ...tab, scale: newScale }
                    : tab
            )
        );
    }, []);

    // Initialize tabs without content first
    const [tabs, setTabs] = useState<TabData[]>(() => {
        const storedTabs = loadTabsFromStorage();
        return storedTabs.map(tab => ({ ...tab, content: null }));
    });

    // Initialize active tab
    const [activeTab, setActiveTab] = useState(() =>
        loadActiveTabFromStorage(tabs)
    );

    // Generate content for tabs - this needs to be a separate effect that runs when tabs change
    useEffect(() => {
        setTabs(prevTabs =>
            prevTabs.map(tab => ({
                ...tab,
                content: tab.isMainTab ? null : (
                    <CSIView
                        className={className}
                        fileName={tab.fileName!}
                        scale={tab.scale || 0.85}
                        onScaleChange={(newScale) => updateTabScale(tab.id, newScale)}
                        {...tab.args}
                    />
                )
            }))
        );
    }, []); // Run once on mount to set up initial content

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
        
        if (hasFileProp && tabToRemove && tabToRemove.fileName === fileName) {
            return;
        }
        const currentTabIndex = tabs.findIndex((tab) => tab.id === tabId);
        const newTabs = tabs.filter((tab) => tab.id !== tabId);
        setTabs(newTabs);

        if (activeTab === tabId && newTabs.length > 0) {
            if (currentTabIndex < newTabs.length) {
                setActiveTab(newTabs[currentTabIndex].id);
            } else {
                setActiveTab(newTabs[currentTabIndex - 1].id);
            }
        } else if (newTabs.length === 0) {
            setActiveTab("");
        }

        // Dispatch the event after state updates
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('csi-tabs-updated'));
        }, 0);
    };

    const addTabWithContent = (
        label: string,
        content: React.ReactNode,
        fileName: string,
        args: Record<string, any>,
        scale: number
    ) => {
        const fileNameNoType: string = fileName.split(".")[0];
        const fileType: string = fileName.split(".")[1];
        const fileNameClean = fileType.toLowerCase() === "opi" ? `${fileNameNoType}.bob` : fileName;

        const existingTab = tabs.find((tab) => {
            if (tab.fileName !== fileNameClean) return false;

            if (!tab.args && !args) return true;
            if (!tab.args || !args) return false;

            const tabArgsKeys = Object.keys(tab.args);
            const argsKeys = Object.keys(args);

            if (tabArgsKeys.length !== argsKeys.length) return false;

            return tabArgsKeys.every((key) => tab.args![key] === args[key]);
        });

        if (existingTab) {
            setActiveTab(existingTab.id);
            return;
        }

        const newId = `tab${Date.now()}`;
        const newTab: TabData = {
            id: newId,
            label,
            content: (
                <CSIView
                    className={className}
                    fileName={fileNameClean}
                    scale={scale}
                    onScaleChange={(newScale) => updateTabScale(newId, newScale)}
                    {...args}
                />
            ),
            fileName: fileNameClean,
            args,
            isMainTab: false,
            scale: scale || 1
        };

        setTabs(prevTabs => [...prevTabs, newTab]);
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
                            <Tab value={tab.id} removeTab={removeTab} mainTab={tab.isMainTab} hasFileProp={hasFileProp}>
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
                            <CSIView
                                className={className}
                                fileName={fileName}
                                P={P}
                                R={R}
                                scale={tab.scale || 0.85}
                                onScaleChange={(newScale) => updateTabScale(tab.id, newScale)}
                            />
                        ) : (
                            tab.content
                        )}
                    </div>
                ))}
            </TabsGroup>
        </TabManagementProvider>
    );
}