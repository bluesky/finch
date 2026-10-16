import { TiledStreamMessage } from './types';
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
export declare function parseTiledStreamMessage(raw: unknown): TiledStreamMessage | null;
/** Whether a message is the schema message sent first on every connection. */
export declare function isTiledSchemaMessage(message: TiledStreamMessage): message is Extract<TiledStreamMessage, {
    type: `${string}-schema`;
}>;
//# sourceMappingURL=parseMessage.d.ts.map