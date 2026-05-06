import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{f as Z}from"./index-BkdlOIaJ.js";import{c as b}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";const n={primary:"bg-sky-500 hover:bg-sky-600 text-white",primaryActive:"bg-sky-700 text-white hover:bg-sky-800",secondary:"bg-white/50 hover:bg-slate-200 text-black border",secondaryActive:"bg-slate-200 text-black border hover:bg-slate-300"},ee=(a,s)=>a&&s?n.secondaryActive:a?n.primaryActive:s?n.secondary:n.primary,te={small:"text-sm",medium:"text-md",large:"text-2xl"},ae={small:"w-4",medium:"w-6",large:"w-8"},se={small:"px-3 py-1",medium:"px-3 py-2",large:"px-6 py-3"},re={small:"space-x-1",medium:"space-x-2",large:"space-x-4"};function G({cb:a=()=>{},onClick:s=()=>{},text:J="",disabled:g=!1,icon:X,iconPosition:x="left",size:r="medium",isSecondary:f,active:y,className:O,classNameText:K,classNameIcon:Q,...U}){const Y=h=>{h.preventDefault(),a&&a(),s&&s(h)},v=e.jsx("div",{className:b(`${ae[r]} ${f?"text-black":"text-white"} aspect-square `,Q),children:X});return e.jsx("button",{"aria-pressed":y,disabled:g,className:b(`
                ${ee(y,f)}
                ${g?"opacity-50 cursor-not-allowed":""}
                ${te[r]}
                ${se[r]}
                rounded-lg font-medium w-fit`,O),onClick:Y,...U,children:e.jsxs("div",{className:`${re[r]} flex justify-center items-center`,children:[x==="left"?v:"",e.jsx("p",{className:K,children:J}),x==="right"?v:""]})})}G.__docgenInfo={description:"",methods:[],displayName:"ButtonWithIcon",props:{onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(event: React.MouseEvent<HTMLButtonElement>) => void",signature:{arguments:[{type:{name:"ReactMouseEvent",raw:"React.MouseEvent<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},name:"event"}],return:{name:"void"}}},description:"Callback function triggered when button is clicked",defaultValue:{value:"() => {}",computed:!1}},text:{required:!1,tsType:{name:"string"},description:"Text content displayed inside the button alongside the icon",defaultValue:{value:"''",computed:!1}},styles:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the button component"},disabled:{required:!1,tsType:{name:"boolean"},description:"Disables the button and prevents user interaction when true",defaultValue:{value:"false",computed:!1}},icon:{required:!0,tsType:{name:"JSX.Element"},description:"JSX element displayed as an icon - works best with SVG elements for proper styling"},iconPosition:{required:!1,tsType:{name:"union",raw:"'left' | 'right'",elements:[{name:"literal",value:"'left'"},{name:"literal",value:"'right'"}]},description:"Controls whether the icon appears on the left or right side of the text",defaultValue:{value:"'left'",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'small' | 'medium' | 'large'",elements:[{name:"literal",value:"'small'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'large'"}]},description:"Controls the overall size of the button - affects text size, icon size, and padding",defaultValue:{value:"'medium'",computed:!1}},isSecondary:{required:!1,tsType:{name:"boolean"},description:"Changes button style to transparent background with border and black text when true"},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the button container. To override colors, pass Tailwind classes (e.g. `bg-orange-500 hover:bg-orange-600 text-white`)."},classNameText:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the button text element"},classNameIcon:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the icon element"},active:{required:!1,tsType:{name:"boolean"},description:"Renders the button in a pressed/active state"},cb:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Legacy callback function, use onClick instead",defaultValue:{value:"() => {}",computed:!1}}}};const t=()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"})}),le={title:"General Components/ButtonWithIcon",component:G,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{},args:{cb:Z()}},o={args:{text:"Primary",icon:e.jsx(t,{})}},i={args:{text:"Secondary",isSecondary:!0,icon:e.jsx(t,{})}},c={args:{text:"Active",active:!0,icon:e.jsx(t,{})}},l={args:{text:"Active Secondary",active:!0,isSecondary:!0,icon:e.jsx(t,{})}},d={args:{text:"Disabled",disabled:!0,icon:e.jsx(t,{})}},m={args:{text:"Custom Colors",className:"bg-orange-500 hover:bg-orange-600 text-white",icon:e.jsx(t,{})}},u={args:{size:"large",text:"Large",icon:e.jsx(t,{})}},p={args:{size:"small",text:"Small",icon:e.jsx(t,{})}};var S,w,k;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    text: 'Primary',
    icon: <FlaskIcon />
  }
}`,...(k=(w=o.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};var C,T,j;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    text: 'Secondary',
    isSecondary: true,
    icon: <FlaskIcon />
  }
}`,...(j=(T=i.parameters)==null?void 0:T.docs)==null?void 0:j.source}}};var A,I,q;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    text: 'Active',
    active: true,
    icon: <FlaskIcon />
  }
}`,...(q=(I=c.parameters)==null?void 0:I.docs)==null?void 0:q.source}}};var L,M,N;l.parameters={...l.parameters,docs:{...(L=l.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    text: 'Active Secondary',
    active: true,
    isSecondary: true,
    icon: <FlaskIcon />
  }
}`,...(N=(M=l.parameters)==null?void 0:M.docs)==null?void 0:N.source}}};var z,E,F;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    text: 'Disabled',
    disabled: true,
    icon: <FlaskIcon />
  }
}`,...(F=(E=d.parameters)==null?void 0:E.docs)==null?void 0:F.source}}};var B,V,$;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    text: 'Custom Colors',
    className: 'bg-orange-500 hover:bg-orange-600 text-white',
    icon: <FlaskIcon />
  }
}`,...($=(V=m.parameters)==null?void 0:V.docs)==null?void 0:$.source}}};var D,R,P;u.parameters={...u.parameters,docs:{...(D=u.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    size: 'large',
    text: 'Large',
    icon: <FlaskIcon />
  }
}`,...(P=(R=u.parameters)==null?void 0:R.docs)==null?void 0:P.source}}};var W,_,H;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    size: 'small',
    text: 'Small',
    icon: <FlaskIcon />
  }
}`,...(H=(_=p.parameters)==null?void 0:_.docs)==null?void 0:H.source}}};const de=["Primary","Secondary","Active","ActiveSecondary","Disabled","CustomColors","Large","Small"];export{c as Active,l as ActiveSecondary,m as CustomColors,d as Disabled,u as Large,o as Primary,i as Secondary,p as Small,de as __namedExportsOrder,le as default};
