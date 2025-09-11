import{j as w}from"./jsx-runtime-Cf8x2fCZ.js";import{r as y}from"./index-BlmOqGMO.js";import{P as $}from"./react-plotly-DHQ8Bxuu.js";import"./index-yBjzXJbu.js";function C({array:t,title:p="",xAxisTitle:a="",yAxisTitle:l="",colorScale:r="Viridis",verticalScaleFactor:i=.1,width:s="w-full",height:o="h-full",showTicks:e=!1,tickStep:n=100,showScale:f=!0,lockPlotHeightToParent:N=!1,lockPlotWidthHeightToInputArray:x=!1}){const g=y.useRef(null),[c,R]=y.useState({width:0,height:0});y.useEffect(()=>{const v=new ResizeObserver(P=>{if(P[0]){const{width:Y,height:_}=P[0].contentRect;R({width:Y,height:_})}});return g.current&&v.observe(g.current),()=>v.disconnect()},[]);const z=Math.max(t.length*i,0);return w.jsxs("div",{className:`${o} ${s} rounded-b-md flex-col content-end relative`,ref:g,children:[w.jsx($,{data:[{z:t,type:"heatmap",colorscale:r,zmin:0,zmax:255,showscale:f}],layout:{title:{text:p},xaxis:{title:a,automargin:!1,showticklabels:e,showgrid:e},yaxis:{title:l,range:[-.5,t.length-.5],autorange:!1,automargin:!1,tickmode:e?"linear":void 0,tick0:0,dtick:e?n:1e4,showticklabels:e,showgrid:e},autosize:!0,width:x?Math.min(c.width,t[0].length):c.width,height:x?Math.min(c.height,t.length):N?c.height:z,margin:{l:e||l?50:0,r:0,t:0,b:a?40:0}},config:{responsive:!0},className:"rounded-b-md"}),w.jsx("div",{className:"absolute bottom-0 left-0 right-0 text-center  text-md font-semibold",children:p})]})}C.__docgenInfo={description:"",methods:[],displayName:"PlotlyHeatmap",props:{array:{required:!0,tsType:{name:"Array",elements:[{name:"Array",elements:[{name:"number"}],raw:"number[]"}],raw:"number[][]"},description:"A nested array displayed top-down"},title:{required:!1,tsType:{name:"string"},description:"The plot title",defaultValue:{value:"''",computed:!1}},xAxisTitle:{required:!1,tsType:{name:"string"},description:"x axis title, adds padding to bottom",defaultValue:{value:"''",computed:!1}},yAxisTitle:{required:!1,tsType:{name:"string"},description:"y axis title, adds padding to left",defaultValue:{value:"''",computed:!1}},colorScale:{required:!1,tsType:{name:"union",raw:"'Viridis' | 'YlOrRd' | 'Cividis' | 'Hot' | 'Electric' | 'Plasma'",elements:[{name:"literal",value:"'Viridis'"},{name:"literal",value:"'YlOrRd'"},{name:"literal",value:"'Cividis'"},{name:"literal",value:"'Hot'"},{name:"literal",value:"'Electric'"},{name:"literal",value:"'Plasma'"}]},description:"Plotly specific colorscales",defaultValue:{value:"'Viridis'",computed:!1}},verticalScaleFactor:{required:!1,tsType:{name:"number"},description:"Adjust the height of the plot. ex) a factor of 2 makes each row in the array take up 2 pixels",defaultValue:{value:"0.1",computed:!1}},width:{required:!1,tsType:{name:"literal",value:"`w-${string}`"},description:"Tailwind ClassName, width of the plot container",defaultValue:{value:"'w-full'",computed:!1}},height:{required:!1,tsType:{name:"literal",value:"`h-${string}`"},description:"Tailwind ClassName, height of the plot container",defaultValue:{value:"'h-full'",computed:!1}},showTicks:{required:!1,tsType:{name:"boolean"},description:"Should tick marks show up?",defaultValue:{value:"false",computed:!1}},tickStep:{required:!1,tsType:{name:"number"},description:"Spacing between tick marks along data",defaultValue:{value:"100",computed:!1}},lockPlotHeightToParent:{required:!1,tsType:{name:"boolean"},description:"Should the visual plot be locked to the height of the parent container?",defaultValue:{value:"false",computed:!1}},lockPlotWidthHeightToInputArray:{required:!1,tsType:{name:"boolean"},description:"Should each data point be locked in to an exact pixel? Don't use this with 'lockPlotHeightToParent'",defaultValue:{value:"false",computed:!1}},showScale:{required:!1,tsType:{name:"boolean"},description:"Should the color scale show up? it will take up some space to the right of the plot",defaultValue:{value:"true",computed:!1}}}};const J={title:"General Components/PlotlyHeatmap",component:C,tags:["autodocs"],parameters:{layout:"centered"}};function L(t){const a=t/2,l=[];for(let r=0;r<t;r++){const i=[];for(let s=0;s<t;s++){const o=s-a,e=r-a,n=Math.sqrt(o*o+e*e),f=255*Math.exp(-n*n/(2*(a/2)**2));i.push(Math.round(f))}l.push(i)}return l}const X=10,M=L(X),d={args:{array:M,width:"w-96",height:"h-96",lockPlotHeightToParent:!0}},u={args:{array:M,width:"w-96",height:"h-96",lockPlotHeightToParent:!0,colorScale:"Electric"}},h={args:{array:[[1,20,30],[20,1,60]],width:"w-96",height:"h-96",lockPlotHeightToParent:!0,showScale:!1}},m={args:{array:[[1,20,30],[20,1,60],[30,60,1]],width:"w-96",height:"h-96",lockPlotHeightToParent:!0,xAxisTitle:"X axis title",yAxisTitle:"Y axis title"}};var b,T,k;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    array: eggData,
    width: 'w-96',
    height: 'h-96',
    lockPlotHeightToParent: true
  }
}`,...(k=(T=d.parameters)==null?void 0:T.docs)==null?void 0:k.source}}};var H,S,V;u.parameters={...u.parameters,docs:{...(H=u.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    array: eggData,
    width: 'w-96',
    height: 'h-96',
    lockPlotHeightToParent: true,
    colorScale: 'Electric'
  }
}`,...(V=(S=u.parameters)==null?void 0:S.docs)==null?void 0:V.source}}};var q,E,A;h.parameters={...h.parameters,docs:{...(q=h.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    array: [[1, 20, 30], [20, 1, 60]],
    width: 'w-96',
    height: 'h-96',
    lockPlotHeightToParent: true,
    showScale: false
  }
}`,...(A=(E=h.parameters)==null?void 0:E.docs)==null?void 0:A.source}}};var D,O,j;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    array: [[1, 20, 30], [20, 1, 60], [30, 60, 1]],
    width: 'w-96',
    height: 'h-96',
    lockPlotHeightToParent: true,
    xAxisTitle: 'X axis title',
    yAxisTitle: 'Y axis title'
  }
}`,...(j=(O=m.parameters)==null?void 0:O.docs)==null?void 0:j.source}}};const K=["Default","Electric","HeatmapOnly","Labels"];export{d as Default,u as Electric,h as HeatmapOnly,m as Labels,K as __namedExportsOrder,J as default};
