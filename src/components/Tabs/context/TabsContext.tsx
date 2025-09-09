import { createContext, useContext, ReactNode } from 'react';
import { TabData, TabsContextType } from '../types/tabs';

export const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a TabsGroup');
  }
  return context;
};

interface TabManagementContextType {
<<<<<<< HEAD
  addTab: (label: string, content: ReactNode, fileName: string, args: Record<string, any>, scale: number) => void;
=======
  addTab: (label: string, content: ReactNode, fileName?: string, args?: Record<string, any>) => void;
>>>>>>> main
  removeTab: (tabId: string) => void;
  tabs: TabData[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const TabManagementContext = createContext<TabManagementContextType | undefined>(undefined);

export const useTabManagement = () => {
  const context = useContext(TabManagementContext);
  if (!context) {
    throw new Error('useTabManagement must be used within TabManagementProvider');
  }
  return context;
};

export const TabManagementProvider: React.FC<{ 
  children: ReactNode;
  value: TabManagementContextType;
}> = ({ children, value }) => {
  return (
    <TabManagementContext.Provider value={value}>
      {children}
    </TabManagementContext.Provider>
  );
};