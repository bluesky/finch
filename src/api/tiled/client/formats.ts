import type { ResponseType } from 'axios';

/**
 * Content negotiation for Tiled's data routes.
 *
 * One route serves many representations: `GET /array/full/{path}` returns JSON, CSV, PNG, TIFF or
 * raw bytes depending on `Accept` and `?format=`. The server advertises what it can do per
 * structure family in `About.formats` — this table is the client's side of that negotiation, and
 * the only place a media type string is written down.
 *
 * Two things each entry has to get right:
 *
 * - **`accept`** — sent both as the `Accept` header and as `?format=`, because Tiled honours either
 *   and upstream sends both. Keeping them in lockstep is what makes a proxy that strips `Accept`
 *   harmless.
 * - **`responseType`** — axios decodes the body according to this, and getting it wrong is silent
 *   corruption rather than an error. A PNG read as the default `'json'` arrives as a mangled
 *   string, not a failed parse.
 */

/** The representations this client can ask for and hand back a useful JavaScript value. */
export type TiledFormatName =
    | 'JSON'
    | 'JSON_SEQ'
    | 'CSV'
    | 'TEXT'
    | 'HTML'
    | 'PNG'
    | 'TIFF'
    | 'BUFFER'
    | 'PARQUET'
    | 'ARROW'
    | 'HDF5'
    | 'XLSX'
    | 'ZIP';

export interface TiledFormatSpec {
    /** The media type, sent as both the `Accept` header and the `format` query parameter. */
    readonly accept: string;
    /** How axios should decode the body. */
    readonly responseType: ResponseType;
}

export const TILED_FORMATS = {
    JSON: { accept: 'application/json', responseType: 'json' },
    // Decoded as text, then split into rows — see `parseJsonSequence`. Asking axios for 'json'
    // here would fail, because a JSON sequence is several documents, not one.
    JSON_SEQ: { accept: 'application/json-seq', responseType: 'text' },
    CSV: { accept: 'text/csv', responseType: 'text' },
    TEXT: { accept: 'text/plain', responseType: 'text' },
    HTML: { accept: 'text/html', responseType: 'text' },
    PNG: { accept: 'image/png', responseType: 'blob' },
    TIFF: { accept: 'image/tiff', responseType: 'blob' },
    BUFFER: { accept: 'application/octet-stream', responseType: 'arraybuffer' },
    PARQUET: { accept: 'application/x-parquet', responseType: 'arraybuffer' },
    ARROW: { accept: 'application/vnd.apache.arrow.file', responseType: 'arraybuffer' },
    HDF5: { accept: 'application/x-hdf5', responseType: 'arraybuffer' },
    XLSX: {
        accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        responseType: 'arraybuffer',
    },
    ZIP: { accept: 'application/zip', responseType: 'blob' },
} as const satisfies Record<TiledFormatName, TiledFormatSpec>;

/** What each format resolves to in JavaScript, once axios has decoded it. */
export interface TiledFormatReturnMap {
    JSON: unknown;
    JSON_SEQ: Record<string, unknown>[];
    CSV: string;
    TEXT: string;
    HTML: string;
    PNG: Blob;
    TIFF: Blob;
    BUFFER: ArrayBuffer;
    PARQUET: ArrayBuffer;
    ARROW: ArrayBuffer;
    HDF5: ArrayBuffer;
    XLSX: ArrayBuffer;
    ZIP: Blob;
}

/**
 * Resolve a format to its spec.
 *
 * Accepts either a {@link TiledFormatName} (`'PNG'`) or a raw media type (`'image/png'`), because
 * callers reading `About.formats` have media types in hand and should not have to map them back.
 * An unrecognised media type is passed through with `responseType: 'blob'` — the server may well
 * support a format this table does not name, and refusing it would be worse than handing back
 * bytes.
 */
export function resolveFormat(format: TiledFormatName | string): TiledFormatSpec {
    if (format in TILED_FORMATS) return TILED_FORMATS[format as TiledFormatName];

    const known = Object.values(TILED_FORMATS).find((spec) => spec.accept === format);
    if (known) return known;

    return { accept: format, responseType: 'blob' };
}

/**
 * Parse a JSON sequence body into rows.
 *
 * Ported from upstream, including its tolerance: the body is normally newline-delimited JSON text,
 * but axios will have parsed it already when a server answers `application/json` to a JSON-sequence
 * request, so an array passes through and a lone object becomes a one-row result. Anything else is
 * a real failure and throws.
 *
 * Tiled emits RFC 7464 record separators (`\x1e`) before each record on some routes; those are
 * stripped per line rather than relied upon as the delimiter, since the newline form is what the
 * JSON routes actually send.
 */
export function parseJsonSequence(body: unknown): Record<string, unknown>[] {
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (!trimmed) return [];
        return trimmed
            .split('\n')
            .map((line) => stripRecordSeparator(line).trim())
            .filter(Boolean)
            .map((line) => JSON.parse(line) as Record<string, unknown>);
    }
    if (Array.isArray(body)) return body as Record<string, unknown>[];
    if (body && typeof body === 'object') return [body as Record<string, unknown>];
    throw new Error('Could not parse JSON sequence response.');
}

/**
 * Drop a leading RFC 7464 record separator (U+001E).
 *
 * Written as a comparison rather than a regex on purpose: a control character in a regex literal is
 * an eslint error (`no-control-regex`) and, more to the point, `\x1e` is far less readable inside a
 * pattern than it is beside its name.
 */
const RECORD_SEPARATOR = '\u001e';

function stripRecordSeparator(line: string): string {
    return line.startsWith(RECORD_SEPARATOR) ? line.slice(1) : line;
}
