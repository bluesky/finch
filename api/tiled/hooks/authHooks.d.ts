import { UseMutationResult } from '@tanstack/react-query';
import { TiledAuthProvider, TiledRequestOptions } from '../types/common';
import { TiledLoginTokens } from '../types/packageAliases';
import { FinchMutationOptions, TiledHookError } from './types';
/**
 * Authentication hook.
 *
 * The only mutation in this layer: `@blueskyproject/tiled` 0.0.33 exposes no write endpoints, so
 * everything else here is a query.
 */
/** What `mutate` takes. `url` and `provider` are both optional overrides. */
export interface TiledLoginVariables {
    username: string;
    password: string;
    /** Server URL override. Defaults to the resolved client's own base URL. */
    url?: string;
    /**
     * A pre-fetched auth provider — e.g. one picked out of
     * `useTiledServerInfoQuery().data?.authentication?.providers`. Omit it and the package uses the
     * first password/internal provider the server advertises.
     */
    provider?: TiledAuthProvider;
}
/**
 * Log in with a username and password.
 *
 * On success the package stores the tokens in `localStorage`, sets the bearer token on the client, and
 * refreshes it automatically on a later 401. **Resolves `null` on failure rather than rejecting** — a
 * wrong password is `data === null`, not `isError`, so check the resolved value:
 *
 * ```ts
 * const login = useTiledLoginMutation();
 * const tokens = await login.mutateAsync({ username, password });
 * if (!tokens) setError('Login failed');
 * ```
 *
 * Invalidates **every** Tiled query on success: what a caller may see changes with their identity, so
 * every cached read — including a search that legitimately returned nothing — is now suspect.
 * Credentials are deliberately not part of any query key, which is why this has to be handled by
 * invalidating rather than by re-keying.
 *
 * @param mutationOptions TanStack options. `mutate({ username, password, url?, provider? })`.
 * `onSuccess` runs after every Tiled query has been refreshed.
 * @param requestOptions Transport overrides; see `TiledRequestOptions`.
 */
export declare function useTiledLoginMutation<TContext = unknown>(mutationOptions?: FinchMutationOptions<TiledLoginTokens | null, TiledLoginVariables, TContext, TiledHookError>, requestOptions?: TiledRequestOptions): UseMutationResult<TiledLoginTokens | null, TiledHookError, TiledLoginVariables, TContext>;
//# sourceMappingURL=authHooks.d.ts.map