import { QServerApiClient, QServerEndpointGroup } from '../../api/qServer';
export interface TestQserverProps {
    /** Exercise a caller-supplied client instead of one built from the Finch config. */
    client?: QServerApiClient;
    /** Server origin. Defaults to the configured queue-server URL, minus any `/api`. */
    initialBaseUrl?: string;
    initialApiKey?: string;
    /** Groups expanded on first render. */
    defaultOpenGroups?: QServerEndpointGroup[];
    hideSockets?: boolean;
    className?: string;
}
/**
 * Manual test harness for the `qServer` client.
 *
 * Every row is rendered from `QSERVER_ENDPOINTS`, so the harness covers all 70 operations by
 * construction and gains new ones automatically. Alongside the endpoints it exercises the
 * three parts that are hard to unit test convincingly: hot API-key swapping, the interceptor
 * utilities, and the websockets in both auth modes.
 */
export default function TestQserver({ client: injectedClient, initialBaseUrl, initialApiKey, defaultOpenGroups, hideSockets, className, }: TestQserverProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TestQserver.d.ts.map