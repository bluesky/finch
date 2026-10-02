import axios from 'axios';
import type { HTTPValidationError, ValidationError } from './generatedAliases';

/** HTTP verbs this client issues. */
export type TiledHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Normalized transport failure. Every rejection from a client method is either this, a
 * {@link TiledEndpointUnavailableError}, or an `AbortError` from a cancelled signal.
 *
 * This is the piece `@blueskyproject/tiled` never had: its methods reject with whatever axios
 * produced, so callers had to know about `error.response?.data` to read a Tiled error message, and
 * the hook layer could only type its failures as bare `Error`. The shape is deliberately identical
 * to `QServerApiError` — both backends now fail the same way, and a component that handles one
 * handles the other.
 */
export class TiledApiError extends Error {
    readonly name = 'TiledApiError';
    /** HTTP status, or `undefined` for network/timeout failures. */
    readonly status?: number;
    readonly method: TiledHttpMethod;
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
        method: TiledHttpMethod;
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
        Object.setPrototypeOf(this, TiledApiError.prototype);
    }
}

export function isTiledApiError(error: unknown): error is TiledApiError {
    return error instanceof TiledApiError;
}

function extractValidationErrors(body: unknown): ValidationError[] | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const detail = (body as HTTPValidationError).detail;
    if (!Array.isArray(detail)) return undefined;
    return detail.every((entry) => entry && typeof entry === 'object' && 'loc' in entry)
        ? detail
        : undefined;
}

/** Human-readable one-liner for a 422, e.g. `body.specs: field required`. */
export function formatValidationErrors(errors: ValidationError[] | undefined): string {
    if (!errors?.length) return '';
    return errors.map((entry) => `${entry.loc.join('.')}: ${entry.msg}`).join('; ');
}

/**
 * Normalize an unknown rejection into a {@link TiledApiError}.
 *
 * Tiled reports failures in two shapes — FastAPI's `{ detail }` for validation and framework
 * errors, and its own `{ error: { code, message } }` envelope for some application errors — so the
 * message is assembled from whichever is present before falling back to axios's own.
 *
 * An `AbortError` passes through untouched: a cancelled request is not an API failure, and TanStack
 * relies on being able to recognise it.
 */
export function toTiledApiError(
    error: unknown,
    method: TiledHttpMethod,
    path: string,
): TiledApiError | Error {
    if (error instanceof TiledApiError) return error;

    // Cancellation is not a failure of the API. Let it through so TanStack can tell the difference.
    if (axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError')) {
        return error;
    }

    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseBody = error.response?.data;
        return new TiledApiError({
            message: describeFailure(method, path, status, responseBody, error.message),
            method,
            path,
            status,
            responseBody,
            cause: error,
        });
    }

    return new TiledApiError({
        message: error instanceof Error ? error.message : String(error),
        method,
        path,
        cause: error,
    });
}

function describeFailure(
    method: TiledHttpMethod,
    path: string,
    status: number | undefined,
    body: unknown,
    axiosMessage: string,
): string {
    const detail = readServerMessage(body);
    const where = `${method} ${path}`;
    if (status === undefined) return `${where} failed: ${axiosMessage}`;
    return detail ? `${where} failed with ${status}: ${detail}` : `${where} failed with ${status}`;
}

/** Pull a human-readable message out of either error envelope Tiled uses. */
function readServerMessage(body: unknown): string | undefined {
    if (typeof body === 'string') return body.trim() || undefined;
    if (!body || typeof body !== 'object') return undefined;

    const validation = extractValidationErrors(body);
    if (validation) return formatValidationErrors(validation);

    const { detail, error } = body as { detail?: unknown; error?: unknown };
    if (typeof detail === 'string') return detail;

    if (error && typeof error === 'object') {
        const { code, message } = error as { code?: unknown; message?: unknown };
        if (typeof message === 'string') {
            return typeof code === 'string' || typeof code === 'number'
                ? `${message} (${code})`
                : message;
        }
    }
    return undefined;
}
