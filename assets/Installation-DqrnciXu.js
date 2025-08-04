import{j as n}from"./jsx-runtime-BjgbQsUx.js";import{useMDXComponents as r}from"./index-BFB5bZRa.js";import{ao as i,ap as s}from"./index-DcqR4hJf.js";import"./index-D2MAbzvX.js";import"./index-BuYn5Wpo.js";import"./iframe-jTa9vu_b.js";import"../sb-preview/runtime.js";import"./index-DbGbYaLN.js";import"./index-CTOC-uzv.js";import"./index-CHGET4sZ.js";import"./index-DrFu-skq.js";const a=`# Installation
Assuming you have an existing React application, go to your app directory and install Finch.

\`\`\`bash
npm install @blueskyproject/finch
\`\`\`

### (Optional) Create your own React app
If you don't have a React app you can set one up using Vite, which we use in the development of Finch.

\`\`\`bash
npm create vite@latest finch-test
# Follow the on screen prompts, select React and Javascript/Typescript
\`\`\`

\`\`\`bash

cd finch-test
npm install

# Now you can install finch
npm install @blueskyproject/finch
\`\`\`

# Load a component
Example usage:

\`\`\`js
//App.tsx
import { Tiled } from '@blueskyproject/finch';
import '@blueskyproject/finch/style.css';

function App() {
  return (
    <Tiled tiledBaseUrl='http://customUrl:port/api/v1'>
  )
}
\`\`\`

You will only need to import '@blueskyproject/finch/style.css' once, so long as it is imported inside a component that is high enough in the React tree to include all finch components.

## (Optional) Routing
To use the \`HubAppLayout\` component, the entire app should be wrapped in a react-router component. For compatibility reasons when building into Dash components, react-router-dom V6 is used instead of v7.

\`\`\`js
//main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './app/index.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
)
\`\`\``,{deprecate:p}=__STORYBOOK_MODULE_CLIENT_LOGGER__;p("Import from '@storybook/addon-docs/blocks' is deprecated. Please import from '@storybook/blocks' instead.");function e(t){return n.jsxs(n.Fragment,{children:[n.jsx(i,{title:"Documentation/Installation"}),`
`,n.jsx(s,{children:a})]})}function R(t={}){const{wrapper:o}={...r(),...t.components};return o?n.jsx(o,{...t,children:n.jsx(e,{...t})}):e()}export{R as default};
