import{r as i}from"./index-BlmOqGMO.js";import{f as c}from"./index-BkdlOIaJ.js";import{j as t}from"./jsx-runtime-Cf8x2fCZ.js";import{c as Q}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";function x({label:e,min:r,max:n,value:l,units:d,shorthandUnits:z,marks:o,step:D=1,showFill:B=!1,showSideInput:G=!0,onChange:M=()=>{},className:R="",...H}){const y=a=>{a<r&&(a=r),a>n&&(a=n),M(a)},J=a=>{const s=Number(a.target.value);y(s)},w=a=>{const s=Number(a.target.value);y(s)},v=({mark:a,displayValue:s=!0})=>t.jsx("div",{className:"absolute -top-2 w-[1px] h-4 bg-gray-400",style:{left:K(a)},children:s&&t.jsxs("p",{className:"absolute text-center text-xs top-2 -translate-x-1/2 translate-y-full whitespace-nowrap",children:[a," ",z]})}),K=a=>`calc(${(a-r)/(n-r)*100}% + ${-((a-r)/(n-r))*16+8}px)`,P=(a,s)=>a.length-1===s||s===0;return t.jsxs("div",{className:Q("flex items-center pt-4 pb-4 pr-2 min-h-12 group min-w-96 w-full",R),...H,children:[e&&t.jsx("label",{className:"font-medium text-gray-700 w-fit pr-2",children:e}),t.jsxs("div",{className:"flex-grow flex items-center relative",children:[t.jsx("input",{type:"range",min:r,max:n,value:l,step:D,onChange:J,className:`${B?"appearance-auto":"appearance-none"} w-full absolute z-10 appearance-nonee hover:cursor-pointer bg-slate-400/50 h-2 rounded-lg focus:outline-none`}),t.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:`calc(${(l-r)/(n-r)*100}% + ${-((l-r)/(n-r))*16+16/2}px)`},children:t.jsxs("div",{className:"relative ",children:[t.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),t.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:t.jsx("input",{type:"number",value:l,className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:w})})]})}),o&&t.jsx("div",{className:"absolute z-0 w-full",children:o.map((a,s)=>t.jsx(v,{mark:a,displayValue:P(o,s)},s.toString()))}),(!o||!o.includes(r))&&t.jsx(v,{mark:r,displayValue:!0},r.toString()),(!o||!o.includes(n))&&t.jsx(v,{mark:n,displayValue:!0},n.toString())]}),G&&t.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[t.jsx("input",{type:"number",value:l,className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:w}),t.jsx("p",{className:"pl-1",children:d})]})]})}try{x.displayName="InputSlider",x.__docgenInfo={description:"",displayName:"InputSlider",props:{label:{defaultValue:null,description:"Slider label",name:"label",required:!1,type:{name:"string"}},min:{defaultValue:null,description:"Lowest possible value",name:"min",required:!0,type:{name:"number"}},max:{defaultValue:null,description:"Greatest possible value",name:"max",required:!0,type:{name:"number"}},value:{defaultValue:null,description:"Current value of slider",name:"value",required:!0,type:{name:"number"}},units:{defaultValue:null,description:"Unit type",name:"units",required:!1,type:{name:"string"}},shorthandUnits:{defaultValue:null,description:"An extra unit label underneath the min/max tickmark value",name:"shorthandUnits",required:!1,type:{name:"string"}},showSideInput:{defaultValue:{value:"true"},description:"Should we show the input box on the right of the slider?",name:"showSideInput",required:!1,type:{name:"boolean"}},marks:{defaultValue:null,description:"An array representing where vertical tick marks should be",name:"marks",required:!1,type:{name:"number[]"}},step:{defaultValue:{value:"1"},description:"The spacing between snap points for the slider thumb, defaults to 1",name:"step",required:!1,type:{name:"number"}},showFill:{defaultValue:{value:"false"},description:"Should the input bar be filled up with blue color up to the thumb?",name:"showFill",required:!1,type:{name:"boolean"}},onChange:{defaultValue:{value:"() => {}"},description:"A function that is called with the newest value",name:"onChange",required:!1,type:{name:"((value: number) => void)"}},className:{defaultValue:{value:""},description:"Tailwind ClassNames applied to parent container",name:"className",required:!1,type:{name:"string"}}}}}catch{}const re={title:"General Components/InputSlider",component:x,tags:["autodocs"],parameters:{layout:"centered"}};function u(e){const[r,n]=i.useState(e.value);return i.createElement(x,{...e,value:r,onChange:l=>{var d;n(l),(d=e.onChange)==null||d.call(e,l)}})}const p={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,label:"Age",units:"years"}},m={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c(),label:"Age",showFill:!0}},h={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c(),marks:[0,10,20,30,40,50,60,70,80,90,100]}},g={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c(),marks:[0,10,20,30,40,50,60,70,80,90,100],shorthandUnits:"yr"}},f={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c()}},b={render:e=>i.createElement(u,e),args:{min:0,max:100,value:4,onChange:c(),showSideInput:!1}};var S,I,C;p.parameters={...p.parameters,docs:{...(S=p.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    label: 'Age',
    units: 'years'
  }
}`,...(C=(I=p.parameters)==null?void 0:I.docs)==null?void 0:C.source}}};var N,j,E;m.parameters={...m.parameters,docs:{...(N=m.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn(),
    label: 'Age',
    showFill: true
  }
}`,...(E=(j=m.parameters)==null?void 0:j.docs)==null?void 0:E.source}}};var W,V,q;h.parameters={...h.parameters,docs:{...(W=h.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn(),
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
}`,...(q=(V=h.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};var k,_,L;g.parameters={...g.parameters,docs:{...(k=g.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn(),
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    shorthandUnits: 'yr'
  }
}`,...(L=(_=g.parameters)==null?void 0:_.docs)==null?void 0:L.source}}};var A,F,T;f.parameters={...f.parameters,docs:{...(A=f.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn()
  }
}`,...(T=(F=f.parameters)==null?void 0:F.docs)==null?void 0:T.source}}};var O,U,$;b.parameters={...b.parameters,docs:{...(O=b.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: args => createElement(InteractiveInputSlider, args),
  args: {
    min: 0,
    max: 100,
    value: 4,
    onChange: fn(),
    showSideInput: false
  }
}`,...($=(U=b.parameters)==null?void 0:U.docs)==null?void 0:$.source}}};const ne=["Default","WithFillBar","WithCustomTicks","WithTickLabels","WithoutLabel","WithoutLabelOrInput"];export{p as Default,h as WithCustomTicks,m as WithFillBar,g as WithTickLabels,f as WithoutLabel,b as WithoutLabelOrInput,ne as __namedExportsOrder,re as default};
