import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Tiled from '@/components/Tiled/TiledFinder/Tiled';
import { mockTiledResponse } from './mocks/responses';
import { resetDefaultTiledApiClient } from '@/api/tiled';

// Mock server setup
const server = setupServer();

// Start server before all tests
beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });
    // Clear any existing auth/api keys from localStorage
    localStorage.clear();
    resetDefaultTiledApiClient();
});

// Reset handlers and clean up after each test
afterEach(() => {
    server.resetHandlers();
    server.close();
    localStorage.clear();
    // Reset global state again after each test
    resetDefaultTiledApiClient();
});

describe('Tiled Component Search Setup', () => {
    it('includes API key in first search request when apiKey prop is provided', async () => {
        let capturedHeaders: Headers | null = null;

        // Mock handler that captures the request headers
        server.use(
            http.get('https://test-server.example.com/api/v1/search/*', ({ request }) => {
                capturedHeaders = request.headers;
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                apiKey="test-api-key-123"
                enableStartupScreen={false}
            />,
        );

        // Wait for the component to make the initial search request
        await waitFor(() => {
            expect(capturedHeaders).toBeTruthy();
            expect(capturedHeaders?.get('authorization')).toBe('ApiKey test-api-key-123');
        });
    });

    it('includes sort parameter when reverseSort is set to true', async () => {
        let capturedUrl = '';

        // Mock handler that captures the request URL
        server.use(
            http.get('https://test-server.example.com/api/v1/search/*', ({ request }) => {
                capturedUrl = request.url;
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                reverseSort={true}
                enableStartupScreen={false}
            />,
        );

        // Wait for the component to make the initial search request
        await waitFor(() => {
            expect(capturedUrl).toContain('sort=-');
        });

        // Verify the URL contains the sort parameter
        const url = new URL(capturedUrl);
        expect(url.searchParams.get('sort')).toBe('-');
    });

    it('uses initialPath in the first search request when provided', async () => {
        let capturedPath = '';

        // Mock handler that captures the request path
        server.use(
            http.get('https://test-server.example.com/api/v1/search/*', ({ request }) => {
                // Extract the path after /search/
                const url = new URL(request.url);
                const fullPath = url.pathname;
                const searchIndex = fullPath.indexOf('/search/');
                if (searchIndex !== -1) {
                    capturedPath = fullPath.substring(searchIndex + '/search/'.length);
                }
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                initialPath="data/experiments/test-folder"
                enableStartupScreen={false}
            />,
        );

        // Wait for the component to make the initial search request
        await waitFor(() => {
            expect(capturedPath).toBe('data/experiments/test-folder');
        });
    });

    it('combines apiKey, reverseSort, and initialPath when all are provided', async () => {
        let capturedUrl = '';
        let capturedPath = '';
        let capturedHeaders: Headers | null = null;

        // Mock handler that captures both URL and path
        server.use(
            http.get('https://test-server.example.com/api/v1/search/*', ({ request }) => {
                capturedUrl = request.url;
                capturedHeaders = request.headers;

                // Extract the path after /search/
                const url = new URL(request.url);
                const fullPath = url.pathname;
                const searchIndex = fullPath.indexOf('/search/');
                if (searchIndex !== -1) {
                    capturedPath = fullPath.substring(searchIndex + '/search/'.length);
                }

                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                apiKey="combined-test-key"
                reverseSort={true}
                initialPath="combined/test/path"
                enableStartupScreen={false}
            />,
        );

        // Wait for the component to make the initial search request
        await waitFor(() => {
            expect(capturedHeaders).toBeTruthy();
            expect(capturedHeaders?.get('authorization')).toBe('ApiKey combined-test-key');
            expect(capturedUrl).toContain('sort=-');
            expect(capturedPath).toBe('combined/test/path');
        });

        // Verify all parameters are present
        const url = new URL(capturedUrl);
        expect(url.searchParams.get('sort')).toBe('-');
        expect(capturedPath).toBe('combined/test/path');
    });

    it('handles initialPath with leading and trailing slashes correctly', async () => {
        let capturedPath = '';

        // Mock handler that captures the request path
        server.use(
            http.get('https://test-server.example.com/api/v1/search/*', ({ request }) => {
                // Extract the path after /search/
                const url = new URL(request.url);
                const fullPath = url.pathname;
                const searchIndex = fullPath.indexOf('/search/');
                if (searchIndex !== -1) {
                    capturedPath = fullPath.substring(searchIndex + '/search/'.length);
                }
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                initialPath="/leading/and/trailing/slashes/"
                enableStartupScreen={false}
            />,
        );

        // Wait for the component to make the initial search request
        await waitFor(() => {
            // Should clean up the leading/trailing slashes
            expect(capturedPath).toBe('leading/and/trailing/slashes');
        });
    });

    it('makes search request without parameters when none are provided', async () => {
        let capturedUrl = '';

        // Mock handler that captures the request URL
        server.use(
            http.get('https://test-server.example.com/api/v1/search/*', ({ request }) => {
                capturedUrl = request.url;
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        // Wait for the component to make the initial search request
        await waitFor(() => {
            expect(capturedUrl).toBeTruthy();
        });

        // Verify no extra parameters are included
        const url = new URL(capturedUrl);
        expect(url.searchParams.get('api_key')).toBeNull();
        expect(url.searchParams.get('sort')).toBeNull();

        // Should hit the base search endpoint
        expect(url.pathname).toBe('/api/v1/search/');
    });
});
