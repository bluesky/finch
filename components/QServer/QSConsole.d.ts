import { WidgetStyleProps } from './Widget';
type QSConsoleProps = WidgetStyleProps & {
    processConsoleMessage: (message: string) => void;
};
/**
 * Live queue-server console output.
 *
 * The socket comes from `useQServerConsoleSocket` — `/api/queue_server/console_output/ws` on the queue
 * server itself, with its URL and API key resolved from `FinchConfigProvider`. It used to be a
 * hand-managed `WebSocket` pointed at the **ophyd** API's `qs-console-socket` relay, which meant this
 * panel needed a separate service running to show queue-server output.
 *
 * The hook owns the connection lifecycle (handshake, reconnect with backoff, teardown on unmount) and
 * keeps a bounded buffer, so this component only formats frames and renders them.
 */
export default function QSConsole({ processConsoleMessage }: QSConsoleProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=QSConsole.d.ts.map