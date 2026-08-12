import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as V}from"./index-DI2gBlDf.js";import{af as D}from"./index-CBqEk1wQ.js";import{r as l}from"./index-BlmOqGMO.js";import{s as O}from"./CaretDown.es-ew65DCpW.js";import{n as C}from"./Lock.es-BnV14fst.js";import{T as R,a as E,b as k,c as m,d as N,e as x,p as _,C as I,f as q}from"./ControllerRelativeMove-Bj7BvnUb.js";import{c as b}from"./utils-DuMXYCiK.js";import{S as M}from"./SignalMonitorPlotDevice-qdx2aVVF.js";import"./index-yBjzXJbu.js";import"./iframe-XOSWbzr7.js";import"../sb-preview/runtime.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";import"./IconBase.es-N0ZVnnNC.js";import"./InputNumber-CJAomWwQ.js";import"./PlotlyScatter-BCz9pg11.js";import"./react-plotly-DHQ8Bxuu.js";import"./plotGenerators-BwhqB7LR.js";function f(s,n){const[u,d]=l.useState(()=>{const o={};return s.forEach(i=>{o[i]=S(i,0)}),o}),p=l.useRef(0);l.useEffect(()=>{const o=setInterval(()=>{p.current+=1;const i=p.current*.1;d(r=>{let a=!1;const t={...r};return s.forEach(c=>{if(c==="sineSignal"){const h=Math.sin(2*Math.PI*i/6)*50+50;t[c]={...r[c],value:h,timestamp:Date.now()},a=!0}else if(c==="noisySignal"){const h=Math.random()*100;t[c]={...r[c],value:h,timestamp:Date.now()},a=!0}}),a?t:r})},100);return()=>clearInterval(o)},[s]),l.useEffect(()=>{d(o=>{const i={};return s.forEach(r=>{i[r]=o[r]??S(r,0)}),i})},[s]);const v=l.useCallback(o=>{d(i=>{var r;return{...i,[o]:{...i[o],locked:!((r=i[o])!=null&&r.locked)}}})},[]),g=l.useCallback((o,i)=>{o==="sineSignal"||o==="noisySignal"||d(r=>({...r,[o]:{...r[o],value:i,timestamp:Date.now()}}))},[]),j=l.useCallback(o=>{d(i=>{var r;return{...i,[o]:{...i[o],expanded:!((r=i[o])!=null&&r.expanded)}}})},[]);return{devices:u,toggleDeviceLock:v,handleSetValueRequest:g,toggleExpand:j}}function S(s,n){return{name:s,pv:s,value:n,connected:!0,locked:!1,timestamp:Date.now(),expanded:!1,read_access:!0,write_access:s!=="sineSignal"&&s!=="noisySignal",units:s==="sineSignal"||s==="noisySignal"?"arb.":"mm"}}try{f.displayName="useSimOphydPVSocket",f.__docgenInfo={description:'Simulated drop-in replacement for `useOphydPVSocket` that requires no real\nbackend or WebSocket connection.\n\nSpecial device name keywords:\n  - `"sineSignal"` — value continuously tracks a sine wave (0–100, period ~6 s)\n  - `"noisySignal"` — value is random noise between 0 and 100\n\nAll other device names behave as a dummy motor: connected and readable, but\ntheir value only changes when `handleSetValueRequest` is called for them.',displayName:"useSimOphydPVSocket",props:{}}}catch{}function y({devices:s,handleSetValueRequest:n,toggleDeviceLock:u,toggleExpand:d,collapsibleRelativeMove:p=!1,className:v,...g}){const[j,o]=l.useState({}),[i,r]=l.useState(!p);return l.useEffect(()=>{const a={},t=Date.now()/1e3;Object.keys(s).forEach(c=>{const h=s[c];h.timestamp&&t-h.timestamp<=.03&&(a[c]=!0,setTimeout(()=>{o(w=>({...w,[c]:!1}))},500))}),o(a)},[s]),e.jsx("div",{className:b("p-4 w-fit h-fit bg-slate-200 rounded-lg shadow-lg",v),...g,children:e.jsxs(R,{className:"max-w-[900px] m-auto",children:[e.jsx(E,{children:e.jsxs(k,{children:[e.jsx(m,{className:"w-48 text-sky-900 font-medium",children:"Device Name"}),e.jsx(m,{className:"text-center pr-8 text-sky-900 font-medium",children:"Current Value"}),e.jsx(m,{className:"text-left text-sky-900 font-medium",children:"Absolute Move"}),e.jsx(m,{className:"text-center text-sky-900 font-medium",children:p?e.jsxs("button",{type:"button",onClick:()=>r(a=>!a),"aria-expanded":i,className:"mx-auto flex items-center gap-1 font-medium text-sky-900 hover:text-sky-700",children:["Relative Move",e.jsx(O,{size:14,className:b("transition-transform",i?"":"-rotate-90")})]}):"Relative Move"})]})}),e.jsx(N,{children:Object.keys(s).map(a=>{const t=s[a];return e.jsxs(k,{className:`${j[a]?"animate-flash1":""} text-black`,children:[e.jsx(x,{className:"hover:cursor-pointer py-5",onClick:()=>d(a),children:e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:c=>{c.stopPropagation(),u(a,!t.locked)},className:"text-sky-700 hover:text-sky-900 shrink-0",children:t.locked?e.jsx(C,{size:16,weight:"fill"}):e.jsx(_,{size:16})}),e.jsx("p",{children:a})]}),t.expanded&&e.jsx("pre",{className:"text-xs",children:JSON.stringify(t,null,2)})]})}),e.jsx(x,{className:"text-center text-md text-sky-700 font-medium",children:`${typeof t.value=="number"?t.value.toPrecision(4):t.value} ${t.units?t.units.slice(0,3):"n/a"}`}),e.jsx(x,{children:e.jsx(I,{handleEnter:c=>c!==null&&n(a,c),inputLabel:t.units&&t.units.slice(0,3),classNameInput:"bg-sky-200 shadow-inner rounded-md",locked:t.locked})}),e.jsx(x,{children:i&&e.jsx(q,{className:"justify-center",handleEnter:c=>c!==null&&n(a,c),inputLabel:t.units&&t.units.slice(0,3),currentValue:typeof t.value=="number"?t.value:null,classNameInput:"bg-sky-200 shadow-inner rounded-md",locked:t.locked})})]},a)})})]})})}try{y.displayName="TableDeviceController",y.__docgenInfo={description:"",displayName:"TableDeviceController",props:{devices:{defaultValue:null,description:"Map of device names to their current state objects. Each entry renders as one table row.",name:"devices",required:!0,type:{name:"Devices"}},handleSetValueRequest:{defaultValue:null,description:"Called when the user submits an absolute or relative move value for a device.",name:"handleSetValueRequest",required:!0,type:{name:"(deviceName: string, value: number) => void"}},toggleDeviceLock:{defaultValue:null,description:"Called to toggle the locked state for a device, enabling or disabling its move controls.",name:"toggleDeviceLock",required:!0,type:{name:"(deviceName: string, locked: boolean) => void"}},toggleExpand:{defaultValue:null,description:"Called to toggle the expanded state for a device row, showing or hiding its raw JSON data.",name:"toggleExpand",required:!0,type:{name:"(deviceName: string) => void"}},collapsibleRelativeMove:{defaultValue:{value:"false"},description:`When true, the Relative Move column starts collapsed (hidden on render) and
the column header becomes a toggle that reveals it. Defaults to false, so
the relative-move controls are always shown.`,name:"collapsibleRelativeMove",required:!1,type:{name:"boolean"}},className:{defaultValue:null,description:"Additional CSS classes applied to the root container.",name:"className",required:!1,type:{name:"string"}}}}}catch{}const T=["sineSignal","motor1"];function L(){const{devices:s,handleSetValueRequest:n,toggleDeviceLock:u,toggleExpand:d}=f(T);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem",maxWidth:"600px"},children:[e.jsxs("div",{children:[e.jsx("p",{style:{fontWeight:600,marginBottom:"0.5rem"},children:"Device control — motor1 (simulated)"}),e.jsx(y,{devices:{motor1:s.motor1},toggleDeviceLock:u,handleSetValueRequest:n,toggleExpand:d})]}),e.jsxs("div",{children:[e.jsx("p",{style:{fontWeight:600,marginBottom:"0.5rem"},children:"Signal monitor — sineSignal (live animation)"}),e.jsx(M,{device:s.sineSignal})]})]})}function P(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...V(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(D,{title:"Documentation/Ophyd API Hooks"}),`
`,e.jsx(n.h1,{id:"ophyd-api-hooks",children:"Ophyd API Hooks"}),`
`,e.jsxs(n.p,{children:["Finch provides WebSocket-based hooks for real-time EPICS PV and Ophyd device communication. These hooks manage their own WebSocket connections and have ",e.jsx(n.strong,{children:"no react-query dependency"})," — they can be used without a ",e.jsx(n.code,{children:"QueryClientProvider"}),"."]}),`
`,e.jsxs(n.p,{children:["All hooks read their backend URL from ",e.jsx(n.code,{children:"FinchConfigProvider"})," by default. See the ",e.jsx(n.strong,{children:"Configuration"})," page for setup details."]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"useophydpvsocket",children:e.jsx(n.code,{children:"useOphydPVSocket"})}),`
`,e.jsx(n.p,{children:"Connects to the Ophyd WebSocket server and subscribes to live EPICS PV updates. This is the primary hook for interacting with individual process variables."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useOphydPVSocket } from '@blueskyproject/finch';

function DevicePanel() {
  const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
    useOphydPVSocket(['IOC:m1', 'IOC:m2']);

  const motor = devices['IOC:m1'];

  return (
    <div>
      <p>Value: {motor?.value} {motor?.units}</p>
      <p>Connected: {motor?.connected ? 'yes' : 'no'}</p>
      <button
        disabled={motor?.locked}
        onClick={() => handleSetValueRequest('IOC:m1', 5.0)}
      >
        Move to 5
      </button>
      <button onClick={() => toggleDeviceLock('IOC:m1')}>
        {motor?.locked ? 'Unlock' : 'Lock'}
      </button>
    </div>
  );
}
`})}),`
`,e.jsx(n.h3,{id:"parameters",children:"Parameters"}),`
`,e.jsxs(n.p,{children:[`| Parameter | Type | Description |
|---|---|---|
| `,e.jsx(n.code,{children:"deviceNameList"})," | ",e.jsx(n.code,{children:"string[]"}),` | EPICS PV names to subscribe to |
| `,e.jsx(n.code,{children:"wsUrl"})," | ",e.jsx(n.code,{children:"string?"})," | WebSocket URL override. Defaults to ",e.jsx(n.code,{children:"FinchConfigProvider"})," → env var → ",e.jsx(n.code,{children:"ws://localhost:8001"})," |"]}),`
`,e.jsx(n.h3,{id:"return-value",children:"Return value"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`{
  devices: Devices;                                                        // keyed by PV name
  handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
  toggleDeviceLock: (deviceName: string) => void;
  toggleExpand: (deviceName: string) => void;
}
`})}),`
`,e.jsxs(n.h3,{id:"devices-object-shape",children:[e.jsx(n.code,{children:"Devices"})," object shape"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"devices"})," is a dictionary keyed by PV name. Each entry has the following shape:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`{
  name: string;         // PV name
  pv: string;           // same as name
  value: string;        // current value (as string)
  connected: boolean;   // EPICS connection status
  locked: boolean;      // UI lock — set via toggleDeviceLock
  expanded: boolean;    // UI expand state — set via toggleExpand
  timestamp: number;    // last update timestamp
  units?: string;       // physical unit (e.g. "mm", "eV")
  min?: number;         // lower control limit
  max?: number;         // upper control limit
  read_access: boolean;
  write_access: boolean;
}
`})}),`
`,e.jsx(n.h3,{id:"websocket-protocol",children:"WebSocket protocol"}),`
`,e.jsxs(n.p,{children:["On connection, the hook sends a ",e.jsx(n.code,{children:"subscribe"})," message for each PV:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{ "action": "subscribe", "pv": "IOC:m1" }
`})}),`
`,e.jsxs(n.p,{children:["To update a value, ",e.jsx(n.code,{children:"handleSetValueRequest"})," sends:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{ "action": "set", "pv": "IOC:m1", "value": 5.0 }
`})}),`
`,e.jsx(n.p,{children:"The server sends back two message types:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"meta"})," (",e.jsx(n.code,{children:'sub_type: "meta"'}),") — delivered on first subscription and on reconnects; carries ",e.jsx(n.code,{children:"connected"}),", ",e.jsx(n.code,{children:"units"}),", ",e.jsx(n.code,{children:"lower_ctrl_limit"}),", ",e.jsx(n.code,{children:"upper_ctrl_limit"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"value updates"})," — delivered on each PV change; carries ",e.jsx(n.code,{children:"value"}),", ",e.jsx(n.code,{children:"timestamp"}),", ",e.jsx(n.code,{children:"connected"}),"."]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"useophyddevicesocket",children:e.jsx(n.code,{children:"useOphydDeviceSocket"})}),`
`,e.jsxs(n.p,{children:["Connects via ",e.jsx(n.strong,{children:"Ophyd device names"})," rather than raw EPICS PVs. Use this when your backend exposes higher-level Ophyd device objects instead of individual PV addresses."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useOphydDeviceSocket } from '@blueskyproject/finch';

function DevicePanel() {
  const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
    useOphydDeviceSocket(['det', 'motor1']);

  return (
    <div>
      <p>Motor position: {devices['motor1']?.value}</p>
      <button onClick={() => handleSetValueRequest('motor1', 10.0)}>
        Move to 10
      </button>
    </div>
  );
}
`})}),`
`,e.jsx(n.h3,{id:"parameters-1",children:"Parameters"}),`
`,e.jsxs(n.p,{children:[`| Parameter | Type | Description |
|---|---|---|
| `,e.jsx(n.code,{children:"deviceNameList"})," | ",e.jsx(n.code,{children:"string[]"}),` | Ophyd device names to subscribe to |
| `,e.jsx(n.code,{children:"wsUrl"})," | ",e.jsx(n.code,{children:"string?"})," | WebSocket URL override. Defaults to ",e.jsx(n.code,{children:"FinchConfigProvider"})," device-socket URL |"]}),`
`,e.jsx(n.h3,{id:"return-value-1",children:"Return value"}),`
`,e.jsxs(n.p,{children:["Same shape as ",e.jsx(n.code,{children:"useOphydPVSocket"}),", but ",e.jsx(n.code,{children:"devices"})," entries use ",e.jsx(n.code,{children:"device"})," key instead of ",e.jsx(n.code,{children:"pv"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`{
  devices: OphydDevices;   // keyed by device name
  handleSetValueRequest: (deviceName: string, value: string | number | boolean) => void;
  toggleDeviceLock: (deviceName: string) => void;
  toggleExpand: (deviceName: string) => void;
}
`})}),`
`,e.jsxs(n.h3,{id:"protocol-difference-from-useophydpvsocket",children:["Protocol difference from ",e.jsx(n.code,{children:"useOphydPVSocket"})]}),`
`,e.jsxs(n.p,{children:["Subscribe message uses ",e.jsx(n.code,{children:"device"})," instead of ",e.jsx(n.code,{children:"pv"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{ "action": "subscribe", "device": "motor1" }
`})}),`
`,e.jsx(n.p,{children:"Set-value message:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{ "action": "set", "device": "motor1", "value": 10.0 }
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"usesimophydpvsocket",children:e.jsx(n.code,{children:"useSimOphydPVSocket"})}),`
`,e.jsxs(n.p,{children:["A drop-in simulation replacement for ",e.jsx(n.code,{children:"useOphydPVSocket"})," that requires ",e.jsx(n.strong,{children:"no backend"}),". Useful for development, testing, and Storybook stories."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useSimOphydPVSocket } from '@blueskyproject/finch';

function DevicePanel() {
  const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
    useSimOphydPVSocket(['sineSignal', 'noisySignal', 'motor1']);

  return (
    <div>
      <p>Sine: {devices['sineSignal']?.value}</p>
      <p>Noisy: {devices['noisySignal']?.value}</p>
      <p>Motor: {devices['motor1']?.value}</p>
      <button onClick={() => handleSetValueRequest('motor1', 42)}>Set motor to 42</button>
    </div>
  );
}
`})}),`
`,e.jsx(n.h3,{id:"special-device-names",children:"Special device names"}),`
`,e.jsxs(n.p,{children:[`| Name | Behavior |
|---|---|
| `,e.jsx(n.code,{children:'"sineSignal"'}),` | Animated sine wave value, updates continuously |
| `,e.jsx(n.code,{children:'"noisySignal"'}),` | Random noise value, updates continuously |
| Any other name | Static simulated device; value responds to `,e.jsx(n.code,{children:"handleSetValueRequest"})," |"]}),`
`,e.jsx(n.h3,{id:"parameters-and-return-value",children:"Parameters and return value"}),`
`,e.jsxs(n.p,{children:["Identical to ",e.jsx(n.code,{children:"useOphydPVSocket"}),". The ",e.jsx(n.code,{children:"wsUrl"})," parameter is accepted but ignored — no real connection is made."]}),`
`,e.jsx(n.h3,{id:"live-demo-no-backend-required",children:"Live demo (no backend required)"}),`
`,e.jsx("div",{style:{padding:"1rem",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0"},children:e.jsx(L,{})}),`
`,e.jsx(n.hr,{}),`
`,e.jsxs(n.h2,{id:"useophydsocket--deprecated",children:[e.jsx(n.code,{children:"useOphydSocket"})," — deprecated"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"useOphydSocket"})," is a thin backwards-compatibility alias that delegates directly to ",e.jsx(n.code,{children:"useOphydPVSocket"}),". It has the same signature and return value."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`// Prefer this:
import { useOphydPVSocket } from '@blueskyproject/finch';

// Instead of:
import { useOphydSocket } from '@blueskyproject/finch'; // deprecated
`})}),`
`,e.jsxs(n.p,{children:["Both are exported from ",e.jsx(n.code,{children:"@blueskyproject/finch"})," for now. Use ",e.jsx(n.code,{children:"useOphydPVSocket"})," in new code."]})]})}function re(s={}){const{wrapper:n}={...V(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(P,{...s})}):P(s)}export{re as default};
