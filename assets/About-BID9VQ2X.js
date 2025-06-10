import{j as e}from"./jsx-runtime-BjgbQsUx.js";import{useMDXComponents as o}from"./index-BFB5bZRa.js";import{ao as s}from"./index-DSjZj-4I.js";import"./index-D2MAbzvX.js";import"./index-BuYn5Wpo.js";import"./iframe-BOLwAkjk.js";import"../sb-preview/runtime.js";import"./index-D3Kh2uYK.js";import"./index-CTOC-uzv.js";import"./index-CHGET4sZ.js";import"./index-DrFu-skq.js";const a="/finch/assets/finchCompatibility-XDzZEP_M.png",r="/finch/assets/finchConstruction-BabmIyTD.png",c="/finch/assets/finchCommunication-BMaKN-fj.png";function i(n){return e.jsxs(e.Fragment,{children:[e.jsx(s,{title:"About"}),`
`,e.jsxs("div",{className:"mainContainer",children:[e.jsx("img",{src:r,alt:"bird logo",className:"banner"}),e.jsx("p",{children:"Finch UI is a set of web components for beamline controls, analysis, and data acquisition. It relies on Bluesky for backend services that integrate with your beamline. Our primary goal is to make it easier to provide Bluesky functionality to end users through convenient web browser interfaces."}),e.jsxs("section",{className:"",children:[e.jsx("h2",{className:"",children:"Bluesky Integration"}),e.jsx("img",{src:c,alt:"diagram of technologies",className:"banner "}),e.jsx("p",{children:"Finch UI makes http requests and websocket connections to Tiled, Ophyd Websocket, and the Queue Server. Without additional configuration, components will make requests to the default ports for each service assumed to be running on localhost.    "})]}),e.jsxs("section",{className:"",children:[e.jsx("h2",{className:"",children:"Compatibility"}),e.jsx("img",{src:a,alt:"various ui logos",className:"banner "}),e.jsx("p",{children:"For React developers that want to use another external component library (MUI, ChakraUI, Mantine, etc) there should be no major compatibility issues when loading in a Finch component. While Finch does provide layout templates, a global Finch wrapper around your app is not required to use individual components. "}),e.jsx("p",{children:"Components come styled with Tailwind base classes, which generally don’t conflict with existing style names from popular UI component libraries. "})]})]}),`
`,e.jsx("style",{children:`
  .banner {
    max-width: 650px;
    margin: auto;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .diagram {
    width: 650px;
  }

  .mainContainer {
    max-width: 700px;
    margin: auto;
    height: 100%;
    display: flex;
    gap: 2rem;
    flex-direction: column;
  }

  section {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
`})]})}function j(n={}){const{wrapper:t}={...o(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i()}export{j as default};
