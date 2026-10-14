import type { TiledStreamMessage, TiledStreamMessageType } from './types';

const SCHEMA_TYPES = new Set<TiledStreamMessageType>([
    'container-schema',
    'table-schema',
    'array-schema',
    'ragged-schema',
]);

const SEQUENCED_TYPES = new Set<TiledStreamMessageType>([
    'container-child-created',
    'container-child-metadata-updated',
    'table-data',
    'array-data',
    'array-ref',
    'ragged-data',
]);

/**
 * Parse one JSON envelope into a typed message, or return `null` for a frame to drop.
 *
 * Only the discriminant is checked, plus a numeric `sequence` on the types that carry one; the rest of
 * the message is trusted as sent. Deep validation would be too slow for large array payloads on this
 * hot path.
 *
 * Returns `null` for:
 * - binary frames, which MsgPack envelopes will need a decoder for;
 * - invalid JSON;
 * - an unknown `type`, which is what a newer server's additions look like.
 */
export function parseTiledStreamMessage(raw: unknown): TiledStreamMessage | null {
    if (typeof raw !== 'string') return null;

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }
    if (typeof parsed !== 'object' || parsed === null) return null;

    const type = (parsed as { type?: unknown }).type;
    if (typeof type !== 'string') return null;

    if (SCHEMA_TYPES.has(type as TiledStreamMessageType)) {
        return parsed as TiledStreamMessage;
    }
    if (SEQUENCED_TYPES.has(type as TiledStreamMessageType)) {
        const sequence = (parsed as { sequence?: unknown }).sequence;
        return typeof sequence === 'number' ? (parsed as TiledStreamMessage) : null;
    }
    return null;
}

/** Whether a message is the schema message sent first on every connection. */
export function isTiledSchemaMessage(
    message: TiledStreamMessage,
): message is Extract<TiledStreamMessage, { type: `${string}-schema` }> {
    return SCHEMA_TYPES.has(message.type);
}
