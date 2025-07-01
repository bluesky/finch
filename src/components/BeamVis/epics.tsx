/* eslint-disable react-refresh/only-export-components */
// src/epics.tsx

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';

export type EpicsContextType = {
  subscribe: (pv: string, cb: (v: number) => void) => void;
  publish: (pv: string, v: number) => void;
};

export const EpicsContext = createContext<EpicsContextType>(null!);

export const EpicsProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<WebSocket>();
  const callbacks = useRef<Record<string, (v: number) => void>>({});
  const subscribedPVs = useRef<Set<string>>(new Set());

  useEffect(() => {
    const url = 'ws://localhost:8080/pvws/pv';
    console.log('[EPICS] connecting to', url);
    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      console.log('[EPICS] socket open');
      subscribedPVs.current.forEach(pv => {
        const msg = { type: 'subscribe', pvs: [pv] };
        console.log('[EPICS] subscribe (onopen)→', msg);
        socket.current!.send(JSON.stringify(msg));
      });
    };

    socket.current.onmessage = ({ data }) => {
      console.log('[EPICS] recv', data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let msg: any;
      try {
        msg = JSON.parse(data);
      } catch {
        return;
      }
      // Only dispatch numeric updates
      if (
        msg.type === 'update' &&
        typeof msg.value === 'number' &&
        callbacks.current[msg.pv]
      ) {
        callbacks.current[msg.pv](msg.value);
      }
    };

    socket.current.onerror = e => console.error('[EPICS] error', e);

    return () => {
      console.log('[EPICS] socket closing');
      socket.current?.close();
    };
  }, []);

  const subscribe = useCallback((pv: string, cb: (v: number) => void) => {
    callbacks.current[pv] = cb;
    subscribedPVs.current.add(pv);

    if (socket.current?.readyState === WebSocket.OPEN) {
      const msg = { type: 'subscribe', pvs: [pv] };
      console.log('[EPICS] subscribe→', msg);
      socket.current.send(JSON.stringify(msg));
    }
  }, []);

  const publish = useCallback((pv: string, v: number) => {
    const msg = { type: 'write', pv, value: v };
    console.log('[EPICS] publish→', msg);
    socket.current?.send(JSON.stringify(msg));
  }, []);

  return (
    <EpicsContext.Provider value={{ subscribe, publish }}>
      {children}
    </EpicsContext.Provider>
  );
};

export function useEpics(pv: string): number {
  const { subscribe } = useContext(EpicsContext);
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    subscribe(pv, setValue);
  }, [pv, subscribe]);

  return value;
}
