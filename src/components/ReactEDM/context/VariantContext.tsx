// Create a new file: MockContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface VariantContextType {
  variant: string;
}

const VariantContext = createContext<VariantContextType | undefined>(undefined);

export const VariantProvider = ({ 
  children, 
  variant 
}: { 
  children: ReactNode; 
  variant: string; 
}) => {
  return (
    <VariantContext.Provider value={{ variant }}>
      {children}
    </VariantContext.Provider>
  );
};

export const useVariant = () => {
  const context = useContext(VariantContext);
  if (context === undefined) {
    throw new Error('useVariant must be used within a MockProvider');
  }
  return context;
};