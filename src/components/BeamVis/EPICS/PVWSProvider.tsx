/* eslint-disable react-refresh/only-export-components */
// src/epics.tsx
import {useRef, useEffect, useCallback, ReactNode} from 'react';
import { EpicsContext, EpicsApi } from './EpicsContext';


export const PVWSProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<WebSocket>();
  const callbacks = useRef<Record<string, (v: number) => void>>({});
  const subscribedPVs = useRef<Set<string>>(new Set());

  const sendMsg = (msg: Object) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(msg));
      console.log('[EPICS][PVWS] sent: ', msg);
    }
  }

  useEffect(() => {

    const url = 'ws://localhost:8080/pvws/pv';
    console.log('[EPICS][PVWS] connecting to', url);
    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      console.log('[EPICS][PVWS] socket open');
      subscribedPVs.current.forEach(pv => {
        const msg = { type: 'subscribe', pvs: [pv] };
        console.log('[EPICS][PVWS] subscribe (onopen)→', msg);
        sendMsg(msg);
      });
    };

    socket.current.onmessage = ({ data }) => {
      console.log('[EPICS][PVWS] recv', data);
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

    socket.current.onerror = e => console.error('[EPICS][PVWS] error', e);

    return () => {
      console.log('[EPICS][PVWS] socket closing');
      socket.current?.close();
    };
  }, []);

  const subscribe = useCallback<EpicsApi['subscribe']>((pv, cb) => {
    callbacks.current[pv] = cb;
    subscribedPVs.current.add(pv);

    if (socket.current?.readyState === WebSocket.OPEN) {
      const msg = { type: 'subscribe', pvs: [pv] };
      console.log('[EPICS][PVWS] subscribe→', msg);
      sendMsg(msg);
    }
  }, []);

  const publish = useCallback<EpicsApi['publish']>((pv, v) => {
    const msg = { type: 'write', pv, value: v };
    console.log('[EPICS][PVWS] publish→', msg);
    sendMsg(msg);
  }, []);

  return (
    <EpicsContext.Provider value={{ subscribe, publish }}>
      {children}
    </EpicsContext.Provider>
  );
};
