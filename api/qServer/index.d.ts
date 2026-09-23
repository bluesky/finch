/**
 * Queue server (bluesky-httpserver) API client.
 *
 * Three ways in, in increasing order of control:
 *
 * ```ts
 * // 1. free functions against the app-wide client
 * import { getStatus, setGlobalApiKey, setGlobalBaseUrl } from '@/api/qServer';
 * setGlobalBaseUrl('http://localhost:60610'); // origin, not .../api
 * setGlobalApiKey('test');
 * const status = await getStatus();
 *
 * // 2. your own instance
 * const client = createQServerApiClient({ baseUrl, apiKey, client: myAxiosInstance });
 * setDefaultQServerClient(client); // optional: make it the app-wide one
 *
 * // 3. per call
 * await getQueue(undefined, { client: someOtherAxios, apiKey: 'other-key' });
 * ```
 *
 * See `README.md` in this folder for the payload-GET limitation, the interceptor utilities
 * and the websocket auth matrix.
 */
export { QServerApiClient } from './client/QServerApiClient';
export type { QServerClientConfig, QServerFallbackInfo } from './client/QServerApiClient';
export { addRequestInterceptor, addResponseInterceptor, clearGlobalAuth, clearInterceptors, configureQServerClient, createQServerApiClient, ejectInterceptor, getDefaultQServerClient, getGlobalApiKey, getGlobalAxiosClient, getGlobalBaseUrl, listInterceptors, resetDefaultQServerClient, setDefaultQServerClient, setGlobalApiKey, setGlobalApiKeyLocation, setGlobalApiKeyScheme, setGlobalAuthErrorCallback, setGlobalAxiosClient, setGlobalBaseUrl, setGlobalBearerToken, setGlobalFallbackCallback, setGlobalGetBodyStrategy, setGlobalRefreshToken, } from './client/defaultClient';
export * from './client/facade';
export { getConsoleOutputUpdateViaPoll, getLockInfoViaStatus, getQueueItemViaQueueScan, } from './client/fallbacks';
export { BODY_REQUIRED_GET_ENDPOINT_IDS, canSendGetBody, NO_BROWSER_PATH_ENDPOINT_IDS, PAYLOAD_GET_ENDPOINT_IDS, setGetBodySupportOverride, } from './client/getBodySupport';
export { buildQServerSocketUrl, DEFAULT_QSERVER_PORT, defaultQServerBaseUrl, httpToWs, normalizeQServerBaseUrl, } from './client/urlUtils';
export { getEndpointById, getEndpointsByGroup, getReadOnlyEndpoints, QSERVER_ENDPOINT_GROUPS, QSERVER_ENDPOINTS, QSERVER_GROUP_LABELS, } from './endpointRegistry';
export type { QServerAdminEndpoints } from './endpoints/adminEndpoints';
export type { QServerAuthEndpoints } from './endpoints/authEndpoints';
export type { QServerConsoleEndpoints } from './endpoints/consoleEndpoints';
export type { QServerEnvironmentEndpoints } from './endpoints/environmentEndpoints';
export type { QServerFunctionsScriptsEndpoints } from './endpoints/functionsScriptsEndpoints';
export type { QServerHistoryEndpoints } from './endpoints/historyEndpoints';
export type { QServerLockEndpoints } from './endpoints/lockEndpoints';
export type { QServerPermissionsEndpoints } from './endpoints/permissionsEndpoints';
export type { QServerPlansDevicesEndpoints } from './endpoints/plansDevicesEndpoints';
export type { QServerQueueEndpoints } from './endpoints/queueEndpoints';
export type { QServerRunEngineEndpoints } from './endpoints/runEngineEndpoints';
export type { QServerStatusEndpoints } from './endpoints/statusEndpoints';
export type { QServerTasksEndpoints } from './endpoints/tasksEndpoints';
export { createQServerConsoleSocket, createQServerInfoSocket, createQServerStatusSocket, } from './sockets/channelSockets';
export type { QServerChannelSocketOptions } from './sockets/channelSockets';
export { createQServerSocket } from './sockets/createQServerSocket';
export { isQServerConsoleFrame, isQServerInfoFrame, isQServerStatusFrame, } from './sockets/messageTypes';
export type { QServerConsoleFrame, QServerInfoFrame, QServerSocketFrame, QServerStatusFrame, } from './sockets/messageTypes';
export { QSERVER_SOCKET_PATHS, QSERVER_WS_AUTH_TIMEOUT_MS, QSERVER_WS_CLOSE_AUTH_REQUIRED, QSERVER_WS_CLOSE_INVALID_TOKEN, } from './sockets/socketPaths';
export type { QServerSocketAuth, QServerSocketChannel, QServerSocketError, QServerSocketOptions, QServerSocketReconnectOptions, QServerSocketStatus, QServerSocketTransport, WebSocketLike, } from './sockets/types';
export { useQServerSocket } from './sockets/useQServerSocket';
export type { UseQServerSocketResult } from './sockets/useQServerSocket';
export { useQServerConsoleSocket, useQServerInfoSocket, useQServerStatusSocket, } from './sockets/useQServerChannelSockets';
export type { UseQServerChannelOptions, UseQServerConsoleSocketResult, UseQServerInfoSocketResult, UseQServerStatusSocketResult, } from './sockets/useQServerChannelSockets';
export * from './hooks';
export * from './types';
//# sourceMappingURL=index.d.ts.map