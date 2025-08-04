import{f as j}from"./index-Dj6nxAlZ.js";import{j as i}from"./jsx-runtime-BjgbQsUx.js";import"./index-D2MAbzvX.js";function T({cb:C=()=>{},text:w="",bgColor:S="bg-sky-500",hoverBgColor:$="hover:bg-sky-600",textColor:k="text-white",styles:q="",disabled:o=!1,size:l="medium",isSecondary:n,...B}){const V=e=>{e.preventDefault(),C(e)},z={small:"text-sm",medium:"text-md",large:"text-2xl"},N={small:"px-3 py-1",medium:"px-3 py-2",large:"px-6 py-3"};return i.jsx("button",{disabled:o,className:`
                rounded-xl  font-medium w-fit
                ${n?"bg-transparent text-black border":`${S} ${k}`}
                ${o?"hover:cursor-not-allowed":`${n?"secondaryHoverBgColor":$} hover:cursor-pointer`} 
                ${z[l]} 
                ${N[l]} 
                ${q}
            `,onClick:e=>V(e),...B,children:i.jsx("p",{children:w})})}T.__docgenInfo={description:"",methods:[],displayName:"Button",props:{cb:{required:!1,tsType:{name:"Function"},description:"callback function on click",defaultValue:{value:"() => {}",computed:!1}},text:{required:!1,tsType:{name:"string"},description:"text inside button",defaultValue:{value:"''",computed:!1}},bgColor:{required:!1,tsType:{name:"literal",value:"`bg-${string}`"},description:"Tailwind ClassName",defaultValue:{value:"'bg-sky-500'",computed:!1}},hoverBgColor:{required:!1,tsType:{name:"literal",value:"`hover:bg-${string}`"},description:"Tailwind ClassName",defaultValue:{value:"'hover:bg-sky-600'",computed:!1}},textColor:{required:!1,tsType:{name:"literal",value:"`text-${string}`"},description:"Tailwind ClassName",defaultValue:{value:"'text-white'",computed:!1}},styles:{required:!1,tsType:{name:"string"},description:"Extra Tailwind ClassNames applied to button component",defaultValue:{value:"''",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"Boolean that prevents the user from clicking or causing hover effects when true",defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'small' | 'medium' | 'large'",elements:[{name:"literal",value:"'small'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'large'"}]},description:"How large is the button",defaultValue:{value:"'medium'",computed:!1}},isSecondary:{required:!1,tsType:{name:"boolean"},description:"Should the button style default to hollow color with black text?"}}};const D={title:"General Components/Button",component:T,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{},args:{cb:j()}},a={args:{text:"primary"}},r={args:{text:"secondary",isSecondary:!0}},t={args:{text:"large",size:"large"}},s={args:{text:"small",size:"small"}};var u,c,d;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    text: 'primary'
  }
}`,...(d=(c=a.parameters)==null?void 0:c.docs)==null?void 0:d.source}}};var m,p,g;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    text: 'secondary',
    isSecondary: true
  }
}`,...(g=(p=r.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var f,y,x;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    text: 'large',
    size: 'large'
  }
}`,...(x=(y=t.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var v,b,h;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    text: 'small',
    size: 'small'
  }
}`,...(h=(b=s.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};const F=["Primary","Secondary","Large","Small"];export{t as Large,a as Primary,r as Secondary,s as Small,F as __namedExportsOrder,D as default};
