import React from 'react';
import { TabsListProps } from './types/tabs';

export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`flex border-b border-gray-200 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
};