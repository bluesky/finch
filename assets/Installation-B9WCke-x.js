import{j as n}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as i}from"./index-DI2gBlDf.js";import"./blocks-qd6djiaP.js";import{ap as r,aq as p}from"./index-2z_kEcIj.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-C9HYSyIG.js";import"../sb-preview/runtime.js";import"./index-DLqyiFW5.js";import"./index-fNjTmf9T.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const a=`# Installation
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
\`\`\``;function e(t){return n.jsxs(n.Fragment,{children:[n.jsx(r,{title:"Documentation/Installation"}),`
`,n.jsx(p,{children:a})]})}function b(t={}){const{wrapper:o}={...i(),...t.components};return o?n.jsx(o,{...t,children:n.jsx(e,{...t})}):e()}export{b as default};
