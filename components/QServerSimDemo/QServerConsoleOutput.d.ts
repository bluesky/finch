export interface QServerConsoleOutputProps {
    /** Open the socket on mount. Default true. */
    autoConnect?: boolean;
    /** Lines retained before the oldest are dropped. Default 500. */
    maxLines?: number;
    className?: string;
}
/**
 * Live console output from `/api/console_output/ws`.
 *
 * Uses the ordinary `useQServerConsoleSocket` hook, so this is a real websocket against a real
 * server and a simulated one in Storybook — the only difference is the socket factory the provider
 * hands over.
 *
 * The server splits its output into `[I <timestamp> <logger>] message` lines; those are dimmed here
 * so the message itself reads clearly, which is the same treatment `QSConsole` gives them.
 */
export default function QServerConsoleOutput({ autoConnect, maxLines, className, }: QServerConsoleOutputProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=QServerConsoleOutput.d.ts.map