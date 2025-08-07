import React from 'react';
import { useTabsContext } from './context/TabsContext';
import { TabsPanelProps } from './types/tabs';

export const TabsPanel: React.FC<TabsPanelProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      className={`py-4 ${className}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      id={`panel-${value}`}
    >
      {children}
    </div>
  );
};