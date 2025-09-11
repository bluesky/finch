import{j as u}from"./jsx-runtime-Cf8x2fCZ.js";import{r as a}from"./index-BlmOqGMO.js";import{P as j}from"./react-plotly-DHQ8Bxuu.js";import{c as A}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";const z=[{x:[1,2,3],y:[2,6,3],type:"scatter",mode:"lines+markers",marker:{color:"red"}}],p={size:16,color:"#7f7f7f"};function b({data:w=z,title:k,xAxisTitle:s,yAxisTitle:n,xAxisRange:i,yAxisRange:o,xAxisLayout:q,yAxisLayout:v,className:N}){const r=a.useRef(null),[l,P]=a.useState({width:0,height:0});return a.useEffect(()=>{const m=new ResizeObserver(c=>{if(c[0]){const{width:S,height:D}=c[0].contentRect;P({width:S,height:D})}});return r.current&&m.observe(r.current),()=>m.disconnect()},[]),u.jsx("div",{className:A("pb-4 max-h-full",N),ref:r,children:u.jsx(j,{data:w,layout:{title:k,xaxis:{title:{text:s,font:p},range:i||void 0,...q},yaxis:{title:{text:n,font:p},range:o||void 0,...v},autosize:!0,width:l.width,height:l.height,margin:{l:n?60:50,r:30,t:30,b:s?70:30}},config:{responsive:!0}})})}b.__docgenInfo={description:"",methods:[],displayName:"PlotlyScatter",props:{data:{required:!1,tsType:{name:"PlotParams['data']",raw:"PlotParams['data']"},description:"",defaultValue:{value:`[
  {
    x: [1, 2, 3],
    y: [2, 6, 3],
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'red' },
  },
]`,computed:!1}},title:{required:!1,tsType:{name:"string"},description:""},xAxisTitle:{required:!1,tsType:{name:"string"},description:""},yAxisTitle:{required:!1,tsType:{name:"string"},description:""},xAxisRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yAxisRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},xAxisLayout:{required:!1,tsType:{name:"signature",type:"object",raw:"{[key: string]: any}",signature:{properties:[{key:{name:"string"},value:{name:"any",required:!0}}]}},description:""},yAxisLayout:{required:!1,tsType:{name:"signature",type:"object",raw:"{[key: string]: any}",signature:{properties:[{key:{name:"string"},value:{name:"any",required:!0}}]}},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const L={title:"General Components/PlotlyScatter",component:b,tags:["autodocs"],parameters:{layout:"fullscreen"}},T=[{x:[1,2,3,4],y:[2,6,3,90],type:"scatter",mode:"lines+markers",marker:{color:"blue"}},{x:[1,2,3,4],y:[90,70,60,50],type:"scatter",mode:"lines+markers",marker:{color:"red"}}],e={args:{className:"h-96 w-full",data:T,xAxisTitle:"my title",yAxisTitle:"my y axis title",title:"My Scatter"}},t={args:{className:"h-96 w-full",data:T}};var d,y,f;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    className: "h-96 w-full",
    data: sampleData,
    xAxisTitle: 'my title',
    yAxisTitle: 'my y axis title',
    title: 'My Scatter'
  }
}`,...(f=(y=e.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var g,x,h;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    className: "h-96 w-full",
    data: sampleData
  }
}`,...(h=(x=t.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};const M=["Default","NoTitles"];export{e as Default,t as NoTitles,M as __namedExportsOrder,L as default};
