import type { components, operations, paths } from '../generated/schema';

/**
 * Readable aliases over the generated OpenAPI schema.
 *
 * The queue-server spec leaves every domain payload untyped (`additionalProperties`),
 * so the generated file is only authoritative for two things: the path/operation key
 * unions, and the twelve auth-related component schemas re-exported below. Everything
 * else is hand-written in the sibling files of this folder.
 */

/** Every URL declared by the spec, e.g. `'/api/status'`. */
export type QServerPathKey = keyof paths;

/** Every `operationId` declared by the spec. */
export type QServerOperationId = keyof operations;

/** Narrow the path union to those supporting a given HTTP method. */
export type QServerPathsWithMethod<M extends 'get' | 'post' | 'delete'> = {
    [P in keyof paths]: paths[P] extends { [K in M]: unknown } ? P : never;
}[keyof paths];

type Schemas = components['schemas'];

/** A user or service known to the server. */
export type Principal = Schemas['Principal'];
export type PrincipalType = Schemas['PrincipalType'];
export type Identity = Schemas['Identity'];
export type Session = Schemas['Session'];

/** API key metadata (no secret). */
export type APIKey = Schemas['APIKey'];
/** API key as returned by creation endpoints — includes the one-time `secret`. */
export type APIKeyWithSecret = Schemas['APIKeyWithSecret'];
export type APIKeyRequestParams = Schemas['APIKeyRequestParams'];

export type AccessAndRefreshTokens = Schemas['AccessAndRefreshTokens'];
export type RefreshToken = Schemas['RefreshToken'];

/** FastAPI's 422 body. */
export type HTTPValidationError = Schemas['HTTPValidationError'];
export type ValidationError = Schemas['ValidationError'];

/** Multipart body of `POST /api/queue/upload/spreadsheet`. */
export type UploadSpreadsheetFormBody =
    Schemas['Body_queue_upload_spreadsheet_api_queue_upload_spreadsheet_post'];
