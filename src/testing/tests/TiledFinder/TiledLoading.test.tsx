import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, beforeAll, afterAll, afterEach, describe } from 'vitest';
import { setupServer } from 'msw/node';
import { delay, http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Tiled from '@/components/Tiled/TiledFinder/Tiled';
import { mockTiled401Response, mockTiledInfoResponse, mockTiledResponse } from './mocks/responses';

/**
 * While the viewer waits on Tiled it must say so, and name the URL it is waiting on, instead of
 * showing a blank body. And a 401 must reach the login screen at once, not after retries.
 */
describe('TiledFinder loading state', () => {
    const server = setupServer();
    const BASE = 'https://slow-server.example.com/api/v1';

    beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
    });
    afterAll(() => server.close());

    test('shows a spinner naming the request until the first listing arrives', async () => {
        server.use(
            http.get(`${BASE}/search/`, async () => {
                await delay(200);
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(<Tiled tiledBaseUrl={BASE} enableStartupScreen={false} />);

        const status = await screen.findByRole('status');
        expect(status).toHaveTextContent('Connecting to Tiled');
        expect(status).toHaveTextContent(`${BASE}/search/`);

        expect(await screen.findByText('sampleFolder')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    test('shows the same loading view in row mode', async () => {
        server.use(
            http.get(`${BASE}/search/`, async () => {
                await delay(200);
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(<Tiled tiledBaseUrl={BASE} enableStartupScreen={false} displayMode="rows" />);

        expect(await screen.findByRole('status')).toHaveTextContent(`${BASE}/search/`);
        expect(await screen.findByText('sampleFolder')).toBeInTheDocument();
    });

    test('goes straight to login on a 401, even under an app QueryClient that retries', async () => {
        let searchCalls = 0;
        server.use(
            http.get(`${BASE}/search/`, () => {
                searchCalls += 1;
                return HttpResponse.json(mockTiled401Response, { status: 401 });
            }),
            http.get(`${BASE}/`, () => HttpResponse.json(mockTiledInfoResponse)),
        );
        // TanStack's defaults: three retries with backoff (about 7 seconds in total).
        const queryClient = new QueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <Tiled tiledBaseUrl={BASE} enableStartupScreen={false} />
            </QueryClientProvider>,
        );

        // Well inside the first retry's 1 s backoff.
        await waitFor(() => expect(screen.getByText('LOG IN WITH TOY')).toBeInTheDocument(), {
            timeout: 800,
        });
        expect(searchCalls).toBe(1);
    });
});
