import { SubscriptionMode } from './modes';
export interface WriteHelpersProps {
    /** The container new nodes are created under. */
    parentPath: string;
    onSubscribe: (path: string, mode: SubscriptionMode) => void;
}
/**
 * Buttons that make the server emit stream events, so the harness can be driven without a Python
 * session. They write over HTTP through the harness's own client, with the connection bar's key.
 *
 * Only containers and arrays are covered. A table append needs an Arrow IPC body, and Finch has no
 * Arrow encoder (Tiled answers JSON with "No dispatch", and its CSV path is broken), so for tables
 * the panel shows a Python snippet instead.
 */
export default function WriteHelpers({ parentPath, onSubscribe }: WriteHelpersProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=WriteHelpers.d.ts.map