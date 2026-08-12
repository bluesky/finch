import type { HTTPValidationError, ValidationError } from './generatedAliases';

/** HTTP verbs this client issues. */
export type QServerHttpMethod = 'GET' | 'POST' | 'DELETE';

/**
 * Normalized transport failure. Every rejection from a client method is either this,
 * a {@link QServerGetBodyUnsupportedError}, or an `AbortError` from a cancelled signal.
 */
export class QServerApiError extends Error {
    readonly name = 'QServerApiError';
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
    }) {
        super(init.message);
        this.method = init.method;
        this.path = init.path;
        this.status = init.status;
        this.responseBody = init.responseBody;
        this.cause = init.cause;
        this.validationErrors = extractValidationErrors(init.responseBody);
        this.isValidationError = init.status === 422 || this.validationErrors !== undefined;
        // Restore the prototype chain — required for `instanceof` after TS downlevelling.
        Object.setPrototypeOf(this, QServerApiError.prototype);
    }
}

/**
 * Thrown when a payload-bearing `GET` cannot be issued in the current environment and no
 * fallback is available. See {@link GetBodyStrategy}.
 */
export class QServerGetBodyUnsupportedError extends Error {
    readonly name = 'QServerGetBodyUnsupportedError';
    readonly endpointId: string;
    readonly path: string;
    readonly reason = 'browser-cannot-send-get-body';

    constructor(endpointId: string, path: string, detail?: string) {
        super(
            `${endpointId} (GET ${path}) requires a request body, which browsers cannot send.` +
                (detail ? ` ${detail}` : ''),
        );
        this.endpointId = endpointId;
        this.path = path;
        Object.setPrototypeOf(this, QServerGetBodyUnsupportedError.prototype);
    }
}

export function isQServerApiError(error: unknown): error is QServerApiError {
    return error instanceof QServerApiError;
}

export function isQServerGetBodyUnsupportedError(
    error: unknown,
): error is QServerGetBodyUnsupportedError {
    return error instanceof QServerGetBodyUnsupportedError;
}

function extractValidationErrors(body: unknown): ValidationError[] | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const detail = (body as HTTPValidationError).detail;
    if (!Array.isArray(detail)) return undefined;
    return detail.every((entry) => entry && typeof entry === 'object' && 'loc' in entry)
        ? detail
        : undefined;
}

/** Human-readable one-liner for a 422, e.g. `body.item.name: field required`. */
export function formatValidationErrors(errors: ValidationError[] | undefined): string {
    if (!errors?.length) return '';
    return errors.map((entry) => `${entry.loc.join('.')}: ${entry.msg}`).join('; ');
}
