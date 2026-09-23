import { ValidationError } from './generatedAliases';
/** HTTP verbs this client issues. */
export type QServerHttpMethod = 'GET' | 'POST' | 'DELETE';
/**
 * Normalized transport failure. Every rejection from a client method is either this,
 * a {@link QServerGetBodyUnsupportedError}, or an `AbortError` from a cancelled signal.
 */
export declare class QServerApiError extends Error {
    readonly name = "QServerApiError";
    /** HTTP status, or `undefined` for network/timeout failures. */
    readonly status?: number;
    readonly method: QServerHttpMethod;
    readonly path: string;
    /** Parsed response body, when the server sent one. */
    readonly responseBody?: unknown;
    /** True for FastAPI's 422; `validationErrors` is then populated. */
    readonly isValidationError: boolean;
    readonly validationErrors?: ValidationError[];
    /** The original axios error, for callers that need `config`/`request`. */
    readonly cause?: unknown;
    constructor(init: {
        message: string;
        method: QServerHttpMethod;
        path: string;
        status?: number;
        responseBody?: unknown;
        cause?: unknown;
    });
}
/**
 * Thrown when a payload-bearing `GET` cannot be issued in the current environment and no
 * fallback is available. See {@link GetBodyStrategy}.
 */
export declare class QServerGetBodyUnsupportedError extends Error {
    readonly name = "QServerGetBodyUnsupportedError";
    readonly endpointId: string;
    readonly path: string;
    readonly reason = "browser-cannot-send-get-body";
    constructor(endpointId: string, path: string, detail?: string);
}
export declare function isQServerApiError(error: unknown): error is QServerApiError;
export declare function isQServerGetBodyUnsupportedError(error: unknown): error is QServerGetBodyUnsupportedError;
/** Human-readable one-liner for a 422, e.g. `body.item.name: field required`. */
export declare function formatValidationErrors(errors: ValidationError[] | undefined): string;
//# sourceMappingURL=errors.d.ts.map