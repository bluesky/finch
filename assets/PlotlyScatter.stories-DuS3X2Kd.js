import{j as d}from"./jsx-runtime-Cf8x2fCZ.js";import{R as E,r}from"./index-BlmOqGMO.js";import{P as L}from"./react-plotly-DHQ8Bxuu.js";import{c as R}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";const _=[{x:[1,2,3],y:[2,6,3],type:"scatter",mode:"lines+markers",marker:{color:"red"}}],u={size:16,color:"#082f49"},P=E.memo(function({data:w=_,title:T,xAxisTitle:s,yAxisTitle:o,xAxisRange:i,yAxisRange:l,xAxisLayout:v,yAxisLayout:A,className:S,...k}){const a=r.useRef(null),[n,q]=r.useState({width:0,height:0});return r.useEffect(()=>{const m=new ResizeObserver(c=>{if(c[0]){const{width:N,height:D}=c[0].contentRect;q({width:N,height:D})}});return a.current&&m.observe(a.current),()=>m.disconnect()},[]),d.jsx("div",{className:R("max-h-full h-96 rounded-lg overflow-hidden text-slate-700",S),ref:a,...k,children:d.jsx(L,{data:w,layout:{title:T,plot_bgcolor:"#E2E8F0",paper_bgcolor:"#E2E8F0",xaxis:{title:{text:s,font:u},range:i||void 0,...v},yaxis:{title:{text:o,font:u},range:l||void 0,...A},autosize:!0,width:n.width,height:n.height,margin:{l:o?60:50,r:30,t:30,b:s?70:30}},config:{responsive:!0}})})});P.__docgenInfo={description:"",methods:[],displayName:"PlotlyScatter",props:{data:{required:!1,tsType:{name:"PlotParams['data']",raw:"PlotParams['data']"},description:"Plotly trace array to render. Defaults to a sample line+marker dataset.",defaultValue:{value:`[
  {
    x: [1, 2, 3],
    y: [2, 6, 3],
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'red' },
  },
]`,computed:!1}},title:{required:!1,tsType:{name:"string"},description:"Plot title displayed above the chart."},xAxisTitle:{required:!1,tsType:{name:"string"},description:"Label for the x axis. Increases bottom margin when set."},yAxisTitle:{required:!1,tsType:{name:"string"},description:"Label for the y axis. Increases left margin when set."},xAxisRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:"Fixed [min, max] range for the x axis. When omitted Plotly auto-scales."},yAxisRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:"Fixed [min, max] range for the y axis. When omitted Plotly auto-scales."},xAxisLayout:{required:!1,tsType:{name:"Partial",elements:[{name:"LayoutAxis"}],raw:"Partial<LayoutAxis>"},description:"Additional Plotly xaxis layout overrides merged on top of defaults."},yAxisLayout:{required:!1,tsType:{name:"Partial",elements:[{name:"LayoutAxis"}],raw:"Partial<LayoutAxis>"},description:"Additional Plotly yaxis layout overrides merged on top of defaults."},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the root container div."}}};const M={title:"General Components/PlotlyScatter",component:P,tags:["autodocs"],parameters:{layout:"fullscreen"}},b=[{x:[1,2,3,4],y:[2,6,3,90],type:"scatter",mode:"lines+markers",marker:{color:"blue"}},{x:[1,2,3,4],y:[90,70,60,50],type:"scatter",mode:"lines+markers",marker:{color:"red"}}],e={args:{className:"h-96 w-full",data:b,xAxisTitle:"my title",yAxisTitle:"my y axis title",title:"My Scatter"}},t={args:{className:"h-96 w-full",data:b}};var p,y,f;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    className: "h-96 w-full",
    data: sampleData,
    xAxisTitle: 'my title',
    yAxisTitle: 'my y axis title',
    title: 'My Scatter'
  }
}`,...(f=(y=e.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var x,h,g;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    className: "h-96 w-full",
    data: sampleData
  }
}`,...(g=(h=t.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};const W=["Default","NoTitles"];export{e as Default,t as NoTitles,W as __namedExportsOrder,M as default};
