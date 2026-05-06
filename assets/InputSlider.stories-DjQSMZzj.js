import{r as i}from"./index-BlmOqGMO.js";import{f as c}from"./index-BkdlOIaJ.js";import{j as r}from"./jsx-runtime-Cf8x2fCZ.js";import{c as Q}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";function x({label:e,min:a,max:n,value:l,units:p,shorthandUnits:z,marks:o,step:D=1,showFill:B=!1,showSideInput:G=!0,onChange:M=()=>{},className:R="",...H}){const y=t=>{t<a&&(t=a),t>n&&(t=n),M(t)},J=t=>{const s=Number(t.target.value);y(s)},w=t=>{const s=Number(t.target.value);y(s)},v=({mark:t,displayValue:s=!0})=>r.jsx("div",{className:"absolute -top-2 w-[1px] h-4 bg-gray-400",style:{left:K(t)},children:s&&r.jsxs("p",{className:"absolute text-center text-xs top-2 -translate-x-1/2 translate-y-full whitespace-nowrap",children:[t," ",z]})}),K=t=>`calc(${(t-a)/(n-a)*100}% + ${-((t-a)/(n-a))*16+8}px)`,P=(t,s)=>t.length-1===s||s===0;return r.jsxs("div",{className:Q("flex items-center pt-4 pb-4 pr-2 min-h-12 group min-w-96 w-full",R),...H,children:[e&&r.jsx("label",{className:"font-medium text-gray-700 w-fit pr-2",children:e}),r.jsxs("div",{className:"flex-grow flex items-center relative",children:[r.jsx("input",{type:"range",min:a,max:n,value:l,step:D,onChange:J,className:`${B?"appearance-auto":"appearance-none"} w-full absolute z-10 appearance-nonee hover:cursor-pointer bg-slate-400/50 h-2 rounded-lg focus:outline-none`}),r.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:`calc(${(l-a)/(n-a)*100}% + ${-((l-a)/(n-a))*16+16/2}px)`},children:r.jsxs("div",{className:"relative ",children:[r.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),r.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:r.jsx("input",{type:"number",value:l,className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:w})})]})}),o&&r.jsx("div",{className:"absolute z-0 w-full",children:o.map((t,s)=>r.jsx(v,{mark:t,displayValue:P(o,s)},s.toString()))}),(!o||!o.includes(a))&&r.jsx(v,{mark:a,displayValue:!0},a.toString()),(!o||!o.includes(n))&&r.jsx(v,{mark:n,displayValue:!0},n.toString())]}),G&&r.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[r.jsx("input",{type:"number",value:l,className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:w}),r.jsx("p",{className:"pl-1",children:p})]})]})}x.__docgenInfo={description:"",methods:[],displayName:"InputSlider",props:{label:{required:!1,tsType:{name:"string"},description:"Slider label"},min:{required:!0,tsType:{name:"number"},description:"Lowest possible value"},max:{required:!0,tsType:{name:"number"},description:"Greatest possible value"},value:{required:!0,tsType:{name:"number"},description:"Current value of slider"},units:{required:!1,tsType:{name:"string"},description:"Unit type"},shorthandUnits:{required:!1,tsType:{name:"string"},description:"An extra unit label underneath the min/max tickmark value"},showSideInput:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},marks:{required:!1,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:"An array representing where vertical tick marks should be"},step:{required:!1,tsType:{name:"number"},description:"The spacing between snap points for the slider thumb, defaults to 1",defaultValue:{value:"1",computed:!1}},showFill:{required:!1,tsType:{name:"boolean"},description:"Should the input bar be filled up with blue color up to the thumb?",defaultValue:{value:"false",computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: number) => void",signature:{arguments:[{type:{name:"number"},name:"value"}],return:{name:"void"}}},description:"A function that is called with the newest value",defaultValue:{value:"() => {}",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Tailwind ClassNames applied to parent container",defaultValue:{value:'""',computed:!1}}}};const ae={title:"General Components/InputSlider",component:x,tags:["autodocs"],parameters:{layout:"centered"}};function u(e){const[a,n]=i.useState(e.value);return i.createElement(x,{...e,value:a,onChange:l=>{var p;n(l),(p=e.onChange)==null||p.call(e,l)}})}const d={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,label:"Age",units:"years"}},m={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c(),label:"Age",showFill:!0}},h={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c(),marks:[0,10,20,30,40,50,60,70,80,90,100]}},g={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c(),marks:[0,10,20,30,40,50,60,70,80,90,100],shorthandUnits:"yr"}},f={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c()}},b={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c(),showSideInput:!1}};var S,I,C;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    label: 'Age',
    units: 'years'
  }
}`,...(C=(I=d.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var j,N,T;m.parameters={...m.parameters,docs:{...(j=m.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn(),
    label: 'Age',
    showFill: true
  }
}`,...(T=(N=m.parameters)==null?void 0:N.docs)==null?void 0:T.source}}};var E,W,q;h.parameters={...h.parameters,docs:{...(E=h.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn(),
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
}`,...(q=(W=h.parameters)==null?void 0:W.docs)==null?void 0:q.source}}};var k,L,A;g.parameters={...g.parameters,docs:{...(k=g.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn(),
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    shorthandUnits: 'yr'
  }
}`,...(A=(L=g.parameters)==null?void 0:L.docs)==null?void 0:A.source}}};var F,V,O;f.parameters={...f.parameters,docs:{...(F=f.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn()
  }
}`,...(O=(V=f.parameters)==null?void 0:V.docs)==null?void 0:O.source}}};var $,U,_;b.parameters={...b.parameters,docs:{...($=b.parameters)==null?void 0:$.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn(),
    showSideInput: false
  }
}`,...(_=(U=b.parameters)==null?void 0:U.docs)==null?void 0:_.source}}};const ne=["Default","WithFillBar","WithCustomTicks","WithTickLabels","WithoutLabel","WithoutLabelOrInput"];export{d as Default,h as WithCustomTicks,m as WithFillBar,g as WithTickLabels,f as WithoutLabel,b as WithoutLabelOrInput,ne as __namedExportsOrder,ae as default};
