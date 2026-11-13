import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Tiled from '@/components/Tiled/TiledFinder/Tiled';
import { mockTiledResponse } from './mocks/responses';
import { getDefaultTiledApiClient, resetDefaultTiledApiClient, tiledQueryRoots } from '@/api/tiled';

/**
 * The viewer builds its own Tiled client from its props and reads through TanStack Query. These
 * cover what that buys: two viewers do not share credentials or servers, the app's default client
 * is left alone, and the viewer works with or without an app-provided QueryClient.
 */

const server = setupServer();

const SERVER_A = 'https://server-a.example.com/api/v1';
const SERVER_B = 'https://server-b.example.com/api/v1';

beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });
    localStorage.clear();
    resetDefaultTiledApiClient();
});

afterEach(() => {
    server.resetHandlers();
    server.close();
    localStorage.clear();
    resetDefaultTiledApiClient();
});

function captureAuthHeaders(baseUrl: string, into: (string | null)[]) {
    return http.get(`${baseUrl}/search/*`, ({ request }) => {
        into.push(request.headers.get('authorization'));
        return HttpResponse.json(mockTiledResponse);
    });
}

describe('TiledFinder client isolation', () => {
    it('sends each viewer’s requests to its own server with its own API key', async () => {
        const headersA: (string | null)[] = [];
        const headersB: (string | null)[] = [];
        server.use(captureAuthHeaders(SERVER_A, headersA), captureAuthHeaders(SERVER_B, headersB));

        render(
            <>
                <Tiled tiledBaseUrl={SERVER_A} apiKey="key-a" />
                <Tiled tiledBaseUrl={SERVER_B} apiKey="key-b" />
            </>,
        );

        await waitFor(() => {
            expect(headersA.length).toBeGreaterThan(0);
            expect(headersB.length).toBeGreaterThan(0);
        });
        expect(new Set(headersA)).toEqual(new Set(['ApiKey key-a']));
        expect(new Set(headersB)).toEqual(new Set(['ApiKey key-b']));
    });

    it('does not configure the app’s default Tiled client', async () => {
        const headers: (string | null)[] = [];
        server.use(captureAuthHeaders(SERVER_A, headers));
        const defaultBaseUrl = getDefaultTiledApiClient().getBaseUrl();

        render(<Tiled tiledBaseUrl={SERVER_A} apiKey="viewer-only-key" initialPath="sub/path" />);

        await waitFor(() => expect(headers.length).toBeGreaterThan(0));
        const defaultClient = getDefaultTiledApiClient();
        expect(defaultClient.getApiKey()).toBeNull();
        expect(defaultClient.getInitialPath()).toBe('');
        expect(defaultClient.getBaseUrl()).toBe(defaultBaseUrl);
    });
});

describe('TiledFinder QueryClient', () => {
    it('works without an app-provided QueryClient', async () => {
        server.use(http.get(`${SERVER_A}/search/*`, () => HttpResponse.json(mockTiledResponse)));

        render(<Tiled tiledBaseUrl={SERVER_A} />);

        expect(await screen.findByText('sampleFolder')).toBeInTheDocument();
    });

    it('reads through the app’s QueryClient when one is provided', async () => {
        server.use(http.get(`${SERVER_A}/search/*`, () => HttpResponse.json(mockTiledResponse)));
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

        render(
            <QueryClientProvider client={queryClient}>
                <Tiled tiledBaseUrl={SERVER_A} />
            </QueryClientProvider>,
        );

        expect(await screen.findByText('sampleFolder')).toBeInTheDocument();
        const searches = queryClient.getQueryCache().findAll({ queryKey: tiledQueryRoots.search });
        expect(searches.length).toBeGreaterThan(0);
    });
});
