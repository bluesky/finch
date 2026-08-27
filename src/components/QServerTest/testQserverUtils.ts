import {
    QSERVER_ENDPOINT_GROUPS,
    QSERVER_ENDPOINTS,
    type QServerEndpointDescriptor,
    type QServerEndpointGroup,
} from '@/api/qServer';

export interface EndpointGroupBucket {
    group: QServerEndpointGroup;
    endpoints: QServerEndpointDescriptor[];
}

/** Bucket the registry by domain, preserving the registry's display order. */
export function groupEndpoints(
    endpoints: readonly QServerEndpointDescriptor[] = QSERVER_ENDPOINTS,
): EndpointGroupBucket[] {
    return QSERVER_ENDPOINT_GROUPS.map((group) => ({
        group,
        endpoints: endpoints.filter((endpoint) => endpoint.group === group),
    })).filter((bucket) => bucket.endpoints.length > 0);
}

export interface ParsedPayload {
    value?: Record<string, unknown>;
    error?: string;
}

/** Parse a textarea into a JSON object, reporting why it failed rather than throwing. */
export function parsePayload(text: string): ParsedPayload {
    const trimmed = text.trim();
    if (!trimmed) return { value: undefined };
    try {
        const parsed: unknown = JSON.parse(trimmed);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return { error: 'Payload must be a JSON object.' };
        }
        return { value: parsed as Record<string, unknown> };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Invalid JSON.' };
    }
}

/** Prefilled body for an endpoint's textarea, formatted for editing. */
export function defaultPayloadFor(endpoint: QServerEndpointDescriptor): string {
    return endpoint.sampleBody ? JSON.stringify(endpoint.sampleBody, null, 2) : '';
}

/** Short badges describing an endpoint's quirks. */
export function describeBadges(endpoint: QServerEndpointDescriptor): string[] {
    const badges: string[] = [];
    if (endpoint.payloadGet) badges.push('GET body');
    if (endpoint.bodyRequired) badges.push('body required');
    if (!endpoint.browserSafe) badges.push('not browser-safe');
    if (endpoint.hasFallback) badges.push('has fallback');
    if (endpoint.destructive) badges.push('destructive');
    if (endpoint.multipart) badges.push('multipart');
    if (endpoint.streaming) badges.push('streaming');
    return badges;
}

/** Render any thrown value as something a human can read in the UI. */
export function formatError(error: unknown): string {
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return typeof error === 'string' ? error : JSON.stringify(error);
}
