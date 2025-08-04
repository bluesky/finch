import { ReactNode } from '../../../../node_modules/react';
import { TabData, TabsContextType } from '../types/tabs';
export declare const TabsContext: import('../../../../node_modules/react').Context<TabsContextType | undefined>;
export declare const useTabsContext: () => TabsContextType;
interface TabManagementContextType {
    addTab: (label: string, content: ReactNode, fileName?: string, args?: Record<string, any>) => void;
    removeTab: (tabId: string) => void;
    tabs: TabData[];
    activeTab: string;
    setActiveTab: (tabId: string) => void;
}
export declare const useTabManagement: () => TabManagementContextType;
export declare const TabManagementProvider: React.FC<{
    children: ReactNode;
    value: TabManagementContextType;
}>;
export {};
//# sourceMappingURL=TabsContext.d.ts.map