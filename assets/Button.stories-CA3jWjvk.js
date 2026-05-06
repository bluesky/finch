import{f as K}from"./index-BkdlOIaJ.js";import{j as y}from"./jsx-runtime-Cf8x2fCZ.js";import{c as Q}from"./utils-DuMXYCiK.js";import"./index-yBjzXJbu.js";const a={primary:"bg-sky-500 text-white hover:bg-sky-600",primaryActive:"bg-sky-700 text-white hover:bg-sky-800",secondary:"bg-transparent hover:bg-slate-100 text-black border",secondaryActive:"bg-slate-200 text-black border hover:bg-slate-300"},U=(e,t)=>e&&t?a.secondaryActive:e?a.primaryActive:t?a.secondary:a.primary,W={small:"text-sm",medium:"text-md",large:"text-2xl"},X={small:"px-3 py-1",medium:"px-3 py-2",large:"px-6 py-3"};function H({cb:e=()=>{},onClick:t=()=>{},text:P="",disabled:u=!1,size:m="medium",isSecondary:G,active:p,className:I,classNameText:O,...F}){const J=g=>{g.preventDefault(),e&&e(),t&&t(g)};return y.jsx("button",{"aria-pressed":p,disabled:u,className:Q(`
                rounded-xl font-medium w-fit
                ${U(p,G)}
                ${u?"opacity-50 cursor-not-allowed":""}
                ${W[m]}
                ${X[m]}
            `,I),onClick:J,...F,children:y.jsx("p",{className:O,children:P})})}H.__docgenInfo={description:"",methods:[],displayName:"Button",props:{onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(event: React.MouseEvent<HTMLButtonElement>)=>void",signature:{arguments:[{type:{name:"ReactMouseEvent",raw:"React.MouseEvent<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},name:"event"}],return:{name:"void"}}},description:"Callback function triggered when button is clicked",defaultValue:{value:"() => {}",computed:!1}},text:{required:!1,tsType:{name:"string"},description:"Text content displayed inside the button",defaultValue:{value:"''",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"Disables the button and prevents user interaction when true",defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'small' | 'medium' | 'large'",elements:[{name:"literal",value:"'small'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'large'"}]},description:"Controls the size of the button - affects text size and padding",defaultValue:{value:"'medium'",computed:!1}},isSecondary:{required:!1,tsType:{name:"boolean"},description:"Changes button style to transparent background with border and black text when true"},active:{required:!1,tsType:{name:"boolean"},description:"Renders the button in a pressed/active state"},className:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the button container. To override colors, pass Tailwind classes (e.g. `bg-orange-500 hover:bg-orange-600 text-white`)."},classNameText:{required:!1,tsType:{name:"string"},description:"Additional CSS classes applied to the button text element"},cb:{required:!1,tsType:{name:"signature",type:"function",raw:"()=>void",signature:{arguments:[],return:{name:"void"}}},description:"Legacy callback function, use onClick instead",defaultValue:{value:"() => {}",computed:!1}}}};const ae={title:"General Components/Button",component:H,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{},args:{cb:K()}},r={args:{text:"primary"}},s={args:{text:"secondary",isSecondary:!0}},n={args:{text:"large",size:"large"}},o={args:{text:"small",size:"small"}},i={args:{text:"active",active:!0}},c={args:{text:"active secondary",active:!0,isSecondary:!0}},l={args:{text:"disabled",disabled:!0}},d={args:{text:"custom colors",className:"bg-orange-500 hover:bg-orange-600 text-white"}};var b,f,x;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    text: 'primary'
  }
}`,...(x=(f=r.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var v,h,S;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    text: 'secondary',
    isSecondary: true
  }
}`,...(S=(h=s.parameters)==null?void 0:h.docs)==null?void 0:S.source}}};var T,w,k;n.parameters={...n.parameters,docs:{...(T=n.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    text: 'large',
    size: 'large'
  }
}`,...(k=(w=n.parameters)==null?void 0:w.docs)==null?void 0:k.source}}};var C,A,q;o.parameters={...o.parameters,docs:{...(C=o.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    text: 'small',
    size: 'small'
  }
}`,...(q=(A=o.parameters)==null?void 0:A.docs)==null?void 0:q.source}}};var z,E,B;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    text: 'active',
    active: true
  }
}`,...(B=(E=i.parameters)==null?void 0:E.docs)==null?void 0:B.source}}};var N,L,M;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    text: 'active secondary',
    active: true,
    isSecondary: true
  }
}`,...(M=(L=c.parameters)==null?void 0:L.docs)==null?void 0:M.source}}};var V,R,j;l.parameters={...l.parameters,docs:{...(V=l.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    text: 'disabled',
    disabled: true
  }
}`,...(j=(R=l.parameters)==null?void 0:R.docs)==null?void 0:j.source}}};var D,_,$;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    text: 'custom colors',
    className: 'bg-orange-500 hover:bg-orange-600 text-white'
  }
}`,...($=(_=d.parameters)==null?void 0:_.docs)==null?void 0:$.source}}};const re=["Primary","Secondary","Large","Small","Active","ActiveSecondary","Disabled","CustomColors"];export{i as Active,c as ActiveSecondary,d as CustomColors,l as Disabled,n as Large,r as Primary,s as Secondary,o as Small,re as __namedExportsOrder,ae as default};
