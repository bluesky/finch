import './App.css';
import About from './pages/About';
import ContainerQServer from '@/components/QServer/ContainerQServer';
import Tiled from '../components/Tiled/Tiled';
import HubAppLayout from '@/components/HubAppLayout';
import BoltControl from '@/features/bolt/BoltControl';
import Paper from '@/components/Paper';
import BL531Control from './pages/BL531Control';
import TiledHeatmapSelector from '@/features/TiledHeatmapSelector';
import TiledLiveScanViewer from '@/components/TiledLiveScanViewer/TiledLiveScanViewer';

import { deviceIcons } from "@/assets/icons";


import { RouteItem } from '@/types/navigationRouterTypes';

import { House, Joystick, StackPlus, ImageSquare  } from "@phosphor-icons/react";

function App() {
  const routes:RouteItem[] = [
    {element:<About />, path: "/", label: "Beamstop", icon: deviceIcons.beamstopX},
    {element:<BL531Control/>, path: "/control", label: "Sample", icon: <Joystick size={32} />},
    {element:<ContainerQServer className="m-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] bg-white/50"/>, path: "/qserver", label: "Q Server", icon: <StackPlus size={32} />},
    {element:
      <>
        <Tiled />
        <TiledLiveScanViewer />
      </>
        ,
 
    path: "/data", 
    label: "Data", 
    icon: <ImageSquare size={32} />
    },
  ]
  return (
    <HubAppLayout routes={routes}/>
  )

}

export default App
