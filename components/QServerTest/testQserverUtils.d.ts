import { QServerEndpointDescriptor, QServerEndpointGroup } from '../../api/qServer';
export interface EndpointGroupBucket {
    group: QServerEndpointGroup;
    endpoints: QServerEndpointDescriptor[];
}
/** Bucket the registry by domain, preserving the registry's display order. */
export declare function groupEndpoints(endpoints?: readonly QServerEndpointDescriptor[]): EndpointGroupBucket[];
export interface ParsedPayload {
    value?: Record<string, unknown>;
    error?: string;
}
/** Parse a textarea into a JSON object, reporting why it failed rather than throwing. */
export declare function parsePayload(text: string): ParsedPayload;
/** Prefilled body for an endpoint's textarea, formatted for editing. */
export declare function defaultPayloadFor(endpoint: QServerEndpointDescriptor): string;
/** Short badges describing an endpoint's quirks. */
export declare function describeBadges(endpoint: QServerEndpointDescriptor): string[];
/** Render any thrown value as something a human can read in the UI. */
export declare function formatError(error: unknown): string;
//# sourceMappingURL=testQserverUtils.d.ts.map