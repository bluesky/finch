/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from 'react';

export type FinchConfig = {
    tiledApiUrl?: string;
    tiledApiKey?: string;
    ophydApiUrl?: string;
    qServerApiUrl?: string;
    qServerApiKey?: string;
    finchApiUrl?: string;
};

const FinchConfigContext = createContext<FinchConfig | null>(null);

/**
 * Normalizes and validates a URL
 * @param url - Raw URL that might be malformed
 * @param label - Human-readable name for error messages
 * @returns Cleaned URL or undefined if invalid
 */
function cleanUrl(url: string | undefined, label: string): string | undefined {
    if (!url || url.trim() === '') {
        return undefined;
    }

    try {
        let cleanedUrl = url.trim();

        // Remove trailing slashes
        cleanedUrl = cleanedUrl.replace(/\/+$/, '');

        // Add protocol if missing (assume http for local development)
        if (!cleanedUrl.match(/^https?:\/\//)) {
            // Check if it looks like a local address
            if (cleanedUrl.match(/^(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)/)) {
                cleanedUrl = `http://${cleanedUrl}`;
            } else {
                cleanedUrl = `https://${cleanedUrl}`;
            }
        }

        // Validate by creating URL object
        const urlObj = new URL(cleanedUrl);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            console.warn(
                `Invalid protocol for ${label}: ${urlObj.protocol}. Only http and https are allowed.`,
            );
            return undefined;
        }

        return urlObj.toString().replace(/\/$/, ''); // Remove trailing slash again
    } catch (error) {
        console.error(`Invalid URL format for ${label}: "${url}"`, error);
        return undefined;
    }
}

/**
 * Cleans and validates the entire config object
 */
function cleanConfig(rawConfig: FinchConfig): FinchConfig {
    return {
        tiledApiUrl: cleanUrl(rawConfig.tiledApiUrl, 'Tiled API URL'),
        tiledApiKey: rawConfig.tiledApiKey?.trim() || undefined,
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
