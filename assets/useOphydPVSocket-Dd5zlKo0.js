import{r}from"./index-BlmOqGMO.js";import{u as k}from"./OphydTransportContext-C-T3dDhJ.js";function l(s,d){const t=r.useMemo(()=>s,[JSON.stringify(s)]),a=k(d),[f,c]=r.useState(()=>u(t)),p=r.useRef(!1),h=r.useCallback(o=>{c(e=>({...e,[o]:{...e[o],locked:!e[o].locked}}))},[]),y=r.useCallback((o,e)=>{a.send({action:"set",pv:o,value:e})},[a]),b=r.useCallback(o=>{c(e=>({...e,[o]:{...e[o],expanded:!e[o].expanded}}))},[]);return r.useEffect(()=>{p.current?c(u(t)):p.current=!0},[t]),r.useEffect(()=>{if(t.length===0)return;const o=a.onMessage(e=>{if("sub_type"in e&&e.sub_type==="meta")c(n=>n[e.pv]?{...n,[e.pv]:{...n[e.pv],...e,min:e.lower_ctrl_limit,max:e.upper_ctrl_limit}}:n);else if("pv"in e){const n=e.pv;c(i=>i[n]?{...i,[n]:{...i[n],...e}}:i)}else"error"in e&&console.error("Ophyd PV socket error:",e.error)});for(const e of t)a.send({action:"subscribe",pv:e});return()=>{o();for(const e of t)a.send({action:"unsubscribe",pv:e})}},[a,t]),{devices:f,toggleDeviceLock:h,handleSetValueRequest:y,toggleExpand:b}}function u(s){const d={};for(const t of s)d[t]={name:t,value:"",connected:!1,locked:!1,timestamp:0,expanded:!1,pv:t,read_access:!1,write_access:!1};return d}try{l.displayName="useOphydPVSocket",l.__docgenInfo={description:`Manage subscriptions to a set of EPICS PVs and surface their values as a
Devices map.

Connection lifecycle is delegated to a transport read from
OphydTransportProvider — see [src/api/ophyd/OphydTransportProvider.tsx].
When no provider is mounted, a fallback transport pointed at the
configured ophyd-websocket backend is created lazily (one per
consumer-URL pair). To make two hook calls observe the same state, wrap
the tree in an OphydTransportProvider with a shared transport.`,displayName:"useOphydPVSocket",props:{}}}catch{}export{l as u};
