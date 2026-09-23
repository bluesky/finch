export interface QServerSimDemoProps {
    /** Poll interval in ms. Set to 0 to refresh only on demand. */
    pollIntervalMs?: number;
    /** Show the live console-output websocket panel. Default true. */
    showConsole?: boolean;
    className?: string;
}
/**
 * A minimal queue-server client exercise: what's queued, what ran, and a button to run a plan.
 *
 * Uses the API client from `QServerApiProvider` and nothing else — no TanStack Query, no caching
 * layer — so it reads as a direct test of the client against whatever is behind the provider
 * (the simulator in Storybook, a real server in the app).
 */
export default function QServerSimDemo({ pollIntervalMs, showConsole, className, }: QServerSimDemoProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=QServerSimDemo.d.ts.map