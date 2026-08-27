import Experiment from '@/components/Experiment/Experiment';

/**
 * Scratch page for manual testing. Currently hosts the generic `Experiment` panel: it reads
 * `plans_allowed` / `devices_allowed` from the queue server, generates a form for whichever plan you
 * pick, executes it, and plots the resulting run out of Tiled.
 *
 * Both servers come from `FinchConfigProvider` in `App.tsx` (`VITE_QSERVER_API_URL`,
 * `VITE_TILED_API_URL`), so there is nothing to configure here.
 */
export default function TestPage() {
    return (
        <div className="p-4 min-h-full">
            <Experiment />
        </div>
    );
}
