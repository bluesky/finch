import{f as i}from"./index-BkdlOIaJ.js";import{j as a}from"./jsx-runtime-Cf8x2fCZ.js";import{r as X}from"./index-BlmOqGMO.js";import"./index-yBjzXJbu.js";function U({label:f,min:t,max:s,value:l,units:_,shorthandUnits:D,marks:r,step:E=1,showFill:B=!1,size:Y="medium",width:G="w-full",showSideInput:H=!0,onChange:b,styles:M="",...R}){const[Z,J]=X.useState(l),o=16,w=e=>{e<t&&(e=t),e>s&&(e=s),J(e),b&&b(e)},K=e=>{const n=Number(e.target.value);w(n)},x=e=>{var n=Number(e.target.value);w(n)};if(r)for(let e=0;e<(r==null?void 0:r.length);e++)r[e];const g=({mark:e,displayValue:n=!0})=>a.jsx("div",{className:"absolute -top-2 w-[1px] h-4 bg-gray-400",style:{left:P(e)},children:n&&a.jsxs("p",{className:"absolute text-center text-xs top-2 -translate-x-1/2 translate-y-full whitespace-nowrap",children:[e," ",D]})}),P=e=>`calc(${(e-t)/(s-t)*100}% + ${-((e-t)/(s-t))*o+o/2}px)`,Q=(e,n)=>e.length-1===n||n===0;return a.jsxs("div",{className:`flex items-center pt-4 pb-4 pr-2 min-h-12 group ${G} ${M}`,...R,children:[f&&a.jsx("label",{className:"font-medium text-gray-700 w-fit pr-2",children:f}),a.jsxs("div",{className:"flex-grow flex items-center relative",children:[a.jsx("input",{type:"range",min:t,max:s,value:l,step:E,onChange:K,className:`${B?"appearance-auto":"appearance-none"} w-full absolute z-10 appearance-nonee hover:cursor-pointer bg-slate-400/50 h-2 rounded-lg focus:outline-none`}),a.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:`calc(${(l-t)/(s-t)*100}% + ${-((l-t)/(s-t))*o+o/2}px)`},children:a.jsxs("div",{className:"relative ",children:[a.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),a.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:a.jsx("input",{type:"number",value:l,className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:x})})]})}),r&&a.jsx("div",{className:"absolute z-0 w-full",children:r.map((e,n)=>a.jsx(g,{mark:e,displayValue:Q(r,n)},n.toString()))}),(!r||!r.includes(t))&&a.jsx(g,{mark:t,displayValue:!0},t.toString()),(!r||!r.includes(s))&&a.jsx(g,{mark:s,displayValue:!0},s.toString())]}),H&&a.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[a.jsx("input",{type:"number",value:l,className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:x}),a.jsx("p",{className:"pl-1",children:_})]})]})}U.__docgenInfo={description:"",methods:[],displayName:"InputSlider",props:{label:{required:!1,tsType:{name:"string"},description:"Slider label"},min:{required:!0,tsType:{name:"number"},description:"Lowest possible value"},max:{required:!0,tsType:{name:"number"},description:"Greatest possible value"},value:{required:!0,tsType:{name:"number"},description:"Current value of slider"},units:{required:!1,tsType:{name:"string"},description:"Unit type"},shorthandUnits:{required:!1,tsType:{name:"string"},description:"An extra unit label underneath the min/max tickmark value"},showSideInput:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},marks:{required:!1,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:"An array representing where vertical tick marks should be"},step:{required:!1,tsType:{name:"number"},description:"The spacing between snap points for the slider thumb, defaults to 1",defaultValue:{value:"1",computed:!1}},showFill:{required:!1,tsType:{name:"boolean"},description:"Should the input bar be filled up with blue color up to the thumb?",defaultValue:{value:"false",computed:!1}},width:{required:!1,tsType:{name:"literal",value:"`w-${string}`"},description:"",defaultValue:{value:"'w-full'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'small' | 'medium' | 'large'",elements:[{name:"literal",value:"'small'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'large'"}]},description:"How big should the text and tick marks be?",defaultValue:{value:"'medium'",computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: number) => void",signature:{arguments:[{type:{name:"number"},name:"value"}],return:{name:"void"}}},description:"A function that is called with the newest value"},styles:{required:!1,tsType:{name:"string"},description:"Tailwind ClassNames applied to parent container",defaultValue:{value:'""',computed:!1}}}};const ne={title:"General Components/InputSlider",component:U,tags:["autodocs"],parameters:{layout:"centered"}},u={args:{min:0,max:100,value:4,onChange:i,width:"w-96",label:"Age",units:"years"}},p={args:{min:0,max:100,value:4,onChange:i,width:"w-96",label:"Age",showFill:!0}},c={args:{min:0,max:100,value:4,onChange:i,width:"w-96",marks:[0,10,20,30,40,50,60,70,80,90,100]}},d={args:{min:0,max:100,value:4,onChange:i,width:"w-96",marks:[0,10,20,30,40,50,60,70,80,90,100],shorthandUnits:"yr"}},m={args:{min:0,max:100,value:4,onChange:i,width:"w-[350px]"}},h={args:{min:0,max:100,value:4,onChange:i,width:"w-[400px]",showSideInput:!1}};var v,y,C;u.parameters={...u.parameters,docs:{...(v=u.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn,
    width: 'w-96',
    label: 'Age',
    units: 'years'
  }
}`,...(C=(y=u.parameters)==null?void 0:y.docs)==null?void 0:C.source}}};var j,T,N;p.parameters={...p.parameters,docs:{...(j=p.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn,
    width: 'w-96',
    label: 'Age',
    showFill: true
  }
}`,...(N=(T=p.parameters)==null?void 0:T.docs)==null?void 0:N.source}}};var S,q,I;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn,
    width: 'w-96',
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
}`,...(I=(q=c.parameters)==null?void 0:q.docs)==null?void 0:I.source}}};var W,L,A;d.parameters={...d.parameters,docs:{...(W=d.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn,
    width: 'w-96',
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    shorthandUnits: 'yr'
  }
}`,...(A=(L=d.parameters)==null?void 0:L.docs)==null?void 0:A.source}}};var V,$,F;m.parameters={...m.parameters,docs:{...(V=m.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn,
    width: 'w-[350px]'
  }
}`,...(F=($=m.parameters)==null?void 0:$.docs)==null?void 0:F.source}}};var z,O,k;h.parameters={...h.parameters,docs:{...(z=h.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn,
    width: 'w-[400px]',
    showSideInput: false
  }
}`,...(k=(O=h.parameters)==null?void 0:O.docs)==null?void 0:k.source}}};const se=["Default","WithFillBar","WithCustomTicks","WithTickLabels","WithoutLabel","WithoutLabelOrInput"];export{u as Default,c as WithCustomTicks,p as WithFillBar,d as WithTickLabels,m as WithoutLabel,h as WithoutLabelOrInput,se as __namedExportsOrder,ne as default};
