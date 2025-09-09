import './App.css';
import About from './pages/About';
import ContainerQServer from '@/components/QServer/ContainerQServer';
import HubAppLayout from '@/components/HubAppLayout';
import BoltControl from '@/features/bolt/BoltControl';
import Paper from '@/components/Paper';
import BL531Control from './pages/BL531Control';
import TiledHeatmapSelector from '@/features/TiledHeatmapSelector';
import CameraPage from './pages/Camera';
import { deviceIcons } from "@/assets/icons";
import '@blueskyproject/tiled/style.css';


import { RouteItem } from '@/types/navigationRouterTypes';

import { House, Joystick, StackPlus, ImageSquare, Camera  } from "@phosphor-icons/react";

function App() {
  const routes:RouteItem[] = [
    {element:<About />, path: "/", label: "Beamstop", icon: deviceIcons.beamstopX},
    {element:<BL531Control/>, path: "/control", label: "Sample", icon: <Joystick size={32} />},
    {element:<ContainerQServer className="m-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] bg-white/50"/>, path: "/qserver", label: "Q Server", icon: <StackPlus size={32} />},
    {element:
        <TiledHeatmapSelector />,
 
    path: "/data", 
    label: "Data", 
    icon: <ImageSquare size={32} />
    },
    {element: <CameraPage/>, path: '/camera', label: "Camera", icon: <Camera size={32} />}
  ]
  return (
    <HubAppLayout routes={routes}/>
  )

}

export default App
