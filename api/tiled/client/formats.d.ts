import { ResponseType } from 'axios';
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
export type TiledFormatName = 'JSON' | 'JSON_SEQ' | 'CSV' | 'TEXT' | 'HTML' | 'PNG' | 'TIFF' | 'BUFFER' | 'PARQUET' | 'ARROW' | 'HDF5' | 'XLSX' | 'ZIP';
export interface TiledFormatSpec {
    /** The media type, sent as both the `Accept` header and the `format` query parameter. */
    readonly accept: string;
    /** How axios should decode the body. */
    readonly responseType: ResponseType;
}
export declare const TILED_FORMATS: {
    readonly JSON: {
        readonly accept: "application/json";
        readonly responseType: "json";
    };
    readonly JSON_SEQ: {
        readonly accept: "application/json-seq";
        readonly responseType: "text";
    };
    readonly CSV: {
        readonly accept: "text/csv";
        readonly responseType: "text";
    };
    readonly TEXT: {
        readonly accept: "text/plain";
        readonly responseType: "text";
    };
    readonly HTML: {
        readonly accept: "text/html";
        readonly responseType: "text";
    };
    readonly PNG: {
        readonly accept: "image/png";
        readonly responseType: "blob";
    };
    readonly TIFF: {
        readonly accept: "image/tiff";
        readonly responseType: "blob";
    };
    readonly BUFFER: {
        readonly accept: "application/octet-stream";
        readonly responseType: "arraybuffer";
    };
    readonly PARQUET: {
        readonly accept: "application/x-parquet";
        readonly responseType: "arraybuffer";
    };
    readonly ARROW: {
        readonly accept: "application/vnd.apache.arrow.file";
        readonly responseType: "arraybuffer";
    };
    readonly HDF5: {
        readonly accept: "application/x-hdf5";
        readonly responseType: "arraybuffer";
    };
    readonly XLSX: {
        readonly accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        readonly responseType: "arraybuffer";
    };
    readonly ZIP: {
        readonly accept: "application/zip";
        readonly responseType: "blob";
    };
};
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
export declare function resolveFormat(format: TiledFormatName | string): TiledFormatSpec;
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
export declare function parseJsonSequence(body: unknown): Record<string, unknown>[];
//# sourceMappingURL=formats.d.ts.map