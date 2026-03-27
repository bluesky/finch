import './App.css';
import '@blueskyproject/tiled/style.css';

import AboutFinchPage from './pages/AboutFinchPage';
import AllComponentsPage from './pages/AllComponentsPage';
import SimulatedDevicePage from './pages/SimulatedDevicePage';

import HubAppLayout from '@/components/HubAppLayout';

import { RouteItem } from '@/types/navigationRouterTypes';

import { House, Table, Joystick} from "@phosphor-icons/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const routes:RouteItem[] = [
    {element:<AboutFinchPage/>, path: "/", label: "About", icon: <House size={32} />},
    {element: <AllComponentsPage />, path: '/components', label: "Test", icon: <Table size={32} />},
    {element: <SimulatedDevicePage />, path: '/simulate', label: "Play", icon: <Joystick size={32} />},
  ]
  return (
    <QueryClientProvider client={new QueryClient()}>
      <HubAppLayout routes={routes} headerTitle='Finch Dev Mode'/>
    </QueryClientProvider>
  )

}

export default App
