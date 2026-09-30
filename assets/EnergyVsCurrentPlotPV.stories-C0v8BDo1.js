import{j as m}from"./jsx-runtime-Cf8x2fCZ.js";import{E as s}from"./EnergyVsCurrentPlotPV-4t9F5eKn.js";import{w as n}from"./decorator-Ci4DFhfB.js";import{c as a}from"./beamstopBeamline-C3y76WSb.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./PlotlyScatter-sWkV0dST.js";import"./plot-BxGSPhZb.js";import"./utils-DuMXYCiK.js";import"./useOphydPVSocket-B9k9liOt.js";import"./OphydTransportContext-CyIcey7p.js";import"./apiUtils-CrwNbuDx.js";import"./FinchConfigProvider-CTKpkgTV.js";import"./plotGenerators-BwhqB7LR.js";import"./OphydTransportProvider-_ZAi0Elw.js";import"./createOphydSim-DclSWsyt.js";import"./noise-XnIOHifa.js";import"./detector-CYqPFYg_.js";const E={title:"Ophyd Components/EnergyVsCurrentPlotPV",component:s,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'"Beam Energy vs Beamstop Current" plot. It overlays a live *measured* trace\n(samples accumulated as the energy PV sweeps) against the noise-free *expected*\ncurve from `beamstopCurrentModel` at the current beamstop position. All four\ninputs are supplied as PV names and read with `useOphydPVSocket`.\n\nBacked by the `beamstopBeamline` sim. To see the measured points populate,\nopen the **Beamstop** story (or drive `bl531:mono_energy_eV`) so the energy\nchanges over time; here the expected curve is shown at the default position.'}}},decorators:[n(a)]},e={render:()=>m.jsx(s,{energyPv:"bl531:mono_energy_eV",currentPv:"bl201-beamstop:current",beamstopXRbvPv:"bl531_xps2:beamstop_x_mm.RBV",beamstopYRbvPv:"bl531_xps2:beamstop_y_mm.RBV",className:"w-[720px]"}),parameters:{docs:{source:{code:`<EnergyVsCurrentPlotPV
    energyPv="bl531:mono_energy_eV"
    currentPv="bl201-beamstop:current"
    beamstopXRbvPv="bl531_xps2:beamstop_x_mm.RBV"
    beamstopYRbvPv="bl531_xps2:beamstop_y_mm.RBV"
/>`,language:"tsx"}}}};var t,r,o;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: () => <EnergyVsCurrentPlotPV energyPv="bl531:mono_energy_eV" currentPv="bl201-beamstop:current" beamstopXRbvPv="bl531_xps2:beamstop_x_mm.RBV" beamstopYRbvPv="bl531_xps2:beamstop_y_mm.RBV" className="w-[720px]" />,
  parameters: {
    docs: {
      source: {
        code: \`<EnergyVsCurrentPlotPV
    energyPv="bl531:mono_energy_eV"
    currentPv="bl201-beamstop:current"
    beamstopXRbvPv="bl531_xps2:beamstop_x_mm.RBV"
    beamstopYRbvPv="bl531_xps2:beamstop_y_mm.RBV"
/>\`,
        language: 'tsx'
      }
    }
  }
}`,...(o=(r=e.parameters)==null?void 0:r.docs)==null?void 0:o.source}}};const C=["Default"];export{e as Default,C as __namedExportsOrder,E as default};
