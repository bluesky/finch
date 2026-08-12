import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{r as o}from"./index-BlmOqGMO.js";import{S as H}from"./SignalMonitorPlotPV-4AVWYMhV.js";import{D as g}from"./DeviceControllerBox-JiOhgqdA.js";import{E as S}from"./EnergyVsCurrentPlotPV-3sCThVFT.js";import{u as E}from"./useOphydPVSocket-Dd5zlKo0.js";import{B as I}from"./Button-BAZZxb_P.js";import{d as B}from"./icons-DhXjNaA5.js";import{w as D,c as W}from"./beamstopBeamline-Ddl3iiSk.js";import"./index-yBjzXJbu.js";import"./SignalMonitorPlotDevice-qdx2aVVF.js";import"./PlotlyScatter-BCz9pg11.js";import"./react-plotly-DHQ8Bxuu.js";import"./utils-DuMXYCiK.js";import"./plotGenerators-BwhqB7LR.js";import"./Lock.es-BnV14fst.js";import"./IconBase.es-N0ZVnnNC.js";import"./Question.es-CT_as6BQ.js";import"./InputNumber-CJAomWwQ.js";import"./OphydTransportContext-C-T3dDhJ.js";import"./apiUtils-0_WGNbDr.js";function v({beamstopXName:l,beamstopYName:r,beamstopCurrentName:n,beamstopEnergyName:s,beamstopXIcon:w=B.beamstopX,beamstopYIcon:M=B.beamstopY,beamstopXTitle:j,beamstopYTitle:P,beamstopEnergyTitle:T="Beam Energy",enableBestOption:O,stackVertical:a=!0}){var V;const u=o.useMemo(()=>l+".RBV",[l]),d=o.useMemo(()=>r+".RBV",[r]),i=o.useMemo(()=>s?s+".RBV":void 0,[s]),X=o.useMemo(()=>[l,r,u,d,n,...s&&i?[s,i]:[]],[l,r,u,d,n,s,i]),{devices:t,handleSetValueRequest:c,toggleDeviceLock:L}=E(X),[p,Y]=o.useState(null),[f,Z]=o.useState(null),[x,R]=o.useState(null),q=()=>{f!==null&&c(l,f),x!==null&&c(r,x)};return o.useEffect(()=>{const m=t[n],h=t[l],y=t[r];m&&m.value!==null&&typeof m.value=="number"&&(p===null||Math.abs(m.value)>Math.abs(p))&&(Y(m.value),h&&h.value!==null&&typeof h.value=="number"&&Z(h.value),y&&y.value!==null&&typeof y.value=="number"&&R(y.value))},[t,n,l,r,p]),e.jsxs("section",{className:`w-full h-full ${a?"flex-col":"max-w-[1200px] flex-wrap items-center justify-center"} flex`,children:[e.jsxs("article",{className:`${a?"w-full h-1/2":"w-1/2 h-full justify-start"}   flex flex-col p-8 min-w-96`,children:[e.jsxs("span",{className:"text-4xl flex justify-start space-x-2 ",children:[e.jsx("p",{children:" Beamstop Current: "}),e.jsxs("p",{children:[t[n]&&Number(t[n].value).toPrecision(4)," ",t[n]&&((V=t[n].units)==null?void 0:V.slice(0,3))]})]}),e.jsx(H,{pv:n,className:`${a?"h-full":"h-fit"} min-w-96`,numVisiblePoints:200,tickTextIntervalSeconds:30}),O&&e.jsxs(e.Fragment,{children:[e.jsxs("p",{children:["Best Beamstop Current Value:"," ",p?p.toPrecision(5):"N/A"," ",t[n]&&t[n].units]}),e.jsxs("p",{children:["Best Beamstop X value: ",f?f.toPrecision(4):"N/A"," ",t[l]&&t[l].units]}),e.jsxs("p",{children:["Best Beamstop Y value: ",x?x.toPrecision(4):"N/A"," ",t[r]&&t[r].units]}),e.jsx("div",{className:"flex justify-center items-center py-8",children:e.jsx(I,{cb:q,text:"Go To Best"})})]})]}),e.jsxs("article",{className:`${a?"w-full pt-4 max-h-1/2 flex flex-row justify-center gap-8":"w-1/2 h-full flex flex-col items-center justify-start gap-6"} `,children:[e.jsx(g,{title:j,svgIcon:w,device:t[l],deviceRBV:t[u],handleLockClick:L,handleSetValueRequest:c}),e.jsx(g,{title:P,svgIcon:M,device:t[r],deviceRBV:t[d],handleLockClick:L,handleSetValueRequest:c}),s&&e.jsx(g,{title:T,device:t[s],deviceRBV:i?t[i]:void 0,handleLockClick:L,handleSetValueRequest:c})]}),s&&e.jsx("article",{className:"w-full flex flex-col p-8 min-w-96",children:e.jsx(S,{energyPv:s,currentPv:n,beamstopXRbvPv:u,beamstopYRbvPv:d,className:"min-w-96"})})]})}try{v.displayName="Beamstop",v.__docgenInfo={description:"",displayName:"Beamstop",props:{beamstopXName:{defaultValue:null,description:"",name:"beamstopXName",required:!0,type:{name:"string"}},beamstopYName:{defaultValue:null,description:"",name:"beamstopYName",required:!0,type:{name:"string"}},beamstopCurrentName:{defaultValue:null,description:"",name:"beamstopCurrentName",required:!0,type:{name:"string"}},beamstopEnergyName:{defaultValue:null,description:`Optional writable beam-energy PV. When provided, an energy control and a
live Energy-vs-Current plot are rendered. Selecting an energy shifts the
beam (via the DCM Bragg angle), changing the diode current.`,name:"beamstopEnergyName",required:!1,type:{name:"string"}},beamstopXIcon:{defaultValue:{value:`(
        <svg viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_638_121)">
                <path
                    d="M30 6.12L18.9474 9.24M30 6.12L25.5789 3L16 6.12M30 6.12V38.88L18.9474 42M18.9474 9.24L16 6.12M18.9474 9.24V42M16 6.12V38.88L18.9474 42"
                    stroke="currentColor"
                />
                <circle cx="1" cy="1" r="1" transform="matrix(-1 0 0 1 26 22)" fill="#FF5656" />
                <path d="M2.10795 27.4915V28.2727H5.28977V27.4915H2.10795Z" fill="currentColor" />
                <path
                    d="M43.1023 20.5028V15.8153H42.3068V20.5028H43.1023ZM45.0483 18.5568V17.7614H40.3608V18.5568H45.0483Z"
                    fill="currentColor"
                />
                <path
                    d="M7.75718 27.4371C7.51579 27.303 7.42881 26.9986 7.56292 26.7572L9.74831 22.8235C9.88242 22.5821 10.1868 22.4951 10.4282 22.6292C10.6696 22.7633 10.7566 23.0677 10.6225 23.3091L8.6799 26.8057L12.1765 28.7483C12.4179 28.8824 12.5049 29.1868 12.3708 29.4282C12.2367 29.6696 11.9323 29.7566 11.6909 29.6225L7.75718 27.4371ZM15 25L15.1374 25.4808L8.13736 27.4808L8 27L7.86264 26.5192L14.8626 24.5192L15 25Z"
                    fill="currentColor"
                />
                <path
                    d="M39.2428 18.5629C39.4842 18.697 39.5712 19.0014 39.4371 19.2428L37.2517 23.1765C37.1176 23.4179 36.8132 23.5049 36.5718 23.3708C36.3304 23.2367 36.2434 22.9323 36.3775 22.6909L38.3201 19.1943L34.8235 17.2517C34.5821 17.1176 34.4951 16.8132 34.6292 16.5718C34.7633 16.3304 35.0677 16.2434 35.3091 16.3775L39.2428 18.5629ZM32 21L31.8626 20.5192L38.8626 18.5192L39 19L39.1374 19.4808L32.1374 21.4808L32 21Z"
                    fill="currentColor"
                />
                <line
                    x1="43.8328"
                    y1="37.1858"
                    x2="33.8328"
                    y2="28.1858"
                    stroke="currentColor"
                    strokeOpacity="0.5"
                    strokeWidth="0.5"
                />
                <line
                    x1="43.8465"
                    y1="39.1973"
                    x2="34.8465"
                    y2="32.1973"
                    stroke="currentColor"
                    strokeOpacity="0.5"
                    strokeWidth="0.5"
                />
                <line
                    x1="43.874"
                    y1="40.2159"
                    x2="31.874"
                    y2="33.2159"
                    stroke="currentColor"
                    strokeOpacity="0.5"
                    strokeWidth="0.5"
                />
            </g>
            <defs>
                <clipPath id="clip0_638_121">
                    <rect width="45" height="45" fill="white" transform="matrix(-1 0 0 1 45 0)" />
                </clipPath>
            </defs>
        </svg>
    )`},description:"",name:"beamstopXIcon",required:!1,type:{name:"Element"}},beamstopYIcon:{defaultValue:{value:`(
        <svg viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_638_147)">
                <path
                    d="M30 6.12L18.9474 9.24M30 6.12L25.5789 3L16 6.12M30 6.12V38.88L18.9474 42M18.9474 9.24L16 6.12M18.9474 9.24V42M16 6.12V38.88L18.9474 42"
                    stroke="currentColor"
                />
                <circle cx="1" cy="1" r="1" transform="matrix(-1 0 0 1 26 22)" fill="#FF5656" />
                <path d="M7.10795 3.49148V4.27273H10.2898V3.49148H7.10795Z" fill="currentColor" />
                <path
                    d="M9.10227 43.5028V38.8153H8.30682V43.5028H9.10227ZM11.0483 41.5568V40.7614H6.3608V41.5568H11.0483Z"
                    fill="currentColor"
                />
                <path
                    d="M9.35355 8.64645C9.15829 8.45118 8.84171 8.45118 8.64645 8.64645L5.46447 11.8284C5.2692 12.0237 5.2692 12.3403 5.46447 12.5355C5.65973 12.7308 5.97631 12.7308 6.17157 12.5355L9 9.70711L11.8284 12.5355C12.0237 12.7308 12.3403 12.7308 12.5355 12.5355C12.7308 12.3403 12.7308 12.0237 12.5355 11.8284L9.35355 8.64645ZM9 18L9.5 18L9.5 9L9 9L8.5 9L8.5 18L9 18Z"
                    fill="currentColor"
                />
                <path
                    d="M8.64645 35.3536C8.84171 35.5488 9.15829 35.5488 9.35355 35.3536L12.5355 32.1716C12.7308 31.9763 12.7308 31.6597 12.5355 31.4645C12.3403 31.2692 12.0237 31.2692 11.8284 31.4645L9 34.2929L6.17157 31.4645C5.97631 31.2692 5.65973 31.2692 5.46447 31.4645C5.2692 31.6597 5.2692 31.9763 5.46447 32.1716L8.64645 35.3536ZM9 28L8.5 28L8.5 35L9 35L9.5 35L9.5 28L9 28Z"
                    fill="currentColor"
                />
                <line
                    x1="43.8328"
                    y1="37.1858"
                    x2="33.8328"
                    y2="28.1858"
                    stroke="currentColor"
                    strokeOpacity="0.5"
                    strokeWidth="0.5"
                />
                <line
                    x1="43.8465"
                    y1="39.1973"
                    x2="34.8465"
                    y2="32.1973"
                    stroke="currentColor"
                    strokeOpacity="0.5"
                    strokeWidth="0.5"
                />
                <line
                    x1="43.874"
                    y1="40.2159"
                    x2="31.874"
                    y2="33.2159"
                    stroke="currentColor"
                    strokeOpacity="0.5"
                    strokeWidth="0.5"
                />
            </g>
            <defs>
                <clipPath id="clip0_638_147">
                    <rect width="45" height="45" fill="white" transform="matrix(-1 0 0 1 45 0)" />
                </clipPath>
            </defs>
        </svg>
    )`},description:"",name:"beamstopYIcon",required:!1,type:{name:"Element"}},beamstopXTitle:{defaultValue:null,description:"",name:"beamstopXTitle",required:!1,type:{name:"string"}},beamstopYTitle:{defaultValue:null,description:"",name:"beamstopYTitle",required:!1,type:{name:"string"}},beamstopEnergyTitle:{defaultValue:{value:"Beam Energy"},description:"",name:"beamstopEnergyTitle",required:!1,type:{name:"string"}},enableBestOption:{defaultValue:null,description:"",name:"enableBestOption",required:!1,type:{name:"boolean"}},stackVertical:{defaultValue:{value:"true"},description:"",name:"stackVertical",required:!1,type:{name:"boolean"}}}}}catch{}const me={title:"Ophyd Components/Beamstop",component:v,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:`Full beamstop-alignment feature: a live diode-current trend, X/Y motor
controllers, an optional beam-energy control, and an Energy-vs-Current plot.
It takes the PV names of its devices as props and wires them with
\`useOphydPVSocket\`.



Try moving the beamstop motors to find the peak current, then click "Go To Best" to return to that position.`}}},decorators:[D(W)]},b={render:()=>e.jsx("div",{className:"h-fit w-full p-4",children:e.jsx(v,{beamstopXName:"bl531_xps2:beamstop_x_mm",beamstopYName:"bl531_xps2:beamstop_y_mm",beamstopCurrentName:"bl201-beamstop:current",beamstopXTitle:"Beamstop X",beamstopYTitle:"Beamstop Y",enableBestOption:!0,stackVertical:!0})}),parameters:{docs:{source:{code:`<Beamstop
    beamstopXName="bl531_xps2:beamstop_x_mm"
    beamstopYName="bl531_xps2:beamstop_y_mm"
    beamstopCurrentName="bl201-beamstop:current"
    beamstopEnergyName="bl531:mono_energy_eV"
    beamstopXTitle="Beamstop X"
    beamstopYTitle="Beamstop Y"
    enableBestOption
    stackVertical={false}
/>`,language:"tsx"}}}};var _,C,k;b.parameters={...b.parameters,docs:{...(_=b.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="h-fit w-full p-4">
            <Beamstop beamstopXName="bl531_xps2:beamstop_x_mm" beamstopYName="bl531_xps2:beamstop_y_mm" beamstopCurrentName="bl201-beamstop:current" beamstopXTitle="Beamstop X" beamstopYTitle="Beamstop Y" enableBestOption stackVertical={true} />
        </div>,
  parameters: {
    docs: {
      source: {
        code: \`<Beamstop
    beamstopXName="bl531_xps2:beamstop_x_mm"
    beamstopYName="bl531_xps2:beamstop_y_mm"
    beamstopCurrentName="bl201-beamstop:current"
    beamstopEnergyName="bl531:mono_energy_eV"
    beamstopXTitle="Beamstop X"
    beamstopYTitle="Beamstop Y"
    enableBestOption
    stackVertical={false}
/>\`,
        language: 'tsx'
      }
    }
  }
}`,...(k=(C=b.parameters)==null?void 0:C.docs)==null?void 0:k.source}}};const ue=["Default"];export{b as Default,ue as __namedExportsOrder,me as default};
