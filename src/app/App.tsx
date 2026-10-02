import './App.css';
import '@blueskyproject/tiled/style.css';

import { FinchConfigProvider } from './FinchConfigProvider';
import AboutFinchPage from './pages/AboutFinchPage';
import AllComponentsPage from './pages/AllComponentsPage';
import Documentation from './pages/Documentation';

import Experiment from '@/components/Experiment/Experiment';
import TestTiled from '@/components/TiledTest/TestTiled';
import TiledQueryPlayground from '@/components/TiledQueryPlayground/TiledQueryPlayground';

import FinchAppLayout from '@/components/FinchAppLayout/FinchAppLayout';

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
            // Three manual testbeds, as real nested routes rather than local state — so each has
            // its own url, back and forward work, and a reload keeps you where you were.
            path: '/test',
            label: 'Test',
            icon: <TestTube size={32} />,
            isBackgroundTransparent: true,
            tabs: [
                {
                    // Reads plans and devices from the queue server, runs one, and plots the
                    // resulting run out of Tiled.
                    path: 'experiment',
                    label: 'Experiment',
                    element: <Experiment />,
                },
                {
                    // Every endpoint in the Tiled client's registry. Drives the *client*: reads and
                    // writes, the wire format, auth. The counterpart to TestQserver.
                    path: 'tiled-api',
                    label: 'Tiled API',
                    element: <TestTiled />,
                    // Same light surface as Tiled Queries — both are dense with forms and JSON,
                    // and they share components, so a shared component cannot be styled for one
                    // without being wrong in the other.
                    isBackgroundTransparent: false,
                    classNameContainer: 'h-auto min-h-full bg-slate-50 p-4 text-slate-800',
                },
                {
                    // Every Tiled query *hook*, with its cache. Drives the TanStack layer: keys,
                    // sharing, staleness, guards, invalidation. Different seam, different failures.
                    path: 'tiled-queries',
                    label: 'Tiled Queries',
                    element: <TiledQueryPlayground />,
                    // Light surface, unlike its sibling tabs. This page is dense with forms, JSON
                    // and a cache table — all of which Tailwind's palette renders light-first — and
                    // reading long keys and bodies is easier as dark grey on light than the reverse.
                    //
                    // `h-auto min-h-full` replaces the layout's `h-full`: at a fixed viewport height
                    // the background stops where the viewport does, and a page this tall then shows
                    // the dark chrome behind its lower half. Harmless while a page is transparent,
                    // very visible once it is not.
                    isBackgroundTransparent: false,
                    classNameContainer: 'h-auto min-h-full bg-slate-50 p-4 text-slate-800',
                },
            ],
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
                <FinchAppLayout
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
