import React, {
  createContext,
  useContext
} from 'react';

export type EpicsApi = {
  subscribe: (pv: string, cb: (v: number) => void) => void;
  publish: (pv: string, v: number) => void;
};

export const EpicsContext = createContext<EpicsApi>({
  subscribe: () => {},
  publish: () => {}
});

export function useEpics(): EpicsApi {
  return useContext(EpicsContext);
}

export function usePV(pv: string): number {
  const { subscribe } = useEpics();
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    subscribe(pv, setValue);
  }, [pv, subscribe]);
  return value;
}