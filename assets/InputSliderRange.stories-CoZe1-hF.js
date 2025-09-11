import{f as u}from"./index-BkdlOIaJ.js";import{j as t}from"./jsx-runtime-Cf8x2fCZ.js";import{r as X}from"./index-BlmOqGMO.js";import"./index-yBjzXJbu.js";function _({label:x,min:s,max:l,value:n,units:w,shorthandUnits:D,marks:i,step:y=1,size:Y="medium",allowValueOverlap:G=!1,width:F="w-full",showSideInput:v=!0,onChange:j,isDisabled:N=!1,styles:H="",...P}){const[Z,B]=X.useState(n),o=16,C=(e,a)=>{a<s&&(a=s),a>l&&(a=l);var r=[...n];if(r[e]=a,G){if(r[0]>r[1])return}else if(r[0]>=r[1])return;B(r),j&&j(r)},S=(e,a)=>{if(!N){var r=Number(a.target.value);[...n],C(e,r)}},c=(e,a)=>{if(!N){var r=Number(a.target.value);[...n],C(e,r)}},g=e=>`calc(${(e-s)/(l-s)*100}% + ${-((e-s)/(l-s))*o+o/2}px)`,J=e=>{const a=Math.max(e[0],e[1]),r=Math.min(e[0],e[1]);return`calc(${(a-r)/(l-s)*100}% + ${-((a-r)/(l-s))*o}px)`};if(i)for(let e=0;e<(i==null?void 0:i.length);e++)i[e];const b=({mark:e,displayValue:a=!0})=>t.jsx("div",{className:"absolute -top-2 w-[1px] h-4 bg-gray-400",style:{left:K(e)},children:a&&t.jsxs("p",{className:"absolute text-center text-xs top-2 -translate-x-1/2 translate-y-full whitespace-nowrap",children:[e," ",D]})}),K=e=>`calc(${(e-s)/(l-s)*100}% + ${-((e-s)/(l-s))*o+o/2}px)`,Q=(e,a)=>e.length-1===a||a===0;return t.jsxs("div",{className:`flex items-center pt-4 pb-4 pr-2 min-h-12 group ${F} ${H}`,...P,children:[x&&t.jsx("label",{className:"font-medium text-gray-700 w-fit pr-2",children:x}),v&&t.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[t.jsx("input",{type:"number",value:n[0],className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:e=>c(0,e)}),t.jsx("p",{className:"pl-1",children:w})]}),t.jsxs("div",{className:"relative flex-grow",children:[t.jsx("div",{className:"w-full absolute top-0 left-0",children:t.jsxs("div",{className:"flex-grow flex items-center relative",children:[t.jsx("input",{type:"range",min:s,max:l,value:n[0],step:y,onChange:e=>S(0,e),style:{pointerEvents:"none"},className:"range-slider appearance-none w-full absolute z-10  hover:cursor-pointer bg-slate-400/50 h-2 rounded-lg focus:outline-none"}),t.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:g(n[0])},children:t.jsxs("div",{className:"relative ",children:[t.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),t.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:t.jsx("input",{type:"number",value:n[0],className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:e=>c(0,e)})})]})}),i&&t.jsx("div",{className:"absolute z-0 w-full",children:i.map((e,a)=>t.jsx(b,{mark:e,displayValue:Q(i,a)},a.toString()))}),(!i||!i.includes(s))&&t.jsx(b,{mark:s,displayValue:!0},s.toString()),(!i||!i.includes(l))&&t.jsx(b,{mark:l,displayValue:!0},l.toString())]})}),t.jsx("div",{className:"w-full absolute top-0 left-0",children:t.jsxs("div",{className:"flex-grow flex items-center relative",children:[t.jsx("input",{type:"range",min:s,max:l,value:n[1],step:y,onChange:e=>S(1,e),style:{pointerEvents:"none"},className:"range-slider appearance-none w-full absolute z-10  hover:cursor-pointer bg-transparent h-2 rounded-lg focus:outline-none"}),t.jsx("style",{children:`
                                .range-slider::-webkit-slider-thumb {
                                    pointer-events: auto;
                                }
                                .range-slider::-moz-range-thumb {
                                    pointer-events: auto;
                                }
                            `}),t.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:g(n[1])},children:t.jsxs("div",{className:"relative ",children:[t.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),t.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:t.jsx("input",{type:"number",value:n[1],className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:e=>c(1,e)})})]})})]})}),t.jsx("span",{className:"absolute z-0 top-0 h-2 bg-blue-700/80 -translate-y-1/2",style:{left:g(Math.min(n[0],n[1])),width:J(n)}})]}),v&&t.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[t.jsx("input",{type:"number",value:n[1],className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:e=>c(1,e)}),t.jsx("p",{className:"pl-1",children:w})]})]})}_.__docgenInfo={description:"",methods:[],displayName:"InputSliderRange",props:{label:{required:!1,tsType:{name:"string"},description:"Slider label"},min:{required:!0,tsType:{name:"number"},description:"Lowest possible value"},max:{required:!0,tsType:{name:"number"},description:"Greatest possible value"},value:{required:!0,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:"Current value of slider"},units:{required:!1,tsType:{name:"string"},description:"Unit type"},shorthandUnits:{required:!1,tsType:{name:"string"},description:"An extra unit label underneath the min/max tickmark value"},showSideInput:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},marks:{required:!1,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:"An array representing where vertical tick marks should be"},step:{required:!1,tsType:{name:"number"},description:"The spacing between snap points for the slider thumb, defaults to 1",defaultValue:{value:"1",computed:!1}},width:{required:!1,tsType:{name:"literal",value:"`w-${string}`"},description:"",defaultValue:{value:"'w-full'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'small' | 'medium' | 'large'",elements:[{name:"literal",value:"'small'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'large'"}]},description:"How big should the text and tick marks be?",defaultValue:{value:"'medium'",computed:!1}},allowValueOverlap:{required:!1,tsType:{name:"boolean"},description:"Is it allowed to have the min value equal the max value?",defaultValue:{value:"false",computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value:[number, number]) => void",signature:{arguments:[{type:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},name:"value"}],return:{name:"void"}}},description:"A function that is called with the newest value"},isDisabled:{required:!1,tsType:{name:"boolean"},description:"Should the slider be disabled?",defaultValue:{value:"false",computed:!1}},styles:{required:!1,tsType:{name:"string"},description:"Tailwind ClassNames applied to parent container",defaultValue:{value:'""',computed:!1}}}};const re={title:"General Components/InputSliderRange",component:_,tags:["autodocs"],parameters:{layout:"centered"}},d={args:{min:0,max:100,value:[20,50],onChange:u,width:"w-96",label:"Age",units:"years"}},p={args:{min:0,max:100,value:[20,50],onChange:u,width:"w-96",marks:[0,10,20,30,40,50,60,70,80,90,100]}},m={args:{min:0,max:100,value:[20,50],onChange:u,width:"w-96",marks:[0,10,20,30,40,50,60,70,80,90,100],shorthandUnits:"yr"}},h={args:{min:0,max:100,value:[20,50],onChange:u,width:"w-[350px]"}},f={args:{min:0,max:100,value:[20,50],onChange:u,width:"w-[400px]",showSideInput:!1}};var T,q,V;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn,
    width: 'w-96',
    label: 'Age',
    units: 'years'
  }
}`,...(V=(q=d.parameters)==null?void 0:q.docs)==null?void 0:V.source}}};var W,I,z;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn,
    width: 'w-96',
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
}`,...(z=(I=p.parameters)==null?void 0:I.docs)==null?void 0:z.source}}};var L,$,k;m.parameters={...m.parameters,docs:{...(L=m.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn,
    width: 'w-96',
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    shorthandUnits: 'yr'
  }
}`,...(k=($=m.parameters)==null?void 0:$.docs)==null?void 0:k.source}}};var A,O,E;h.parameters={...h.parameters,docs:{...(A=h.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn,
    width: 'w-[350px]'
  }
}`,...(E=(O=h.parameters)==null?void 0:O.docs)==null?void 0:E.source}}};var R,M,U;f.parameters={...f.parameters,docs:{...(R=f.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn,
    width: 'w-[400px]',
    showSideInput: false
  }
}`,...(U=(M=f.parameters)==null?void 0:M.docs)==null?void 0:U.source}}};const le=["Default","WithCustomTicks","WithTickLabels","WithoutLabel","WithoutLabelOrInput"];export{d as Default,p as WithCustomTicks,m as WithTickLabels,h as WithoutLabel,f as WithoutLabelOrInput,le as __namedExportsOrder,re as default};
