import './App.css';
import '@blueskyproject/tiled/style.css';

import { FinchConfigProvider } from './FinchConfigProvider';
import AboutFinchPage from './pages/AboutFinchPage';
import AllComponentsPage from './pages/AllComponentsPage';
import TestPage from './pages/TestPage';
import Documentation from './pages/Documentation';

import HubAppLayout from '@/components/HubAppLayout';

import { RouteItem } from '@/types/navigationRouterTypes';

import { House, Table, TestTube, Question } from '@phosphor-icons/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { finchIcons } from '@/assets/icons';

const queryClient = new QueryClient();

function App() {
    const routes: RouteItem[] = [
        {
            element: <AboutFinchPage />,
            path: '/',
            label: 'About',
            icon: <House size={32} />,
            isBackgroundTransparent: true,
        },
        {
            element: <AllComponentsPage />,
            path: '/components',
            label: 'Review',
            icon: <Table size={32} />,
            classNameContainer: 'bg-slate-50',
        },
        {
            element: <TestPage />,
            path: '/test',
            label: 'Test',
            icon: <TestTube size={32} />,
            isBackgroundTransparent: true,
        },
        {
            element: <Documentation />,
            path: '/documentation',
            label: 'Help',
            icon: <Question size={32} />,
        },
    ];
    return (
        <FinchConfigProvider
            config={{
                tiledApiUrl: import.meta.env.VITE_TILED_API_URL,
                tiledApiKey: import.meta.env.VITE_TILED_API_KEY,
                ophydApiUrl: import.meta.env.VITE_OPHYD_API_URL,
                qServerApiUrl: import.meta.env.VITE_QSERVER_API_URL,
                qServerApiKey: import.meta.env.VITE_QSERVER_API_KEY,
                finchApiUrl: import.meta.env.VITE_FINCH_API_URL,
            }}
        >
            <QueryClientProvider client={queryClient}>
                <HubAppLayout
                    routes={routes}
                    headerTitle="Finch Dev Mode"
                    headerLogoIcon={
                        <div className="h-12 aspect-square text-sky-950">
                            {finchIcons.finchPortraitFrameless}
                        </div>
                    }
                />
            </QueryClientProvider>
        </FinchConfigProvider>
    );
}

export default App;
