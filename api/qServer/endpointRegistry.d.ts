import { QServerEndpointDescriptor, QServerEndpointGroup } from './types/registry';
/**
 * Every operation the client implements, described as data.
 *
 * Ordered by domain so a UI can render it top to bottom. `QServerNewRegistry.test.tsx`
 * diffs this against `openapi.json`, so a spec change surfaces as a failing test rather
 * than a silently missing endpoint.
 */
export declare const QSERVER_ENDPOINTS: readonly QServerEndpointDescriptor[];
/** Domain order used for display. */
export declare const QSERVER_ENDPOINT_GROUPS: readonly QServerEndpointGroup[];
/** Human-readable group labels. */
export declare const QSERVER_GROUP_LABELS: Record<QServerEndpointGroup, string>;
export declare function getEndpointById(id: string): QServerEndpointDescriptor | undefined;
export declare function getEndpointsByGroup(group: QServerEndpointGroup): QServerEndpointDescriptor[];
/**
 * Endpoints safe to fire in bulk against a live server: reads that neither mutate state nor
 * block. Excludes the console stream, which never completes on its own.
 */
export declare function getReadOnlyEndpoints(): QServerEndpointDescriptor[];
//# sourceMappingURL=endpointRegistry.d.ts.map