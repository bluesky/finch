import{j as c}from"./jsx-runtime-Cf8x2fCZ.js";import{T as n}from"./TableDeviceControllerWithRBV-CgYMBkzy.js";import{u as t}from"./useOphydPVSocket-Dd5zlKo0.js";import{w as d,c as R}from"./beamstopBeamline-Ddl3iiSk.js";import"./index-BlmOqGMO.js";import"./index-yBjzXJbu.js";import"./Lock.es-BnV14fst.js";import"./IconBase.es-N0ZVnnNC.js";import"./ControllerRelativeMove-Bj7BvnUb.js";import"./utils-DuMXYCiK.js";import"./InputNumber-CJAomWwQ.js";import"./SelectDropdown-DQMB8TM5.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";import"./floating-ui.dom-rnI921Cb.js";import"./OphydTransportContext-C-T3dDhJ.js";import"./apiUtils-0_WGNbDr.js";const L={title:"Ophyd Components/TableDeviceControllerWithRBV",component:n,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Tabular multi-device controller with a separate readback column. It takes a\n`devices` map (setpoints) and a `devicesRBV` map (readbacks) plus the move /\nlock / expand callbacks."}}},decorators:[d(R)]},_=["bl531_xps2:beamstop_x_mm","bl531_xps2:beamstop_y_mm"],u=["bl531_xps2:beamstop_x_mm.RBV","bl531_xps2:beamstop_y_mm.RBV"];function b(){const{devices:l,handleSetValueRequest:p,toggleDeviceLock:m,toggleExpand:i}=t(_),{devices:r}=t(u);return c.jsx(n,{devices:l,devicesRBV:r,handleSetValueRequest:p,toggleDeviceLock:m,toggleExpand:i,collapsibleRelativeMove:!0})}const e={render:()=>c.jsx(b,{}),parameters:{docs:{source:{code:`const MOTORS = ['bl531_xps2:beamstop_x_mm', 'bl531_xps2:beamstop_y_mm'];
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
}`,...(a=(s=e.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};const P=["Default"];export{e as Default,P as __namedExportsOrder,L as default};
