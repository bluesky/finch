import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

describe('Tiled Component Button Mode Configuration', () => {
    // Mock server handler for successful search requests
    const mockSuccessfulSearch = () => {
        server.use(
            http.get('https://test-server.example.com/api/v1/search/*', () => {
                return HttpResponse.json(mockTiledResponse);
            }),
        );
    };

    it('should render button when isButtonMode=true', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        // In button mode, the viewer should be closed initially and only show the button
        expect(screen.getByText('Select Data')).toBeInTheDocument(); // Default button text

        // The main viewer content should not be visible initially
        // Check for actual content that only appears when the viewer is open
        expect(screen.queryByText('sampleFolder')).not.toBeInTheDocument();
        expect(
            screen.queryByText(/select an item or click outside to close/i),
        ).not.toBeInTheDocument();
    });

    it('should show API key input when inButtonModeShowApiKeyInput=true', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                inButtonModeShowApiKeyInput={true}
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        // Should show API key input field by placeholder text
        expect(screen.getByPlaceholderText(/enter api key/i)).toBeInTheDocument();
        // Should show API key label
        expect(screen.getByText('API Key:')).toBeInTheDocument();
    });

    it('should show reverse sort input when inButtonModeShowReverseSortInput=true', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                inButtonModeShowReverseSortInput={true}
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        // Should show reverse sort input/checkbox
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        // Should show reverse sort label
        expect(screen.getByText('Reverse Sort:')).toBeInTheDocument();
    });

    it('should display selected data when inButtonModeShowSelectedData=true and item is clicked', async () => {
        mockSuccessfulSearch();

        const mockSelectCallback = vi.fn();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                inButtonModeShowSelectedData={true}
                onSelectCallback={mockSelectCallback}
                enableStartupScreen={false}
                reverseSort={false}
                singleColumnMode={true}
            />,
        );

        // Initially should show empty selected data area
        expect(screen.getByText('Select Data')).toBeInTheDocument();

        // Click the button to open the viewer
        const openButton = screen.getByText('Select Data');
        fireEvent.click(openButton);

        // Wait for the viewer to open and data to load
        await waitFor(() => {
            expect(screen.getByText('sampleFolder')).toBeInTheDocument();
        });

        // In single column mode, clicking on the item directly should trigger handleSelectClick
        const sampleItem = screen.getByText('sampleFolder');
        await fireEvent.click(sampleItem);

        // Wait a moment for the callback to be processed
        await waitFor(
            () => {
                expect(mockSelectCallback).toHaveBeenCalled();
            },
            { timeout: 3000 },
        );

        // Check that selected data is displayed (might need to wait for state update)
        await waitFor(() => {
            // The selected data should show the item ID in the paragraph element
            expect(screen.getByText('sampleFolder')).toBeInTheDocument();
        });
    });

    it('should handle custom buttonModeText prop', async () => {
        mockSuccessfulSearch();

        const customButtonText = 'Choose Your Data';

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                buttonModeText={customButtonText}
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        // Should show custom button text instead of default
        expect(screen.getByText(customButtonText)).toBeInTheDocument();
        expect(screen.queryByText('Select Data')).not.toBeInTheDocument();
    });

    it('should open viewer when button is clicked in button mode', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        // Initially viewer should be closed
        expect(screen.queryByText('sampleFolder')).not.toBeInTheDocument();

        // Click the button to open viewer
        const openButton = screen.getByText('Select Data');
        fireEvent.click(openButton);

        // Wait for viewer to open and load data
        await waitFor(() => {
            expect(screen.getByText('sampleFolder')).toBeInTheDocument();
        });

        // Should show the close instruction
        expect(screen.getByText(/select an item or click outside to close/i)).toBeInTheDocument();
    });

    it('should close viewer when clicking outside in button mode', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        // Open the viewer
        const openButton = screen.getByText('Select Data');
        fireEvent.click(openButton);

        // Wait for viewer to open
        await waitFor(() => {
            expect(screen.getByText('sampleFolder')).toBeInTheDocument();
        });

        // Click on the overlay (outside the content area)
        const overlay = screen
            .getByText(/select an item or click outside to close/i)
            .closest('div');
        if (overlay?.parentElement) {
            fireEvent.click(overlay.parentElement);
        }

        // Wait for viewer to close
        await waitFor(() => {
            expect(screen.queryByText('sampleFolder')).not.toBeInTheDocument();
        });

        // Button should still be visible
        expect(screen.getByText('Select Data')).toBeInTheDocument();
    });

    it('should show all button mode options when all props are enabled', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                inButtonModeShowApiKeyInput={true}
                inButtonModeShowReverseSortInput={true}
                inButtonModeShowSelectedData={true}
                buttonModeText="Custom Button Text"
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        // Should show custom button text
        expect(screen.getByText('Custom Button Text')).toBeInTheDocument();

        // Should show API key input
        expect(screen.getByPlaceholderText(/enter api key/i)).toBeInTheDocument();

        // Should show reverse sort input
        expect(screen.getByRole('checkbox')).toBeInTheDocument();

        // Selected data area should be available (even if empty initially)
        // This depends on the implementation - might be a placeholder or hidden initially
    });

    it('should update API key when input is changed in button mode', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                inButtonModeShowApiKeyInput={true}
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        const apiKeyInput = screen.getByPlaceholderText(/enter api key/i);

        // Change the API key value
        fireEvent.change(apiKeyInput, { target: { value: 'new-test-api-key' } });

        // Verify the input value changed
        expect(apiKeyInput).toHaveValue('new-test-api-key');
    });

    it('should apply buttonClassName to the trigger button in button mode', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                enableStartupScreen={false}
                reverseSort={false}
                buttonClassName="bg-red-500 custom-trigger"
            />,
        );

        const triggerButton = screen.getByRole('button', { name: 'Select Data' });
        // Custom classes should be merged onto the trigger button.
        expect(triggerButton).toHaveClass('custom-trigger');
        // tailwind-merge / cn should let a later bg-* class override the default bg-blue-600.
        expect(triggerButton).toHaveClass('bg-red-500');
        expect(triggerButton).not.toHaveClass('bg-blue-600');
    });

    it('should update reverse sort when checkbox is changed in button mode', async () => {
        mockSuccessfulSearch();

        render(
            <Tiled
                tiledBaseUrl="https://test-server.example.com/api/v1"
                isButtonMode={true}
                inButtonModeShowReverseSortInput={true}
                enableStartupScreen={false}
                reverseSort={false}
            />,
        );

        const reverseSortInput = screen.getByRole('checkbox');

        // Toggle the reverse sort checkbox
        fireEvent.click(reverseSortInput);

        // Verify the checkbox is checked
        expect(reverseSortInput).toBeChecked();
    });
});
