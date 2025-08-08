import {useRef, useEffect, useCallback, ReactNode} from 'react';
import { EpicsContext, EpicsApi } from './EpicsContext';

export const OphydProvider = ({ children }: { children: ReactNode}) => {
  const socket = useRef<WebSocket>();
  const callbacks = useRef<Record<string, (v: number) => void>>({});
  const subscribedPVs = useRef<Set<string>>(new Set());


  const sendMsg = (msg: Object) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(msg));
      console.log('[EPICS][Ophyd] sent: ', msg);
    }
  }
  useEffect(() => {
    const url = 'ws://localhost:8000/ophydSocket';
    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      console.log('[EPICS] Ophyd socket open');
      subscribedPVs.current.forEach(pv => {
        const msg = { action: 'subscribe', pv };
        console.log('[EPICS][Ophyd] subscribe (onopen)→', msg);
        sendMsg(msg);
      });
    }
    socket.current.onmessage = ({data}) => {
      console.log('[EPICS][Ophyd] recv', data);
      let msg: any;
      try {
        msg = JSON.parse(data);
      } catch {
        return;
      }
      if (
        typeof msg.pv === 'string' &&
        typeof msg.value === 'number' &&
        callbacks.current[msg.pv]) {
          callbacks.current[msg.pv](msg.value);
        }
    };

    socket.current.onerror = err => console.error('[EPICS][Ophyd] error', err);
    return () => {
      console.log('[EPICS][Ophyd] socket closing');
      socket.current?.close();
    };
  }, []);

  const subscribe = useCallback<EpicsApi['subscribe']>((pv, cb) => {
    callbacks.current[pv] = cb;
    subscribedPVs.current.add(pv);

    if (socket.current?.readyState === WebSocket.OPEN) {
      const msg = { action: 'subscribe', pv };
      console.log('[EPICS][Ophyd] subscribe→', msg);
      sendMsg(msg);
    }
  }, []);

  const publish = useCallback<EpicsApi['publish']>((pv, value) => {
    const msg = { action: 'set', pv, value, timeout: 10 };
    console.log('[EPICS][Ophyd] publish→', msg);
    sendMsg(msg);
  }, []);

  return (
    <EpicsContext.Provider value={{ subscribe, publish }}>
      {children}
    </EpicsContext.Provider>
  );

};
