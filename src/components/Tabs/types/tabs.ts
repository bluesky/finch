import { ReactNode } from 'react';

export interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export interface TabProps {
  value: string;
  children: ReactNode;
  removeTab: (tabId: string) => void
  mainTab?: boolean;
  className?: string;
<<<<<<< HEAD
  hasFileProp: boolean;
=======
>>>>>>> main
}

export interface TabsPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export interface TabData {
  id: string;
  label: string;
  content?: React.ReactNode;
  fileName?: string;
  args?: Record<string, any>;
  isMainTab?: boolean;
<<<<<<< HEAD
  scale: number;
=======
>>>>>>> main
}