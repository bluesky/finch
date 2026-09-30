import{j as r}from"./jsx-runtime-Cf8x2fCZ.js";import{D as c}from"./DeviceControllerBox-JiOhgqdA.js";import{u as d}from"./useOphydPVSocket-B9k9liOt.js";import{w as l}from"./decorator-Ci4DFhfB.js";import{d as m}from"./defaultBeamline-CDaBkxpt.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./utils-DuMXYCiK.js";import"./Lock.es-BnV14fst.js";import"./IconBase.es-N0ZVnnNC.js";import"./Question.es-CT_as6BQ.js";import"./InputNumber-CJAomWwQ.js";import"./Button-BAZZxb_P.js";import"./icons-DhXjNaA5.js";import"./OphydTransportContext-CyIcey7p.js";import"./apiUtils-CrwNbuDx.js";import"./FinchConfigProvider-CTKpkgTV.js";import"./OphydTransportProvider-_ZAi0Elw.js";import"./createOphydSim-DclSWsyt.js";import"./noise-XnIOHifa.js";const P={title:"Ophyd Components/DeviceControllerBox",component:c,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"Single-device controller card (absolute + relative moves, lock). It is a plain\npresentational component: you feed it a `device` (and optional readback\n`deviceRBV`) plus the `handleSetValueRequest` / `handleLockClick` callbacks.\n\nYou obtain those from `useOphydPVSocket`, the same hook used against a real\nIOC. Below, the `defaultBeamline` sim serves `IOC:m1` / `IOC:m1.RBV`, so\nmoving the box animates the readback live. The sim providers are applied as a\ndecorator and are omitted from the sample code — the code shows exactly how\nyou would wire the component to a PV in your own app."}}},decorators:[l(m)]};function p(){const{devices:o,handleSetValueRequest:s,toggleDeviceLock:i}=d(["IOC:m1","IOC:m1.RBV"]);return r.jsx(c,{device:o["IOC:m1"],deviceRBV:o["IOC:m1.RBV"],handleSetValueRequest:s,handleLockClick:i})}const e={render:()=>r.jsx(p,{}),parameters:{docs:{source:{code:`const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket([
    'IOC:m1',
    'IOC:m1.RBV',
]);

<DeviceControllerBox
    device={devices['IOC:m1']}
    deviceRBV={devices['IOC:m1.RBV']}
    handleSetValueRequest={handleSetValueRequest}
    handleLockClick={toggleDeviceLock}
/>`,language:"tsx"}}}};var t,a,n;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: () => <ConnectedBox />,
  parameters: {
    docs: {
      source: {
        code: \`const { devices, handleSetValueRequest, toggleDeviceLock } = useOphydPVSocket([
    'IOC:m1',
    'IOC:m1.RBV',
]);

<DeviceControllerBox
    device={devices['IOC:m1']}
    deviceRBV={devices['IOC:m1.RBV']}
    handleSetValueRequest={handleSetValueRequest}
    handleLockClick={toggleDeviceLock}
/>\`,
        language: 'tsx'
      }
    }
  }
}`,...(n=(a=e.parameters)==null?void 0:a.docs)==null?void 0:n.source}}};const j=["Default"];export{e as Default,j as __namedExportsOrder,P as default};
