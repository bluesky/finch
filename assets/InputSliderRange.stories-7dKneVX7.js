import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{r as M}from"./index-BlmOqGMO.js";import{f as d}from"./index-BkdlOIaJ.js";import{c as Y}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";function v({label:n,min:r,max:l,value:s,units:u,shorthandUnits:G,marks:o,step:w=1,allowValueOverlap:F=!1,showSideInput:N=!0,onChange:P=()=>{},isDisabled:S=!1,className:B="",...H}){const[Z,J]=M.useState(s),c=16,C=(a,t)=>{t<r&&(t=r),t>l&&(t=l);const i=[...s];if(i[a]=t,F){if(i[0]>i[1])return}else if(i[0]>=i[1])return;J(i),P(i)},I=(a,t)=>{if(S)return;const i=Number(t.target.value);[...s],C(a,i)},m=(a,t)=>{if(S)return;const i=Number(t.target.value);[...s],C(a,i)},y=a=>`calc(${(a-r)/(l-r)*100}% + ${-((a-r)/(l-r))*c+c/2}px)`,K=a=>{const t=Math.max(a[0],a[1]),i=Math.min(a[0],a[1]);return`calc(${(t-i)/(l-r)*100}% + ${-((t-i)/(l-r))*c}px)`},j=({mark:a,displayValue:t=!0})=>e.jsx("div",{className:"absolute -top-2 w-[1px] h-4 bg-gray-400",style:{left:Q(a)},children:t&&e.jsxs("p",{className:"absolute text-center text-xs top-2 -translate-x-1/2 translate-y-full whitespace-nowrap",children:[a," ",G]})}),Q=a=>`calc(${(a-r)/(l-r)*100}% + ${-((a-r)/(l-r))*c+c/2}px)`,X=(a,t)=>a.length-1===t||t===0;return e.jsxs("div",{className:Y("flex items-center pt-4 pb-4 pr-2 min-h-12 group w-full min-w-96",B),...H,children:[n&&e.jsx("label",{className:"font-medium text-gray-700 w-fit pr-2",children:n}),N&&e.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[e.jsx("input",{type:"number",value:s[0],className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:a=>m(0,a)}),e.jsx("p",{className:"pl-1",children:u})]}),e.jsxs("div",{className:"relative flex-grow",children:[e.jsx("div",{className:"w-full absolute top-0 left-0",children:e.jsxs("div",{className:"flex-grow flex items-center relative",children:[e.jsx("input",{type:"range",min:r,max:l,value:s[0],step:w,onChange:a=>I(0,a),style:{pointerEvents:"none"},className:"range-slider appearance-none w-full absolute z-10  hover:cursor-pointer bg-slate-400/50 h-2 rounded-lg focus:outline-none"}),e.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:y(s[0])},children:e.jsxs("div",{className:"relative ",children:[e.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),e.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:e.jsx("input",{type:"number",value:s[0],className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:a=>m(0,a)})})]})}),o&&e.jsx("div",{className:"absolute z-0 w-full",children:o.map((a,t)=>e.jsx(j,{mark:a,displayValue:X(o,t)},t.toString()))}),(!o||!o.includes(r))&&e.jsx(j,{mark:r,displayValue:!0},r.toString()),(!o||!o.includes(l))&&e.jsx(j,{mark:l,displayValue:!0},l.toString())]})}),e.jsx("div",{className:"w-full absolute top-0 left-0",children:e.jsxs("div",{className:"flex-grow flex items-center relative",children:[e.jsx("input",{type:"range",min:r,max:l,value:s[1],step:w,onChange:a=>I(1,a),style:{pointerEvents:"none"},className:"range-slider appearance-none w-full absolute z-10  hover:cursor-pointer bg-transparent h-2 rounded-lg focus:outline-none"}),e.jsx("style",{children:`
                                .range-slider::-webkit-slider-thumb {
                                    pointer-events: auto;
                                }
                                .range-slider::-moz-range-thumb {
                                    pointer-events: auto;
                                }
                            `}),e.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:y(s[1])},children:e.jsxs("div",{className:"relative ",children:[e.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),e.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:e.jsx("input",{type:"number",value:s[1],className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:a=>m(1,a)})})]})})]})}),e.jsx("span",{className:"absolute z-0 top-0 h-2 bg-blue-700/80 -translate-y-1/2",style:{left:y(Math.min(s[0],s[1])),width:K(s)}})]}),N&&e.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[e.jsx("input",{type:"number",value:s[1],className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:a=>m(1,a)}),e.jsx("p",{className:"pl-1",children:u})]})]})}try{v.displayName="InputSliderRange",v.__docgenInfo={description:"",displayName:"InputSliderRange",props:{label:{defaultValue:null,description:"Slider label",name:"label",required:!1,type:{name:"string"}},min:{defaultValue:null,description:"Lowest possible value",name:"min",required:!0,type:{name:"number"}},max:{defaultValue:null,description:"Greatest possible value",name:"max",required:!0,type:{name:"number"}},value:{defaultValue:null,description:"Current value of slider",name:"value",required:!0,type:{name:"[number, number]"}},units:{defaultValue:null,description:"Unit type",name:"units",required:!1,type:{name:"string"}},shorthandUnits:{defaultValue:null,description:"An extra unit label underneath the min/max tickmark value",name:"shorthandUnits",required:!1,type:{name:"string"}},showSideInput:{defaultValue:{value:"true"},description:"Should we show the input box on the right of the slider?",name:"showSideInput",required:!1,type:{name:"boolean"}},marks:{defaultValue:null,description:"An array representing where vertical tick marks should be",name:"marks",required:!1,type:{name:"number[]"}},step:{defaultValue:{value:"1"},description:"The spacing between snap points for the slider thumb, defaults to 1",name:"step",required:!1,type:{name:"number"}},allowValueOverlap:{defaultValue:{value:"false"},description:"Is it allowed to have the min value equal the max value?",name:"allowValueOverlap",required:!1,type:{name:"boolean"}},onChange:{defaultValue:{value:"() => {}"},description:"A function that is called with the newest value",name:"onChange",required:!1,type:{name:"((value: [number, number]) => void)"}},isDisabled:{defaultValue:{value:"false"},description:"Should the slider be disabled?",name:"isDisabled",required:!1,type:{name:"boolean"}},className:{defaultValue:{value:""},description:"Tailwind ClassNames applied to parent container",name:"className",required:!1,type:{name:"string"}}}}}catch{}const le={title:"General Components/InputSliderRange",component:v,tags:["autodocs"],parameters:{layout:"centered"}};function p(n){const[r,l]=M.useState(n.value);return e.jsx(v,{...n,value:r,onChange:s=>{var u;l(s),(u=n.onChange)==null||u.call(n,s)}})}const h={render:n=>e.jsx(p,{...n}),args:{min:0,max:100,value:[20,50],onChange:d(),label:"Age",units:"years"}},g={render:n=>e.jsx(p,{...n}),args:{min:0,max:100,value:[20,50],onChange:d(),marks:[0,10,20,30,40,50,60,70,80,90,100]}},f={render:n=>e.jsx(p,{...n}),args:{min:0,max:100,value:[20,50],onChange:d(),marks:[0,10,20,30,40,50,60,70,80,90,100],shorthandUnits:"yr"}},x={render:n=>e.jsx(p,{...n}),args:{min:0,max:100,value:[20,50],onChange:d()}},b={render:n=>e.jsx(p,{...n}),args:{min:0,max:100,value:[20,50],onChange:d(),showSideInput:!1}};var V,k,q;h.parameters={...h.parameters,docs:{...(V=h.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn(),
    label: 'Age',
    units: 'years'
  }
}`,...(q=(k=h.parameters)==null?void 0:k.docs)==null?void 0:q.source}}};var R,W,_;g.parameters={...g.parameters,docs:{...(R=g.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn(),
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
}`,...(_=(W=g.parameters)==null?void 0:W.docs)==null?void 0:_.source}}};var L,T,z;f.parameters={...f.parameters,docs:{...(L=f.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn(),
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    shorthandUnits: 'yr'
  }
}`,...(z=(T=f.parameters)==null?void 0:T.docs)==null?void 0:z.source}}};var O,$,A;x.parameters={...x.parameters,docs:{...(O=x.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn()
  }
}`,...(A=($=x.parameters)==null?void 0:$.docs)==null?void 0:A.source}}};var E,U,D;b.parameters={...b.parameters,docs:{...(E=b.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn(),
    showSideInput: false
  }
}`,...(D=(U=b.parameters)==null?void 0:U.docs)==null?void 0:D.source}}};const ie=["Default","WithCustomTicks","WithTickLabels","WithoutLabel","WithoutLabelOrInput"];export{h as Default,g as WithCustomTicks,f as WithTickLabels,x as WithoutLabel,b as WithoutLabelOrInput,ie as __namedExportsOrder,le as default};
