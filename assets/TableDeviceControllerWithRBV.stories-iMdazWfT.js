import{j as c}from"./jsx-runtime-Cf8x2fCZ.js";import{T as n}from"./TableDeviceControllerWithRBV-X27kPfIa.js";import{u as t}from"./useOphydPVSocket-B9k9liOt.js";import{w as d}from"./decorator-Ci4DFhfB.js";import{c as R}from"./beamstopBeamline-C3y76WSb.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./Lock.es-BnV14fst.js";import"./IconBase.es-N0ZVnnNC.js";import"./ControllerRelativeMove-Bj7BvnUb.js";import"./utils-DuMXYCiK.js";import"./InputNumber-CJAomWwQ.js";import"./SelectDropdown-C7dlH9EC.js";import"./index-DHavueZW.js";import"./index-fNjTmf9T.js";import"./floating-ui.dom-rnI921Cb.js";import"./OphydTransportContext-CyIcey7p.js";import"./apiUtils-CrwNbuDx.js";import"./FinchConfigProvider-CTKpkgTV.js";import"./OphydTransportProvider-_ZAi0Elw.js";import"./createOphydSim-DclSWsyt.js";import"./noise-XnIOHifa.js";import"./detector-CYqPFYg_.js";const z={title:"Ophyd Components/TableDeviceControllerWithRBV",component:n,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Tabular multi-device controller with a separate readback column. It takes a\n`devices` map (setpoints) and a `devicesRBV` map (readbacks) plus the move /\nlock / expand callbacks."}}},decorators:[d(R)]},_=["bl531_xps2:beamstop_x_mm","bl531_xps2:beamstop_y_mm"],u=["bl531_xps2:beamstop_x_mm.RBV","bl531_xps2:beamstop_y_mm.RBV"];function b(){const{devices:p,handleSetValueRequest:m,toggleDeviceLock:l,toggleExpand:i}=t(_),{devices:r}=t(u);return c.jsx(n,{devices:p,devicesRBV:r,handleSetValueRequest:m,toggleDeviceLock:l,toggleExpand:i,collapsibleRelativeMove:!0})}const e={render:()=>c.jsx(b,{}),parameters:{docs:{source:{code:`const MOTORS = ['bl531_xps2:beamstop_x_mm', 'bl531_xps2:beamstop_y_mm'];
const MOTORS_RBV = ['bl531_xps2:beamstop_x_mm.RBV', 'bl531_xps2:beamstop_y_mm.RBV'];

const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
    useOphydPVSocket(MOTORS);
const { devices: devicesRBV } = useOphydPVSocket(MOTORS_RBV);

<TableDeviceControllerWithRBV
    devices={devices}
    devicesRBV={devicesRBV}
    handleSetValueRequest={handleSetValueRequest}
    toggleDeviceLock={toggleDeviceLock}
    toggleExpand={toggleExpand}
    collapsibleRelativeMove
/>`,language:"tsx"}}}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: () => <ConnectedTable />,
  parameters: {
    docs: {
      source: {
        code: \`const MOTORS = ['bl531_xps2:beamstop_x_mm', 'bl531_xps2:beamstop_y_mm'];
const MOTORS_RBV = ['bl531_xps2:beamstop_x_mm.RBV', 'bl531_xps2:beamstop_y_mm.RBV'];

const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } =
    useOphydPVSocket(MOTORS);
const { devices: devicesRBV } = useOphydPVSocket(MOTORS_RBV);

<TableDeviceControllerWithRBV
    devices={devices}
    devicesRBV={devicesRBV}
    handleSetValueRequest={handleSetValueRequest}
    toggleDeviceLock={toggleDeviceLock}
    toggleExpand={toggleExpand}
    collapsibleRelativeMove
/>\`,
        language: 'tsx'
      }
    }
  }
}`,...(a=(s=e.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};const A=["Default"];export{e as Default,A as __namedExportsOrder,z as default};
