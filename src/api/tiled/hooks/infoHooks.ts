import type { UseQueryResult } from '@tanstack/react-query';
import type { TiledRequestOptions } from '../types/common';
import type { TiledInfoResponse } from '../types/packageAliases';
import { useTiledQuery } from './internal/useTiledQuery';
import { tiledQueryKeys, type TiledQueryKeyFor } from './queryKeys';
import type { FinchQueryOptions, TiledHookError } from './types';
import { useTiledQueryScope } from './useTiledClient';

/** Server-info hook: `GET /api/v1/`. */

/**
 * The Tiled server's root document: api and library versions, supported formats and aliases per
 * structure family, the queries it accepts, and its authentication providers.
 *
 * **`data` can be `null`.** The package catches an unreachable server and an unparseable response and
 * resolves `null` rather than throwing, so `isError` stays `false` and `data === null` is how failure
 * shows up here. Treat `data?.authentication` as the answer to "does this server need a login".
 *
 * Effectively static for the lifetime of a server, so a long `staleTime` is appropriate; this hook does
 * not set one, because "how long is a deployment" is the caller's call.
 *
 * @param queryOptions TanStack options: `enabled`, `refetchInterval`, `staleTime`, `select`, …
 * @param requestOptions Transport overrides: `baseUrl`, `apiKey`, `signal`. A `baseUrl` here is the
 * usual way to probe a server the app is not otherwise configured for.
 */
export function useTiledServerInfoQuery<TData = TiledInfoResponse | null>(
    queryOptions?: FinchQueryOptions<
        TiledInfoResponse | null,
        TData,
        TiledQueryKeyFor<'serverInfo'>,
        TiledHookError
    >,
    requestOptions?: TiledRequestOptions,
): UseQueryResult<TData, TiledHookError> {
    const scope = useTiledQueryScope(requestOptions);

    return useTiledQuery({
        queryKey: tiledQueryKeys.serverInfo(scope),
        fetch: (client, request) => client.getServerInfo(request),
        requestOptions,
        queryOptions,
    });
}
