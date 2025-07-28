// Create a new file: MockContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface MockContextType {
  mock: boolean;
}

const MockContext = createContext<MockContextType | undefined>(undefined);

export const MockProvider = ({ 
  children, 
  mock 
}: { 
  children: ReactNode; 
  mock: boolean; 
}) => {
  return (
    <MockContext.Provider value={{ mock }}>
      {children}
    </MockContext.Provider>
  );
};

export const useMock = () => {
  const context = useContext(MockContext);
  if (context === undefined) {
    throw new Error('useMock must be used within a MockProvider');
  }
  return context;
};