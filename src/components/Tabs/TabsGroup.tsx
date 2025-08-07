// components/TabsGroup.tsx
import React, { ReactNode, useState } from 'react';
import { TabsContext } from './context/TabsContext';

interface TabsProps {
  defaultValue?: string;
  value?: string; // controlled value
  onValueChange?: (value: string) => void; // controlled change handler
  children: ReactNode;
  className?: string;
}

export const TabsGroup: React.FC<TabsProps> = ({ 
  defaultValue,
  value,
  onValueChange,
  children, 
  className = '' 
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || '');
  
  // Use controlled value if provided, otherwise use internal state
  const activeTab = value !== undefined ? value : internalActiveTab;
  
  const setActiveTab = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue); // Controlled mode
    } else {
      setInternalActiveTab(newValue); // Uncontrolled mode
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};