import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyTiledConnection } from '@/components/devtools/TiledConnectionBar';
import {
    clearTiledConnection,
    hasStoredTiledConnection,
    loadTiledConnection,
    saveTiledConnection,
} from '@/components/devtools/tiledConnectionStorage';

/**
 * The connection bar persists what Apply commits. These cover the two ways that goes wrong: a
 * stored entry that no longer matches the type, and a `localStorage` that throws instead of
 * answering.
 */

const KEY = 'finch.devtools.tiledConnection.playground';

const fallback = {
    ...emptyTiledConnection('http://localhost:8000/api/v1'),
    apiKey: 'from-finch-config',
};

describe('tiledConnectionStorage', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    // `Storage.prototype` is shared with every other suite in this worker, so the throwing spy below
    // has to come off here rather than only at the start of the next test in this file — otherwise
    // it outlives the file and breaks storage for whatever runs next.
    afterEach(() => {
        vi.restoreAllMocks();
        window.localStorage.clear();
    });

    it('round-trips a committed config', () => {
        const config = {
            ...fallback,
            baseUrl: 'http://tiled.example/api/v1',
            initialPath: 'beamline/2024',
            apiKey: 'typed-by-hand',
            apiKeyScheme: 'Apikey' as const,
            apiKeyLocation: 'query' as const,
            accessToken: 'access',
            refreshToken: 'refresh',
            useBrowserStorage: true,
        };

        saveTiledConnection('playground', config);

        expect(hasStoredTiledConnection('playground')).toBe(true);
        expect(loadTiledConnection('playground', fallback)).toEqual(config);
    });

    it('keys harnesses separately', () => {
        saveTiledConnection('playground', { ...fallback, baseUrl: 'http://one/api/v1' });

        // The other harness must not inherit it — they are usually pointed at different servers.
        expect(loadTiledConnection('endpoint-harness', fallback)).toEqual(fallback);
    });

    it('does not write the browser token store that the <Tiled> viewer reads', () => {
        saveTiledConnection('playground', { ...fallback, accessToken: 'access' });

        expect(window.localStorage.getItem('tiledAccessToken')).toBeNull();
        expect(window.localStorage.getItem('tiledRefreshToken')).toBeNull();
    });

    it('falls back per field when a stored entry is stale or hand-edited', () => {
        window.localStorage.setItem(
            KEY,
            JSON.stringify({
                baseUrl: 'http://stored/api/v1',
                // Dropped in a schema change, wrong type, and no longer a valid enum member.
                apiKey: 42,
                apiKeyScheme: 'Nonsense',
                useBrowserStorage: 'yes',
            }),
        );

        expect(loadTiledConnection('playground', fallback)).toEqual({
            ...fallback,
            baseUrl: 'http://stored/api/v1',
        });
    });

    it('falls back when the entry is absent, unparseable, or not an object', () => {
        expect(loadTiledConnection('playground', fallback)).toEqual(fallback);

        window.localStorage.setItem(KEY, '{not json');
        expect(loadTiledConnection('playground', fallback)).toEqual(fallback);

        window.localStorage.setItem(KEY, 'null');
        expect(loadTiledConnection('playground', fallback)).toEqual(fallback);
    });

    it('survives a localStorage that throws', () => {
        // Safari private mode and a blocked third-party context both throw on access.
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });

        expect(loadTiledConnection('playground', fallback)).toEqual(fallback);
        expect(hasStoredTiledConnection('playground')).toBe(false);
        expect(() => saveTiledConnection('playground', fallback)).not.toThrow();
    });

    it('clears the stored config, credentials included', () => {
        saveTiledConnection('playground', { ...fallback, apiKey: 'secret' });
        clearTiledConnection('playground');

        expect(window.localStorage.getItem(KEY)).toBeNull();
        expect(hasStoredTiledConnection('playground')).toBe(false);
        expect(loadTiledConnection('playground', fallback)).toEqual(fallback);
    });
});
