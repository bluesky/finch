import{j as u}from"./jsx-runtime-BjgbQsUx.js";import{r as a}from"./index-BuYn5Wpo.js";import{P as D}from"./react-plotly-C0UHH7u6.js";import{c as j}from"./utils-CWs4mQ9_.js";import"./index-D2MAbzvX.js";const A=[{x:[1,2,3],y:[2,6,3],type:"scatter",mode:"lines+markers",marker:{color:"red"}}];function h({data:T=A,title:w,xAxisTitle:s,yAxisTitle:n,xAxisRange:i,yAxisRange:o,xAxisLayout:k,yAxisLayout:q,className:v}){const r=a.useRef(null),[l,N]=a.useState({width:0,height:0});return a.useEffect(()=>{const m=new ResizeObserver(c=>{if(c[0]){const{width:P,height:S}=c[0].contentRect;N({width:P,height:S})}});return r.current&&m.observe(r.current),()=>m.disconnect()},[]),u.jsx("div",{className:j("pb-4",v),ref:r,children:u.jsx(D,{data:T,layout:{title:w,xaxis:{title:s,range:i||void 0,...k},yaxis:{title:n,range:o||void 0,...q},autosize:!0,width:l.width,height:l.height,margin:{l:s?60:30,r:30,t:30,b:n?60:30}},config:{responsive:!0}})})}h.__docgenInfo={description:"",methods:[],displayName:"PlotlyScatter",props:{data:{required:!1,tsType:{name:"PlotParams['data']",raw:"PlotParams['data']"},description:"",defaultValue:{value:`[
  {
    x: [1, 2, 3],
    y: [2, 6, 3],
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'red' },
  },
]`,computed:!1}},title:{required:!1,tsType:{name:"string"},description:""},xAxisTitle:{required:!1,tsType:{name:"string"},description:""},yAxisTitle:{required:!1,tsType:{name:"string"},description:""},xAxisRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yAxisRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},xAxisLayout:{required:!1,tsType:{name:"signature",type:"object",raw:"{[key: string]: any}",signature:{properties:[{key:{name:"string"},value:{name:"any",required:!0}}]}},description:""},yAxisLayout:{required:!1,tsType:{name:"signature",type:"object",raw:"{[key: string]: any}",signature:{properties:[{key:{name:"string"},value:{name:"any",required:!0}}]}},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const C={title:"General Components/PlotlyScatter",component:h,tags:["autodocs"],parameters:{layout:"fullscreen"}},b=[{x:[1,2,3,4],y:[2,6,3,90],type:"scatter",mode:"lines+markers",marker:{color:"blue"}},{x:[1,2,3,4],y:[90,70,60,50],type:"scatter",mode:"lines+markers",marker:{color:"red"}}],e={args:{className:"h-96 w-full",data:b,xAxisTitle:"my title",yAxisTitle:"my y axis title",title:"My Scatter"}},t={args:{className:"h-96 w-full",data:b}};var p,d,y;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    className: "h-96 w-full",
    data: sampleData,
    xAxisTitle: 'my title',
    yAxisTitle: 'my y axis title',
    title: 'My Scatter'
  }
}`,...(y=(d=e.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};var f,g,x;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    className: "h-96 w-full",
    data: sampleData
  }
}`,...(x=(g=t.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};const L=["Default","NoTitles"];export{e as Default,t as NoTitles,L as __namedExportsOrder,C as default};
