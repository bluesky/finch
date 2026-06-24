import{j as w}from"./jsx-runtime-Cf8x2fCZ.js";import{H as z}from"./tiled.es-BQAa3tk2.js";import{u as r}from"./apiUtils-2xt_lHkl.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";const y=e=>{const C=r().httpBaseUrl,T=r().apiKey,U=e.tiledBaseUrl||C,k=e.apiKey||T;return w.jsx(z,{...e,tiledBaseUrl:U,apiKey:k??void 0})};y.__docgenInfo={description:"",methods:[],displayName:"TiledWrapper"};const O={title:"Bluesky Components/Tiled",component:y,parameters:{layout:"fullscreen"},tags:["autodocs"],argTypes:{}},s={args:{reverseSort:!1,enableStartupScreen:!1,size:"medium",tiledBaseUrl:"https://tiled-demo.nsls2.bnl.gov/api/v1",onSelectCallback:e=>console.log("Selected Tiled link:",e.self),isButtonMode:!1,isPopup:!1,singleColumnMode:!1,isFullWidth:!1,buttonModeText:void 0,apiKey:void 0,bearerToken:void 0,closeOnSelect:!1,backgroundClassName:void 0,buttonClassName:void 0,contentClassName:void 0,displayMode:"columns",expandedContentClassName:void 0,initialPath:void 0,oidcRedirectUrl:void 0,pageLimit:void 0,showPlanName:!0,showPlanStartTime:!0,reloadLastItemOnStartup:!1,inButtonModeShowApiKeyInput:!1,inButtonModeShowReverseSortInput:!1,inButtonModeShowSelectedData:!1,includeAuthTokensInSelectCallback:!1}},t={args:{tiledBaseUrl:"https://tiled-demo.nsls2.bnl.gov/api/v1",displayMode:"rows",size:"medium"}},n={args:{size:"medium"}},a={args:{enableStartupScreen:!0,size:"medium"}},o={args:{isButtonMode:!0,size:"medium",tiledBaseUrl:"https://tiled-demo.nsls2.bnl.gov/api/v1",reverseSort:!1}};var l,i,d;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    reverseSort: false,
    enableStartupScreen: false,
    size: 'medium',
    tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
    onSelectCallback: links => console.log('Selected Tiled link:', links.self),
    isButtonMode: false,
    isPopup: false,
    singleColumnMode: false,
    isFullWidth: false,
    buttonModeText: undefined,
    apiKey: undefined,
    bearerToken: undefined,
    closeOnSelect: false,
    backgroundClassName: undefined,
    buttonClassName: undefined,
    contentClassName: undefined,
    displayMode: 'columns',
    expandedContentClassName: undefined,
    initialPath: undefined,
    oidcRedirectUrl: undefined,
    pageLimit: undefined,
    showPlanName: true,
    showPlanStartTime: true,
    reloadLastItemOnStartup: false,
    inButtonModeShowApiKeyInput: false,
    inButtonModeShowReverseSortInput: false,
    inButtonModeShowSelectedData: false,
    includeAuthTokensInSelectCallback: false
  }
}`,...(d=(i=s.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var u,m,c;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
    displayMode: 'rows',
    size: 'medium'
  }
}`,...(c=(m=t.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var p,f,S;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    size: 'medium'
  }
}`,...(S=(f=n.parameters)==null?void 0:f.docs)==null?void 0:S.source}}};var g,v,h;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    enableStartupScreen: true,
    size: 'medium'
  }
}`,...(h=(v=a.parameters)==null?void 0:v.docs)==null?void 0:h.source}}};var b,B,M;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    isButtonMode: true,
    size: 'medium',
    tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
    reverseSort: false
  }
}`,...(M=(B=o.parameters)==null?void 0:B.docs)==null?void 0:M.source}}};const R=["Primary","SingleListMode","LocalHostUrl","CustomUrl","ButtonMode"];export{o as ButtonMode,a as CustomUrl,n as LocalHostUrl,s as Primary,t as SingleListMode,R as __namedExportsOrder,O as default};
