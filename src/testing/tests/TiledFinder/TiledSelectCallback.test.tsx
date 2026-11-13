import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Tiled from '@/components/Tiled/TiledFinder/Tiled';
import { mockTiledSearch2PageLimitResponse } from './mocks/responses';
import { TiledItemSelectionData } from '@/components/Tiled/TiledFinder/types';

// Mock server for API requests
const server = setupServer(
    // Mock the main search endpoint
    http.get('https://test-server.example.com/api/v1/search', () => {
        return HttpResponse.json(mockTiledSearch2PageLimitResponse);
    }),

    // Mock auth endpoints
    http.get('https://test-server.example.com/api/v1/auth/providers', () => {
        return HttpResponse.json([]);
    }),
);

describe('TiledSelectCallback Tests', () => {
    const mockSelectCallback = vi.fn();

    beforeAll(() => {
        server.listen();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
    });

    afterAll(() => {
        server.close();
    });

    it('should call onSelectCallback with TiledItemSelectionData when an item is selected', async () => {
        const user = userEvent.setup();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                enableStartupScreen={false}
                onSelectCallback={mockSelectCallback}
                singleColumnMode={true}
            />,
        );

        // Wait for the component to load and display items
        await waitFor(
            () => {
                expect(screen.getByText('1 - 2 of 62')).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        // select the first li item
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
        await user.click(listItems[0]);

        // Verify the callback was called
        expect(mockSelectCallback).toHaveBeenCalledTimes(1);

        // Get the callback argument and verify it has the expected TiledItemSelectionData structure
        const callbackData: TiledItemSelectionData = mockSelectCallback.mock.calls[0][0];

        // Verify required properties from TiledItemLinks
        expect(callbackData).toHaveProperty('self');
        expect(typeof callbackData.self).toBe('string');

        // Verify required properties from TiledItemSelectionData
        expect(callbackData).toHaveProperty('id');
        expect(callbackData).toHaveProperty('ancestors');
        expect(typeof callbackData.id).toBe('string');
        expect(Array.isArray(callbackData.ancestors)).toBe(true);

        // Verify the specific item data from our mock
        expect(callbackData.id).toBe('0e0699be-aaec-432f-b373-b19b95bbef5d');
        expect(callbackData.ancestors).toEqual([]);
    });

    it('should include auth tokens in callback when includeAuthTokensInSelectCallback=true and tokens exist in localStorage', async () => {
        const user = userEvent.setup();

        // Set up mock auth tokens in localStorage
        const mockAccessToken = 'test-access-token-123456789';
        const mockRefreshToken = 'test-refresh-token-987654321';

        localStorage.setItem('tiledAccessToken', mockAccessToken);
        localStorage.setItem('tiledRefreshToken', mockRefreshToken);

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                enableStartupScreen={false}
                onSelectCallback={mockSelectCallback}
                includeAuthTokensInSelectCallback={true}
                singleColumnMode={true}
            />,
        );

        // Wait for the component to load and display items
        await waitFor(
            () => {
                expect(screen.getByText('1 - 2 of 62')).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        // select the first li item
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
        await user.click(listItems[0]);

        // Verify the callback was called
        expect(mockSelectCallback).toHaveBeenCalledTimes(1);

        // Get the callback argument and verify auth tokens are included
        const callbackData: TiledItemSelectionData = mockSelectCallback.mock.calls[0][0];

        // Verify auth tokens are included
        expect(callbackData).toHaveProperty('accessToken');
        expect(callbackData).toHaveProperty('refreshToken');
        expect(callbackData.accessToken).toBe(mockAccessToken);
        expect(callbackData.refreshToken).toBe(mockRefreshToken);

        // Verify other required properties are still present
        expect(callbackData).toHaveProperty('self');
        expect(callbackData).toHaveProperty('id');
        expect(callbackData).toHaveProperty('ancestors');
        expect(callbackData.id).toBe('0e0699be-aaec-432f-b373-b19b95bbef5d');
    });

    it('should include null auth tokens when includeAuthTokensInSelectCallback=true but no tokens in localStorage', async () => {
        const user = userEvent.setup();

        // Ensure localStorage is clean (no auth tokens)
        localStorage.removeItem('tiledAccessToken');
        localStorage.removeItem('tiledRefreshToken');

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                enableStartupScreen={false}
                onSelectCallback={mockSelectCallback}
                includeAuthTokensInSelectCallback={true}
                singleColumnMode={true}
            />,
        );

        // Wait for the component to load and display items
        await waitFor(
            () => {
                expect(screen.getByText('1 - 2 of 62')).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        // select the first li item
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
        await user.click(listItems[0]);

        // Verify the callback was called
        expect(mockSelectCallback).toHaveBeenCalledTimes(1);

        // Get the callback argument and verify auth tokens are null
        const callbackData: TiledItemSelectionData = mockSelectCallback.mock.calls[0][0];

        // Verify auth tokens are null when not found in localStorage
        expect(callbackData).toHaveProperty('accessToken');
        expect(callbackData).toHaveProperty('refreshToken');
        expect(callbackData.accessToken).toBeNull();
        expect(callbackData.refreshToken).toBeNull();

        // Verify other required properties are still present
        expect(callbackData).toHaveProperty('self');
        expect(callbackData).toHaveProperty('id');
        expect(callbackData).toHaveProperty('ancestors');
        expect(callbackData.id).toBe('0e0699be-aaec-432f-b373-b19b95bbef5d');
    });
});
