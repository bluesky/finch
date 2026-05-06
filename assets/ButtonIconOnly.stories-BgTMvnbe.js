import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{c as b}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";const s={primary:"bg-sky-500 hover:bg-sky-600",primaryActive:"bg-sky-700 hover:bg-sky-800 border-sky-700 border",secondary:"bg-white border-slate-300 border hover:bg-slate-100",secondaryActive:"bg-slate-200 border-slate-300 border hover:bg-slate-300"},H=(t,a)=>t&&a?s.secondaryActive:t?s.primaryActive:a?s.secondary:s.primary;function M({icon:t,className:a,classNameIcon:D,onClick:u,disabled:p,isSecondary:m,active:g,...O}){const _=y=>{y.preventDefault(),u&&u(y)};return e.jsx("button",{"aria-pressed":g,className:b(`${H(g,m)} rounded-sm px-2 py-1 ${p?"opacity-50 cursor-not-allowed":""}`,a),onClick:_,disabled:p,...O,children:e.jsx("span",{className:b(`${m?"text-black":"text-white"}`,D),children:t})})}M.__docgenInfo={description:"",methods:[],displayName:"ButtonIconOnly",props:{icon:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"JSX element displayed as the button content - typically an SVG icon"},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the button container. To override colors, pass Tailwind classes (e.g. `bg-orange-500 hover:bg-orange-600`)."},classNameIcon:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the icon element"},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(event: React.MouseEvent<HTMLButtonElement>) => void",signature:{arguments:[{type:{name:"ReactMouseEvent",raw:"React.MouseEvent<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},name:"event"}],return:{name:"void"}}},description:"Callback function triggered when button is clicked"},disabled:{required:!1,tsType:{name:"boolean"},description:"Disables the button and prevents user interaction when true"},isSecondary:{required:!1,tsType:{name:"boolean"},description:"Changes button style to white background with border instead of primary blue when true"},active:{required:!1,tsType:{name:"boolean"},description:"Renders the button in a pressed/active state"}}};const r=()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor",width:16,height:16,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"})}),V={title:"General Components/ButtonIconOnly",component:M,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{}},n={args:{icon:e.jsx(r,{})}},o={args:{icon:e.jsx(r,{}),isSecondary:!0}},c={args:{icon:e.jsx(r,{}),active:!0}},i={args:{icon:e.jsx(r,{}),active:!0,isSecondary:!0}},d={args:{icon:e.jsx(r,{}),disabled:!0}},l={args:{icon:e.jsx(r,{}),className:"bg-orange-500 hover:bg-orange-600"}};var v,h,S;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    icon: <StarIcon />
  }
}`,...(S=(h=n.parameters)==null?void 0:h.docs)==null?void 0:S.source}}};var f,x,w;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    icon: <StarIcon />,
    isSecondary: true
  }
}`,...(w=(x=o.parameters)==null?void 0:x.docs)==null?void 0:w.source}}};var k,j,C;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    icon: <StarIcon />,
    active: true
  }
}`,...(C=(j=c.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};var T,I,A;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    icon: <StarIcon />,
    active: true,
    isSecondary: true
  }
}`,...(A=(I=i.parameters)==null?void 0:I.docs)==null?void 0:A.source}}};var N,R,B;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    icon: <StarIcon />,
    disabled: true
  }
}`,...(B=(R=d.parameters)==null?void 0:R.docs)==null?void 0:B.source}}};var E,q,L;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    icon: <StarIcon />,
    className: 'bg-orange-500 hover:bg-orange-600'
  }
}`,...(L=(q=l.parameters)==null?void 0:q.docs)==null?void 0:L.source}}};const J=["Primary","Secondary","Active","ActiveSecondary","Disabled","CustomColors"];export{c as Active,i as ActiveSecondary,l as CustomColors,d as Disabled,n as Primary,o as Secondary,J as __namedExportsOrder,V as default};
