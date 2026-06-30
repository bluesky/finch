/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from 'react';
import { cleanTiledInitialPath } from 'src/components/Tiled/utils/tiledUtils';
import { cleanUrl } from 'src/utils/urlUtils';

/**
 * Configuration for the Finch application, providing API endpoints and credentials
 * for the various backend services.
 */
export type FinchConfig = {
    /** Base URL for the Tiled data server API (e.g. `http://localhost:8000/api/v1`). */
    tiledApiUrl?: string;
    /** API key for authenticating with the Tiled server. */
    tiledApiKey?: string;
    /** Initial node path to open in the Tiled data browser (e.g. `data/mynode`). */
    tiledInitialPath?: string;
    /** Base URL for the Ophyd control-layer API. */
    ophydApiUrl?: string;
    /** Base URL for the Bluesky Queue Server (queueserver) API. */
    qServerApiUrl?: string;
    /** API key for authenticating with the Queue Server. */
    qServerApiKey?: string;
    /** Base URL for the Finch backend API. */
    finchApiUrl?: string;
};

const FinchConfigContext = createContext<FinchConfig | null>(null);

/**
 * Cleans and validates the entire config object
 */
function cleanConfig(rawConfig: FinchConfig): FinchConfig {
    return {
        tiledApiUrl: cleanUrl(rawConfig.tiledApiUrl, 'Tiled API URL'),
        tiledApiKey: rawConfig.tiledApiKey?.trim() || undefined,
        tiledInitialPath: cleanTiledInitialPath(rawConfig.tiledInitialPath),
        ophydApiUrl: cleanUrl(rawConfig.ophydApiUrl, 'Ophyd API URL'),
        qServerApiUrl: cleanUrl(rawConfig.qServerApiUrl, 'QServer API URL'),
        qServerApiKey: rawConfig.qServerApiKey?.trim() || undefined,
        finchApiUrl: cleanUrl(rawConfig.finchApiUrl, 'Finch API URL'),
    };
}

export function FinchConfigProvider({
    config,
    children,
}: {
    config: FinchConfig;
    children: React.ReactNode;
}) {
    // Clean the config once when it changes
    const cleanedConfig = useMemo(() => {
        const cleaned = cleanConfig(config);

        // Log any URLs that were cleaned for debugging
        Object.entries(config).forEach(([key, value]) => {
            const cleanedValue = cleaned[key as keyof FinchConfig];
            if (value && value !== cleanedValue) {
                console.info(`Cleaned ${key}: "${value}" → "${cleanedValue}"`);
            }
        });

        //Log final cleaned config for debugging
        console.debug('Final cleaned Finch config:', cleaned);

        return cleaned;
    }, [config]);

    return (
        <FinchConfigContext.Provider value={cleanedConfig}>{children}</FinchConfigContext.Provider>
    );
}

export function useOptionalFinchConfig() {
    return useContext(FinchConfigContext);
}

export function useFinchConfig() {
    const config = useContext(FinchConfigContext);
    if (!config) {
        throw new Error('useFinchConfig must be used within a FinchConfigProvider');
    }
    return config;
}
