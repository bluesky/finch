import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{r as D}from"./index-BlmOqGMO.js";import{f as p}from"./index-BkdlOIaJ.js";import{c as Y}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";function j({label:r,min:n,max:l,value:s,units:u,shorthandUnits:G,marks:i,step:w=1,allowValueOverlap:F=!1,showSideInput:N=!0,onChange:P=()=>{},isDisabled:S=!1,className:B="",...H}){const[Z,J]=D.useState(s),c=16,C=(t,a)=>{a<n&&(a=n),a>l&&(a=l);const o=[...s];if(o[t]=a,F){if(o[0]>o[1])return}else if(o[0]>=o[1])return;J(o),P(o)},I=(t,a)=>{if(S)return;const o=Number(a.target.value);[...s],C(t,o)},m=(t,a)=>{if(S)return;const o=Number(a.target.value);[...s],C(t,o)},v=t=>`calc(${(t-n)/(l-n)*100}% + ${-((t-n)/(l-n))*c+c/2}px)`,K=t=>{const a=Math.max(t[0],t[1]),o=Math.min(t[0],t[1]);return`calc(${(a-o)/(l-n)*100}% + ${-((a-o)/(l-n))*c}px)`},y=({mark:t,displayValue:a=!0})=>e.jsx("div",{className:"absolute -top-2 w-[1px] h-4 bg-gray-400",style:{left:Q(t)},children:a&&e.jsxs("p",{className:"absolute text-center text-xs top-2 -translate-x-1/2 translate-y-full whitespace-nowrap",children:[t," ",G]})}),Q=t=>`calc(${(t-n)/(l-n)*100}% + ${-((t-n)/(l-n))*c+c/2}px)`,X=(t,a)=>t.length-1===a||a===0;return e.jsxs("div",{className:Y("flex items-center pt-4 pb-4 pr-2 min-h-12 group w-full min-w-96",B),...H,children:[r&&e.jsx("label",{className:"font-medium text-gray-700 w-fit pr-2",children:r}),N&&e.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[e.jsx("input",{type:"number",value:s[0],className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:t=>m(0,t)}),e.jsx("p",{className:"pl-1",children:u})]}),e.jsxs("div",{className:"relative flex-grow",children:[e.jsx("div",{className:"w-full absolute top-0 left-0",children:e.jsxs("div",{className:"flex-grow flex items-center relative",children:[e.jsx("input",{type:"range",min:n,max:l,value:s[0],step:w,onChange:t=>I(0,t),style:{pointerEvents:"none"},className:"range-slider appearance-none w-full absolute z-10  hover:cursor-pointer bg-slate-400/50 h-2 rounded-lg focus:outline-none"}),e.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:v(s[0])},children:e.jsxs("div",{className:"relative ",children:[e.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),e.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:e.jsx("input",{type:"number",value:s[0],className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:t=>m(0,t)})})]})}),i&&e.jsx("div",{className:"absolute z-0 w-full",children:i.map((t,a)=>e.jsx(y,{mark:t,displayValue:X(i,a)},a.toString()))}),(!i||!i.includes(n))&&e.jsx(y,{mark:n,displayValue:!0},n.toString()),(!i||!i.includes(l))&&e.jsx(y,{mark:l,displayValue:!0},l.toString())]})}),e.jsx("div",{className:"w-full absolute top-0 left-0",children:e.jsxs("div",{className:"flex-grow flex items-center relative",children:[e.jsx("input",{type:"range",min:n,max:l,value:s[1],step:w,onChange:t=>I(1,t),style:{pointerEvents:"none"},className:"range-slider appearance-none w-full absolute z-10  hover:cursor-pointer bg-transparent h-2 rounded-lg focus:outline-none"}),e.jsx("style",{children:`
                                .range-slider::-webkit-slider-thumb {
                                    pointer-events: auto;
                                }
                                .range-slider::-moz-range-thumb {
                                    pointer-events: auto;
                                }
                            `}),e.jsx("div",{className:"absolute z-0 -top-8 w-12 h-24",style:{left:v(s[1])},children:e.jsxs("div",{className:"relative ",children:[e.jsx("div",{className:"absolute w-[0] h-4 top-1 bg-gray-400"}),e.jsx("div",{className:"absolute -translate-x-1/2 left-2 -y-translate-full -top-0",children:e.jsx("input",{type:"number",value:s[1],className:"w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400",onChange:t=>m(1,t)})})]})})]})}),e.jsx("span",{className:"absolute z-0 top-0 h-2 bg-blue-700/80 -translate-y-1/2",style:{left:v(Math.min(s[0],s[1])),width:K(s)}})]}),N&&e.jsxs("div",{className:"w-fit pl-2 text-gray-700 flex justify-center items-center",children:[e.jsx("input",{type:"number",value:s[1],className:"text-center text-md w-12 border appearance-none bg-white/50",onChange:t=>m(1,t)}),e.jsx("p",{className:"pl-1",children:u})]})]})}j.__docgenInfo={description:"",methods:[],displayName:"InputSliderRange",props:{label:{required:!1,tsType:{name:"string"},description:"Slider label"},min:{required:!0,tsType:{name:"number"},description:"Lowest possible value"},max:{required:!0,tsType:{name:"number"},description:"Greatest possible value"},value:{required:!0,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:"Current value of slider"},units:{required:!1,tsType:{name:"string"},description:"Unit type"},shorthandUnits:{required:!1,tsType:{name:"string"},description:"An extra unit label underneath the min/max tickmark value"},showSideInput:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},marks:{required:!1,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:"An array representing where vertical tick marks should be"},step:{required:!1,tsType:{name:"number"},description:"The spacing between snap points for the slider thumb, defaults to 1",defaultValue:{value:"1",computed:!1}},allowValueOverlap:{required:!1,tsType:{name:"boolean"},description:"Is it allowed to have the min value equal the max value?",defaultValue:{value:"false",computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value:[number, number]) => void",signature:{arguments:[{type:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},name:"value"}],return:{name:"void"}}},description:"A function that is called with the newest value",defaultValue:{value:"() => {}",computed:!1}},isDisabled:{required:!1,tsType:{name:"boolean"},description:"Should the slider be disabled?",defaultValue:{value:"false",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Tailwind ClassNames applied to parent container",defaultValue:{value:'""',computed:!1}}}};const le={title:"General Components/InputSliderRange",component:j,tags:["autodocs"],parameters:{layout:"centered"}};function d(r){const[n,l]=D.useState(r.value);return e.jsx(j,{...r,value:n,onChange:s=>{var u;l(s),(u=r.onChange)==null||u.call(r,s)}})}const h={render:r=>e.jsx(d,{...r}),args:{min:0,max:100,value:[20,50],onChange:p(),label:"Age",units:"years"}},g={render:r=>e.jsx(d,{...r}),args:{min:0,max:100,value:[20,50],onChange:p(),marks:[0,10,20,30,40,50,60,70,80,90,100]}},f={render:r=>e.jsx(d,{...r}),args:{min:0,max:100,value:[20,50],onChange:p(),marks:[0,10,20,30,40,50,60,70,80,90,100],shorthandUnits:"yr"}},x={render:r=>e.jsx(d,{...r}),args:{min:0,max:100,value:[20,50],onChange:p()}},b={render:r=>e.jsx(d,{...r}),args:{min:0,max:100,value:[20,50],onChange:p(),showSideInput:!1}};var T,q,k;h.parameters={...h.parameters,docs:{...(T=h.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn(),
    label: 'Age',
    units: 'years'
  }
}`,...(k=(q=h.parameters)==null?void 0:q.docs)==null?void 0:k.source}}};var V,W,R;g.parameters={...g.parameters,docs:{...(V=g.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn(),
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  }
}`,...(R=(W=g.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};var L,z,A;f.parameters={...f.parameters,docs:{...(L=f.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn(),
    marks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    shorthandUnits: 'yr'
  }
}`,...(A=(z=f.parameters)==null?void 0:z.docs)==null?void 0:A.source}}};var O,$,E;x.parameters={...x.parameters,docs:{...(O=x.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn()
  }
}`,...(E=($=x.parameters)==null?void 0:$.docs)==null?void 0:E.source}}};var _,M,U;b.parameters={...b.parameters,docs:{...(_=b.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: args => <InteractiveInputSliderRange {...args} />,
  args: {
    min: 0,
    max: 100,
    value: [20, 50],
    onChange: fn(),
    showSideInput: false
  }
}`,...(U=(M=b.parameters)==null?void 0:M.docs)==null?void 0:U.source}}};const oe=["Default","WithCustomTicks","WithTickLabels","WithoutLabel","WithoutLabelOrInput"];export{h as Default,g as WithCustomTicks,f as WithTickLabels,x as WithoutLabel,b as WithoutLabelOrInput,oe as __namedExportsOrder,le as default};
