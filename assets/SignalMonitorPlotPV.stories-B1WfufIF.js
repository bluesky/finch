import{S as i}from"./SignalMonitorPlotPV-BSbok1LI.js";import{w as a}from"./decorator-Ci4DFhfB.js";import{c as s}from"./beamstopBeamline-C3y76WSb.js";import"./jsx-runtime-Cf8x2fCZ.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./useOphydPVSocket-B9k9liOt.js";import"./OphydTransportContext-CyIcey7p.js";import"./apiUtils-CrwNbuDx.js";import"./FinchConfigProvider-CTKpkgTV.js";import"./SignalMonitorPlotDevice-JfPwOJoD.js";import"./PlotlyScatter-sWkV0dST.js";import"./plot-BxGSPhZb.js";import"./utils-DuMXYCiK.js";import"./plotGenerators-BwhqB7LR.js";import"./OphydTransportProvider-_ZAi0Elw.js";import"./createOphydSim-DclSWsyt.js";import"./noise-XnIOHifa.js";import"./detector-CYqPFYg_.js";const O={title:"Ophyd Components/SignalMonitorPlotPV",component:i,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"Live strip-chart for a single EPICS PV. `SignalMonitorPlotPV` takes a `pv`\nname, subscribes with `useOphydPVSocket`, and plots each new value on a\nrolling time window."}}},decorators:[a(s)]},t={args:{pv:"bl201-beamstop:current",className:"h-96 w-[640px]",numVisiblePoints:200,tickTextIntervalSeconds:30}};var o,r,e;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    pv: 'bl201-beamstop:current',
    className: 'h-96 w-[640px]',
    numVisiblePoints: 200,
    tickTextIntervalSeconds: 30
  }
}`,...(e=(r=t.parameters)==null?void 0:r.docs)==null?void 0:e.source}}};const I=["Default"];export{t as Default,I as __namedExportsOrder,O as default};
