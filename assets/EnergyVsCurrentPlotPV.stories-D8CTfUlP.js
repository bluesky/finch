import{j as n}from"./jsx-runtime-Cf8x2fCZ.js";import{E as s}from"./EnergyVsCurrentPlotPV-3sCThVFT.js";import{w as m,c as a}from"./beamstopBeamline-Ddl3iiSk.js";import"./index-BlmOqGMO.js";import"./index-yBjzXJbu.js";import"./PlotlyScatter-BCz9pg11.js";import"./react-plotly-DHQ8Bxuu.js";import"./utils-DuMXYCiK.js";import"./useOphydPVSocket-Dd5zlKo0.js";import"./OphydTransportContext-C-T3dDhJ.js";import"./apiUtils-0_WGNbDr.js";import"./plotGenerators-BwhqB7LR.js";const g={title:"Ophyd Components/EnergyVsCurrentPlotPV",component:s,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'"Beam Energy vs Beamstop Current" plot. It overlays a live *measured* trace\n(samples accumulated as the energy PV sweeps) against the noise-free *expected*\ncurve from `beamstopCurrentModel` at the current beamstop position. All four\ninputs are supplied as PV names and read with `useOphydPVSocket`.\n\nBacked by the `beamstopBeamline` sim. To see the measured points populate,\nopen the **Beamstop** story (or drive `bl531:mono_energy_eV`) so the energy\nchanges over time; here the expected curve is shown at the default position.'}}},decorators:[m(a)]},e={render:()=>n.jsx(s,{energyPv:"bl531:mono_energy_eV",currentPv:"bl201-beamstop:current",beamstopXRbvPv:"bl531_xps2:beamstop_x_mm.RBV",beamstopYRbvPv:"bl531_xps2:beamstop_y_mm.RBV",className:"w-[720px]"}),parameters:{docs:{source:{code:`<EnergyVsCurrentPlotPV
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
}`,...(o=(r=e.parameters)==null?void 0:r.docs)==null?void 0:o.source}}};const x=["Default"];export{e as Default,x as __namedExportsOrder,g as default};
