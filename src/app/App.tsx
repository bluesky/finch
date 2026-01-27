import './App.css';
import About from './pages/About';
import ContainerQServer from '@/components/QServer/ContainerQServer';
import HubAppLayout from '@/components/HubAppLayout';
import BL531Control from './pages/BL531Control';
import TiledHeatmapSelector from '@/features/TiledHeatmapSelector';
import CameraPage from './pages/Camera';
import Beamstop from '@/features/Beamstop';
import GoogleDoc from '@/components/GoogleDoc';
import LinuxMonitor from '@/components/LinuxMonitor';
import SampleDataPage from './pages/SampleDataPage';
import ALSBeamStatus from '@/components/ALSBeamStatus';
import BL531Dashboard from './pages/BL531Dashboard';
import Osprey from '@/components/Osprey/Osprey';
import ScatteringPage from './pages/ScatteringPage';
import { deviceIcons } from "@/assets/icons";
import '@blueskyproject/tiled/style.css';


import { RouteItem } from '@/types/navigationRouterTypes';

import { House, Joystick, StackPlus, ImageSquare, Camera, GoogleLogo, Feather, Terminal,  LightbulbFilament, AppWindow} from "@phosphor-icons/react";
import DashboardPage from '@/stories/DashboardPage';
import { Query, QueryClient, QueryClientProvider } from '@tanstack/react-query';
const docs = [
  {
    title: "BL531 New Feature Request Documentation",
    url: "https://docs.google.com/document/d/1jkQqJ02L4R1XjVZmKGtJfWkn2fQVBQJihL1Oy9Dxhug/edit?usp=sharing"
  },
  {
    title: "BL531 Beamline Info",
    url: "https://docs.google.com/document/d/1NdNRfb5KFtb9-DfPl6uxdFJjL7nxJCpxRZIYmLI9LtI/edit?usp=sharing"
  },
  {
    title: "Osprey Dev Journal",
    url: "https://docs.google.com/document/d/1soFen_iFWRMSywI7tWfCG2DWKm7vzVa_rUjBwjWfiZE/edit?usp=sharing"
  }
]
function App() {
  const routes:RouteItem[] = [
    {element:<BL531Dashboard/>, path: "/", label: "Dashboard", icon: <House size={32} />},
    {
      element:
        <Beamstop stackVertical={false} enableBestOption={true} beamstopXTitle="Beamstop - X" beamstopYTitle="Beamstop - Y" beamstopCurrentName="bl201-beamstop:current" beamstopXName="bl531_xps2:beamstop_x_mm" beamstopYName="bl531_xps2:beamstop_y_mm" /> ,
      path: "/beamstop", 
      label: "Beamstop", 
      icon: deviceIcons.beamstopX
    },
    {element:<BL531Control/>, path: "/control", label: "Sample", icon: <Joystick size={32} />},
    {element:<ContainerQServer className="m-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] bg-white/50 max-w-[1600px]"/>, path: "/qserver", label: "Q Server", icon: <StackPlus size={32} />},
    {
      element:
        <TiledHeatmapSelector />,
      path: "/data", 
      label: "Data", 
      icon: <ImageSquare size={32} />
    },
    {element: <CameraPage/>, path: '/camera', label: "Camera", icon: <Camera size={32} />},
    {element: <GoogleDoc docs={docs} />, path: '/doc', label: "docs", icon: <GoogleLogo size={32} />},
    {element: <LinuxMonitor />, path: '/terminal', label: "Terminal", icon: <Terminal size={32} />},
    {element: <ALSBeamStatus />, path: '/beamstatus', label: "Beam", icon: <LightbulbFilament size={32} />},
    {element: <Osprey />, path: '/osprey', label: "Osprey", icon: <Feather size={32} />},
    // {element: <SampleDataPage />, path: '/sampledata', label: "Spectroscopy", icon: <AppWindow size={32} />},
    {element: <ScatteringPage />, path: '/scan', label: "Scan", icon: <AppWindow size={32} />},
  ]
  return (
    <QueryClientProvider client={new QueryClient()}>
      <HubAppLayout routes={routes} headerTitle='Beamline 5.3.1'/>
    </QueryClientProvider>
  )

}

export default App
