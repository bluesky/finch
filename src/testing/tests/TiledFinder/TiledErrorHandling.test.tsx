import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, beforeAll, afterAll, afterEach, describe } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import Tiled from '@/components/Tiled/TiledFinder/Tiled';
import {
    mockTiled404Response,
    mockTiledInfoResponse,
    mockTiled401Response,
} from './mocks/responses';

describe('Tiled Component Error Handling', () => {
    const server = setupServer();

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'warn' });
    });

    afterEach(() => {
        server.resetHandlers();
    });

    afterAll(() => {
        server.close();
    });

    test('renders TiledStartupWarning when API returns 404', async () => {
        // Setup MSW to mock a 404 response for a bad URL
        const badUrl = 'https://bad-tiled-server.example.com/api/v1';

        server.use(
            // Mock the server info endpoint to return 404
            http.get(`${badUrl}/`, () => {
                return HttpResponse.json(mockTiled404Response, { status: 404 });
            }),
            // Mock the search endpoint to return 404 as well
            http.get(`${badUrl}/search`, () => {
                return HttpResponse.json(mockTiled404Response, { status: 404 });
            }),
            http.get(`${badUrl}/search/`, () => {
                return HttpResponse.json(mockTiled404Response, { status: 404 });
            }),
        );

        // Render Tiled component with bad URL
        render(<Tiled tiledBaseUrl={badUrl} enableStartupScreen={false} size="medium" />);

        // Wait for the component to attempt the API call and handle the error
        await waitFor(
            async () => {
                // Check that TiledStartupWarning is rendered
                expect(screen.getByText('Warning')).toBeInTheDocument();
                expect(
                    screen.getByText(
                        /Unable to connect to Tiled server|There was an error connecting to the Tiled server/,
                    ),
                ).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        // Verify that common troubleshooting content is displayed
        expect(screen.getByText('Common Issues:')).toBeInTheDocument();
        expect(screen.getByText(/Verify the URL is correct/)).toBeInTheDocument();
        expect(
            screen.getByText(/Verify the Tiled server you want to reach has been configured/),
        ).toBeInTheDocument();
    });

    test('renders TiledStartupWarning when network request fails', async () => {
        // Setup MSW to mock a network error
        const badUrl = 'https://nonexistent-server.example.com/api/v1';

        server.use(
            // Mock the server info endpoint to return a network error
            http.get(`${badUrl}/`, () => {
                return HttpResponse.error();
            }),
            // Mock the search endpoint to return a network error as well
            http.get(`${badUrl}/search`, () => {
                return HttpResponse.error();
            }),
            http.get(`${badUrl}/search/`, () => {
                return HttpResponse.error();
            }),
        );

        // Render Tiled component with unreachable URL
        render(<Tiled tiledBaseUrl={badUrl} enableStartupScreen={false} size="medium" />);

        // Wait for the component to attempt the API call and handle the error
        await waitFor(
            async () => {
                // Check that TiledStartupWarning is rendered
                expect(screen.getByText('Warning')).toBeInTheDocument();
                expect(
                    screen.getByText(
                        /Unable to connect to Tiled server|There was an error connecting to the Tiled server/,
                    ),
                ).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        // Verify that the warning icon is displayed
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Warning icon from phosphor-icons

        // Verify that troubleshooting information is displayed
        expect(screen.getByText('Common Issues:')).toBeInTheDocument();
        expect(screen.getByText(/CORS policy/)).toBeInTheDocument();
    });

    test('displays custom error message in TiledStartupWarning', async () => {
        // Setup MSW to mock a server error with custom message
        const badUrl = 'https://server-error.example.com/api/v1';

        server.use(
            http.get(`${badUrl}/`, () => {
                return HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 });
            }),
            http.get(`${badUrl}/search`, () => {
                return HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 });
            }),
            http.get(`${badUrl}/search/`, () => {
                return HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 });
            }),
        );

        // Render Tiled component with server error URL
        render(<Tiled tiledBaseUrl={badUrl} enableStartupScreen={false} size="medium" />);

        // Wait for the component to attempt the API call and handle the error
        await waitFor(
            async () => {
                // Check that TiledStartupWarning is rendered
                expect(screen.getByText('Warning')).toBeInTheDocument();
                expect(
                    screen.getByText(/There was an error connecting to the Tiled server/),
                ).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        // Verify that the warning message and troubleshooting content is displayed
        expect(screen.getByText(/Common Issues/)).toBeInTheDocument();
        expect(screen.getByText(/TILED_ALLOW_ORIGINS/)).toBeInTheDocument();
    });

    test('renders Login component when API returns 401 unauthorized', async () => {
        // Setup MSW to mock a 401 response for search, then success for server info
        const authUrl = 'https://auth-required-server.example.com/api/v1';

        server.use(
            // Mock the search endpoint to return 401 (unauthorized)
            http.get(`${authUrl}/search`, () => {
                return HttpResponse.json(mockTiled401Response, { status: 401 });
            }),
            http.get(`${authUrl}/search/`, () => {
                return HttpResponse.json(mockTiled401Response, { status: 401 });
            }),
            // Mock the server info endpoint to return successful server info with auth providers
            http.get(`${authUrl}/`, () => {
                return HttpResponse.json(mockTiledInfoResponse, { status: 200 });
            }),
        );

        // Render Tiled component with auth-required URL
        render(<Tiled tiledBaseUrl={authUrl} enableStartupScreen={false} size="medium" />);

        // Wait for the component to handle the 401 and show the login component
        await waitFor(
            async () => {
                // Check that the Login component is rendered (by looking for the header and auth providers)
                expect(screen.getByText('Tiled')).toBeInTheDocument();

                // Should show the login provider selection screen with header
                expect(screen.getByText('Select Login Provider')).toBeInTheDocument();

                // The Login component should render provider buttons based on mockTiledInfoResponse
                // From mockTiledInfoResponse, we have 'toy' (password) and 'orcid' (external) providers
                expect(screen.getByText('LOG IN WITH TOY')).toBeInTheDocument();
                expect(screen.getByText('LOG IN WITH ORCID')).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        // Verify that both authentication providers from mockTiledInfoResponse are shown
        const providers = mockTiledInfoResponse.authentication!.providers;

        // Should show the toy provider (password mode)
        const toyProvider = providers.find((p) => p.provider === 'toy');
        expect(toyProvider).toBeDefined();
        expect(toyProvider?.mode).toBe('password');

        // Should show the orcid provider (external mode)
        const orcidProvider = providers.find((p) => p.provider === 'orcid');
        expect(orcidProvider).toBeDefined();
        expect(orcidProvider?.mode).toBe('external');

        // Verify that we don't see the TiledStartupWarning component (since this is an auth issue, not a connection issue)
        expect(screen.queryByText('Warning')).not.toBeInTheDocument();
        expect(screen.queryByText(/Unable to connect to Tiled server/)).not.toBeInTheDocument();
    });
});
