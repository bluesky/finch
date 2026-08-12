import{j as q}from"./jsx-runtime-Cf8x2fCZ.js";import{H as o}from"./tiled.es-Dz0GvBTQ.js";import{a as i}from"./apiUtils-0_WGNbDr.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";const I=e=>{const k=i().httpBaseUrl,M=i().apiKey,B=e.tiledBaseUrl||k,T=e.apiKey||M;return q.jsx(o,{...e,tiledBaseUrl:B,apiKey:T??void 0})};try{o.displayName="Tiled",o.__docgenInfo={description:"",displayName:"Tiled",props:{onSelectCallback:{defaultValue:null,description:"Callback fired when a user selects an item, receives the item's selection data (links, structure, slice info, etc.).",name:"onSelectCallback",required:!1,type:{name:"((data: TiledItemSelectionData) => void)"}},apiKey:{defaultValue:null,description:"API key used to authenticate requests to the Tiled server. If omitted, the key is read from local storage.",name:"apiKey",required:!1,type:{name:"string"}},bearerToken:{defaultValue:null,description:"Bearer token used to authenticate requests to the Tiled server.",name:"bearerToken",required:!1,type:{name:"string"}},size:{defaultValue:null,description:"Overall size preset for the viewer UI. Defaults to `'small'`.",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},closeOnSelect:{defaultValue:null,description:"If true, the viewer closes itself after a selection is made. Defaults to `false`.",name:"closeOnSelect",required:!1,type:{name:"boolean"}},isPopup:{defaultValue:null,description:"Renders the viewer in popup-style chrome (e.g. with a close affordance).",name:"isPopup",required:!1,type:{name:"boolean"}},enableStartupScreen:{defaultValue:null,description:"When true, displays a startup screen prompting the user to enter / confirm the Tiled URL before loading. Defaults to `false`.",name:"enableStartupScreen",required:!1,type:{name:"boolean"}},tiledBaseUrl:{defaultValue:null,description:"Base URL of the Tiled server to connect to. Falls back to the default configured URL when omitted.",name:"tiledBaseUrl",required:!1,type:{name:"string"}},backgroundClassName:{defaultValue:null,description:"Additional className applied to the outer background wrapper.",name:"backgroundClassName",required:!1,type:{name:"string"}},singleColumnMode:{defaultValue:null,description:"When true, container navigation collapses into a single column instead of the Miller-column layout. Defaults to `false`.",name:"singleColumnMode",required:!1,type:{name:"boolean"}},contentClassName:{defaultValue:null,description:"Additional className applied to the main content wrapper.",name:"contentClassName",required:!1,type:{name:"string"}},expandedContentClassName:{defaultValue:null,description:"Additional className applied to the content wrapper when the viewer is expanded.",name:"expandedContentClassName",required:!1,type:{name:"string"}},isFullWidth:{defaultValue:null,description:"If true, the viewer renders at full width on mount. Defaults to `false`.",name:"isFullWidth",required:!1,type:{name:"boolean"}},isButtonMode:{defaultValue:null,description:"If true, the component renders as a button that opens the viewer on click. Defaults to `false`.",name:"isButtonMode",required:!1,type:{name:"boolean"}},inButtonModeShowApiKeyInput:{defaultValue:null,description:"In button mode, show the API-key input alongside the trigger button.",name:"inButtonModeShowApiKeyInput",required:!1,type:{name:"boolean"}},inButtonModeShowReverseSortInput:{defaultValue:null,description:"In button mode, show the reverse-sort toggle alongside the trigger button.",name:"inButtonModeShowReverseSortInput",required:!1,type:{name:"boolean"}},inButtonModeShowSelectedData:{defaultValue:null,description:"In button mode, render a panel showing the currently selected data.",name:"inButtonModeShowSelectedData",required:!1,type:{name:"boolean"}},buttonModeText:{defaultValue:null,description:'Label text for the trigger button in button mode. Defaults to `"Select Data"`.',name:"buttonModeText",required:!1,type:{name:"string"}},reverseSort:{defaultValue:null,description:"Sort listings in descending order (newest first). Defaults to `true`.",name:"reverseSort",required:!1,type:{name:"boolean"}},initialPath:{defaultValue:null,description:'Path within the Tiled tree to open on mount (e.g. `"my/dataset"`).',name:"initialPath",required:!1,type:{name:"string"}},showPlanName:{defaultValue:null,description:"When true, show the Bluesky `plan_name` next to each item in the listing if available.",name:"showPlanName",required:!1,type:{name:"boolean"}},showPlanStartTime:{defaultValue:null,description:"When true, show the Bluesky run start time next to each item in the listing if available.",name:"showPlanStartTime",required:!1,type:{name:"boolean"}},pageLimit:{defaultValue:null,description:"Number of items to fetch per page when listing a container.",name:"pageLimit",required:!1,type:{name:"number"}},reloadLastItemOnStartup:{defaultValue:null,description:"When true, restore the last visited item from local storage on startup.",name:"reloadLastItemOnStartup",required:!1,type:{name:"boolean"}},includeAuthTokensInSelectCallback:{defaultValue:null,description:"When true, the active access and refresh tokens are included in the `onSelectCallback` payload. Defaults to `false`.",name:"includeAuthTokensInSelectCallback",required:!1,type:{name:"boolean"}},oidcRedirectUrl:{defaultValue:null,description:"Redirect URL passed through to the OIDC login flow.",name:"oidcRedirectUrl",required:!1,type:{name:"string"}},displayMode:{defaultValue:null,description:"How container contents are laid out: `'columns'` for the Miller-column layout, `'rows'` for a single indented list. Defaults to `'columns'`.",name:"displayMode",required:!1,type:{name:"enum",value:[{value:'"columns"'},{value:'"rows"'}]}},buttonClassName:{defaultValue:null,description:"Applies additoinal CSS classes to the button when in button mode only",name:"buttonClassName",required:!1,type:{name:"string"}}}}}catch{}const L={title:"Bluesky Components/Tiled",component:I,parameters:{layout:"fullscreen"},tags:["autodocs"],argTypes:{}},t={args:{reverseSort:!1,enableStartupScreen:!1,size:"medium",tiledBaseUrl:"https://tiled-demo.nsls2.bnl.gov/api/v1",onSelectCallback:e=>console.log("Selected Tiled link:",e.self),isButtonMode:!1,isPopup:!1,singleColumnMode:!1,isFullWidth:!1,buttonModeText:void 0,apiKey:void 0,bearerToken:void 0,closeOnSelect:!1,backgroundClassName:void 0,buttonClassName:void 0,contentClassName:void 0,displayMode:"columns",expandedContentClassName:void 0,initialPath:void 0,oidcRedirectUrl:void 0,pageLimit:void 0,showPlanName:!0,showPlanStartTime:!0,reloadLastItemOnStartup:!1,inButtonModeShowApiKeyInput:!1,inButtonModeShowReverseSortInput:!1,inButtonModeShowSelectedData:!1,includeAuthTokensInSelectCallback:!1}},a={args:{tiledBaseUrl:"https://tiled-demo.nsls2.bnl.gov/api/v1",displayMode:"rows",size:"medium"}},n={args:{size:"medium"}},l={args:{enableStartupScreen:!0,size:"medium"}},s={args:{isButtonMode:!0,size:"medium",tiledBaseUrl:"https://tiled-demo.nsls2.bnl.gov/api/v1",reverseSort:!1}};var r,d,u;t.parameters={...t.parameters,docs:{...(r=t.parameters)==null?void 0:r.docs,source:{originalSource:`{
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
}`,...(u=(d=t.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var m,c,p;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
    displayMode: 'rows',
    size: 'medium'
  }
}`,...(p=(c=a.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var f,h,g;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    size: 'medium'
  }
}`,...(g=(h=n.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var S,b,y;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    enableStartupScreen: true,
    size: 'medium'
  }
}`,...(y=(b=l.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var v,w,C;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    isButtonMode: true,
    size: 'medium',
    tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
    reverseSort: false
  }
}`,...(C=(w=s.parameters)==null?void 0:w.docs)==null?void 0:C.source}}};const R=["Primary","SingleListMode","LocalHostUrl","CustomUrl","ButtonMode"];export{s as ButtonMode,l as CustomUrl,n as LocalHostUrl,t as Primary,a as SingleListMode,R as __namedExportsOrder,L as default};
