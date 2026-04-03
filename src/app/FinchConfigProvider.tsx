import React, { createContext, useContext } from 'react';

export type FinchConfig = {
  tiledApiUrl?: string;
  tiledApiKey?: string;
  ophydApiUrl?: string;
  qServerApiUrl?: string;
  qServerApiKey?: string;
  finchApiUrl?: string;
};

const FinchConfigContext = createContext<FinchConfig | null>(null);

export function FinchConfigProvider({
  config,
  children,
}: {
  config: FinchConfig;
  children: React.ReactNode;
}) {
  return (
    <FinchConfigContext.Provider value={config}>
      {children}
    </FinchConfigContext.Provider>
  );
}

export function useOptionalFinchConfig() {
  return useContext(FinchConfigContext);
}