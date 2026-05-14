import { useOptionalFinchConfig } from '../app/FinchConfigProvider';
import { httpToWsUrl } from './urlUtils';

/**
 * Centralized API URL utilities for all backend services
 */
const DEFAULT_TILED_API_PORT = '8000';
const DEFAULT_OPHYD_API_PORT = '8001';
const DEFAULT_QSERVER_API_PORT = '60610';
const DEFAULT_QSERVER_API_KEY = 'test';

const currentAddress = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

// =============================================================================
// OPHYD API (Device Control, Camera Streaming, Queue Server Console Streaming)
// =============================================================================

export function useOphydApiUrls() {
    const config = useOptionalFinchConfig();
    const httpBaseUrl =
        config?.ophydApiUrl || `http://${currentAddress}:${DEFAULT_OPHYD_API_PORT}/api/v1`;
    const wsBaseUrl = config?.ophydApiUrl
        ? httpToWsUrl(config.ophydApiUrl)
        : `ws://${currentAddress}:${DEFAULT_OPHYD_API_PORT}/api/v1`;

    return {
        httpBaseUrl,
        wsBaseUrl,
        getRestUrl: (path: string) => `${httpBaseUrl}/${path}`,
        getWsUrl: (path: string) => `${wsBaseUrl}/${path}`,
    };
}

// =============================================================================
// QUEUE SERVER API (Bluesky Plans)
// =============================================================================
export function useQueueServerApiUrls() {
    const config = useOptionalFinchConfig();
    const httpBaseUrl =
        config?.qServerApiUrl || `http://${currentAddress}:${DEFAULT_QSERVER_API_PORT}/api`;
    const apiKey = config?.qServerApiKey || DEFAULT_QSERVER_API_KEY;

    return {
        httpBaseUrl,
        apiKey,
        getRestUrl: (path: string) => `${httpBaseUrl}/${path}`,
    };
}

// =============================================================================
// TILED SERVER API (Data Catalog)
// =============================================================================
export function useTiledApiUrls() {
    const config = useOptionalFinchConfig();
    const httpBaseUrl =
        config?.tiledApiUrl || `http://${currentAddress}:${DEFAULT_TILED_API_PORT}/api/v1`;
    const apiKey = config?.tiledApiKey || null;

    return {
        httpBaseUrl,
        apiKey,
        getRestUrl: (path: string) => `${httpBaseUrl}/${path}`,
    };
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const useAllApiUrls = () => ({
    ophyd: useOphydApiUrls(),
    queueServer: useQueueServerApiUrls(),
    tiled: useTiledApiUrls(),
});
