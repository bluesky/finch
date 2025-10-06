import{j as n}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as i}from"./index-DI2gBlDf.js";import"./blocks-DK4vCEwk.js";import{ap as s,aq as r}from"./index-DyZPM0Jo.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-CBw7k2Va.js";import"../sb-preview/runtime.js";import"./index-DLqyiFW5.js";import"./index-fNjTmf9T.js";import"./index-CXQShRbs.js";import"./index-DrFu-skq.js";const a=`# Install Finch with premade React configuration
If you want to try out Finch in as few steps as possible, clone down the Finch repo and use the components directly. This method also provides access to premade layouts with various examples.

For all install methods you will need node/npm, [instructions here](https://nodejs.org/en/download). 

\`\`\`bash
# Optionally check if you have npm and node first
# node -v
# npm -v

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
|   +-- App.tsx       # main application with routing to pages or components
|
+-- components        # individual components
|
+-- features          # more complex modules that utilize other components
|
+-- lib               # external library components from shadcn
|
+-- stories           # storybook documentation setup
\`\`\`

If you want to make edits or add pages, you will import from the components or features folder directly.

\`\`\`js
//Devices.tsx
import { useMemo } from "react";
import useOphydSocket from "@/hooks/useOphydSocket"; //import directly from @/hooks

import DeviceControllerBox from "@/components/DeviceControllerBox"; //import directly from @/components
import { deviceIcons } from "@/assets/icons"; //import directly from @/assets

export default function Devices() {
    const deviceNameList = useMemo(()=>['IOC:m1', 'IOC:m2', 'IOC:m3'], []);

    const { devices, handleSetValueRequest, toggleDeviceLock, toggleExpand } = useOphydSocket(deviceNameList);
    return (
        <div className="w-full h-full flex justify-center items-center py-12">
            <DeviceControllerBox 
                device={devices['IOC:m1']} 
                handleSetValueRequest={handleSetValueRequest} 
                handleLockClick={toggleDeviceLock} 
                svgIcon={deviceIcons.stepperMotor}
            />
        </div>
    )
}
\`\`\`

# Install Finch into Existing React App
If you have an existing React application and want to incorporate Finch components individually, go to your app directory and install Finch as a library from npm. Note React V19 is not currently supported when installed via npm.

\`\`\`bash
npm install @blueskyproject/finch
\`\`\`
This will download the components, hooks, styling, and types into the /node_modules folder and make them available in your project.

## Load a component
Example usage:

\`\`\`js
//App.tsx
import { Tiled } from '@blueskyproject/finch';
import '@blueskyproject/finch/style.css';

function App() {
  return (
    <Tiled tiledBaseUrl='http://customUrl:port/api/v1' />
  )
}
\`\`\`

You will only need to import \`@blueskyproject/finch/style.css\` once, so long as it is imported inside a component that is high enough in the React tree to be a parent of all Finch components.

## (Optional) Routing
To use the \`HubAppLayout\` component, the entire app should be wrapped in a react-router component. For compatibility reasons when building into Dash components, react-router-dom v6 is used instead of the newer v7.

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
\`\`\`

# Install Finch into a new React App
If you don't have a React app you can set one up using Vite, which we use in the development of Finch. The command below will ensure that React V18 is used, as React V19 is not currently supported.

\`\`\`bash
npm create vite@4 finch-test -- --template react-ts
cd finch-test
npm install

# Now you can install finch
npm install @blueskyproject/finch
\`\`\`

Then load a component and include the css file
\`\`\`js
//App.tsx
import { Tiled } from '@blueskyproject/finch';
import '@blueskyproject/finch/style.css';

function App() {
  return (
    <Tiled tiledBaseUrl='http://customUrl:port/api/v1' />
  )
}`;function o(e){return n.jsxs(n.Fragment,{children:[n.jsx(s,{title:"Documentation/Installation"}),`
`,n.jsx(r,{children:a})]})}function x(e={}){const{wrapper:t}={...i(),...e.components};return t?n.jsx(t,{...e,children:n.jsx(o,{...e})}):o()}export{x as default};
