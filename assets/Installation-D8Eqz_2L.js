import{j as n}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as i}from"./index-DI2gBlDf.js";import"./blocks-B19T8d9-.js";import{W as r,a5 as a}from"./index-D0tn-N0q.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-U_WlO_lp.js";import"../sb-preview/runtime.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";import"./index-cS34vJOP.js";import"./index-DrFu-skq.js";const s=`# Installation
Finch can be installed into existing React applications or cloned directly. For all install methods you will need node/npm, [instructions here](https://nodejs.org/en/download). 

\`\`\`bash
# Optionally check if you have npm and node first
node -v
npm -v
\`\`\`
## Option #1: Clone Finch Repository
If you want to try out Finch in as few steps as possible, clone down the Finch repo and try creating your own pages with direct use of components.


\`\`\`bash
git clone https://github.com/bluesky/finch.git
cd finch
npm install
npm run dev
\`\`\`
The app should be running at [http://localhost:5173/](http://localhost:5173/)

Layouts are rendered from \`src/app/App.tsx\`, a partial project structure is shown below:

\`\`\`sh
src
|
+-- app               
|   |                 
|   +-- pages         # full layouts comprised of features or components
|   +-- App.tsx       # main application with routing to pages
|
+-- components        # individual components
|
+-- features          # more complex modules that utilize other components
\`\`\`

## Option #2: Install into your React app with NPM
If you have an existing React application and want to incorporate Finch components individually, go to your app directory and install Finch as a library from npm. Note React V19 is not currently supported when installed via npm.

\`\`\`bash
npm install @blueskyproject/finch
\`\`\`
This will download the components, hooks, styling, and types into the /node_modules folder and make them available in your project.

\`\`\`js
//main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FinchConfigProvider } from '@blueskyproject/finch'
import '@blueskyproject/finch/style.css'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FinchConfigProvider config={{
          tiledApiUrl: 'http://localhost:8000/api/v1',
          ophydApiUrl: 'http://localhost:8001/api/v1',
          qServerApiUrl: 'http://localhost:60610/api',
          qServerApiKey: 'test',
        }}>
          <App /> //<-- add any finch components here and they'll work!
        </FinchConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
\`\`\`
Most Finch components and all data-fetching hooks require three providers. Wrap your application root as shown below. See the **Configuration** page for the full list of \`FinchConfigProvider\` options.

- **\`QueryClientProvider\`** — Required for queue server and tiled data-fetching hooks.
- **\`BrowserRouter\`** — Optional - only required by routing-based components such as \`HubAppLayout\`.
- **\`FinchConfigProvider\`** — Optional distributes backend URLs and API keys to all Finch components.

  You will only need to import \`@blueskyproject/finch/style.css\` once, so long as it is imported inside a component that is high enough in the React tree to be a parent of all Finch components.
### Load a component
Example usage:

\`\`\`js
//App.tsx
import { Tiled } from '@blueskyproject/finch';

function App() {
  return (
    <Tiled tiledBaseUrl='http://customUrl:port/api/v1' />
  )
}
\`\`\`



## Option #3: Create a new React app with Finch
If you don't have a React app you can set one up using Vite, which we use in the development of Finch. The command below will ensure that React V18 is used, as React V19 is not currently supported.

\`\`\`bash
npm create vite@4 finch-test -- --template react-ts
cd finch-test
npm install

# Now you can install finch
npm install @blueskyproject/finch
\`\`\`

Now you can modify your \`main.tsx\` and \`app.tsx\` as shown in Option #2 above.`;function o(t){return n.jsxs(n.Fragment,{children:[n.jsx(r,{title:"Documentation/Installation"}),`
`,n.jsx(a,{children:s})]})}function b(t={}){const{wrapper:e}={...i(),...t.components};return e?n.jsx(e,{...t,children:n.jsx(o,{...t})}):o()}export{b as default};
