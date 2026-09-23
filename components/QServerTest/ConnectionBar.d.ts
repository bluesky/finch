import { QServerApiClient } from '../../api/qServer';
export interface ConnectionBarProps {
    client: QServerApiClient;
    onRunReadOnly: () => void;
    onReset: () => void;
    busy?: boolean;
}
/**
 * Live connection controls.
 *
 * Applying a key or URL mutates the existing client rather than rebuilding it — which is
 * exactly the behaviour worth verifying by hand: subsequent calls pick up the new key with
 * no remount anywhere in the tree.
 */
export default function ConnectionBar({ client, onRunReadOnly, onReset, busy, }: ConnectionBarProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ConnectionBar.d.ts.map