import { useState } from 'react';
import Experiment from '@/components/Experiment/Experiment';
import TestTiled from '@/components/TiledTest/TestTiled';

type Panel = 'experiment' | 'tiled';

/**
 * Scratch page for manual testing.
 *
 * Two panels:
 *
 * - **Experiment** — the generic panel: reads `plans_allowed` / `devices_allowed` from the queue
 *   server, generates a form for whichever plan you pick, executes it, and plots the resulting run
 *   out of Tiled.
 * - **Tiled API** — every endpoint in the Tiled client's registry, runnable against a live server.
 *   The counterpart to `TestQserver`.
 *
 * Both servers come from `FinchConfigProvider` in `App.tsx` (`VITE_QSERVER_API_URL`,
 * `VITE_TILED_API_URL`), so there is nothing to configure here — though the Tiled panel lets you
 * point at a different server without disturbing the rest of the page.
 */
export default function TestPage() {
    const [panel, setPanel] = useState<Panel>('experiment');

    return (
        <div className="min-h-full p-4">
            <div className="mb-4 flex gap-2">
                {(['experiment', 'tiled'] as const).map((name) => (
                    <button
                        key={name}
                        type="button"
                        className={`rounded border px-3 py-1 text-sm ${
                            panel === name
                                ? 'border-slate-500 bg-slate-200 dark:bg-slate-700'
                                : 'border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => setPanel(name)}
                    >
                        {name === 'experiment' ? 'Experiment' : 'Tiled API'}
                    </button>
                ))}
            </div>

            {panel === 'experiment' ? <Experiment /> : <TestTiled />}
        </div>
    );
}
