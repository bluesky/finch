import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TiledSearchBar from '@/components/Tiled/TiledFinder/TiledSearchBar';

describe('TiledSearchBar Component', () => {
    const mockHandleSearchId = vi.fn();
    const mockHandleSearchMetadata = vi.fn();
    const mockHandleSearchSpec = vi.fn();

    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up any lingering timers
        vi.clearAllTimers();
    });

    const renderSearchBar = (props = {}) => {
        return render(
            <TiledSearchBar
                handleSearchIdClick={mockHandleSearchId}
                handleSearchMetadataClick={mockHandleSearchMetadata}
                handleSearchSpecClick={mockHandleSearchSpec}
                debounceMs={100} // Shorter debounce for testing
                {...props}
            />,
        );
    };

    // Helper function to get the search container
    const getSearchContainer = () => document.querySelector('svg')?.closest('div');

    describe('Initial State and Expansion', () => {
        it('should render only the magnifying glass icon initially', () => {
            renderSearchBar();

            // Should show magnifying glass icon (SVG)
            const magnifyingGlass = document.querySelector('svg');
            expect(magnifyingGlass).toBeInTheDocument();

            // Should show input field but with invisible classes (w-0 max-w-0)
            const input = screen.getByRole('textbox');
            expect(input).toHaveClass('w-0', 'max-w-0');
        });

        it('should expand the input field when magnifying glass is clicked', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            // Find and click the magnifying glass SVG container
            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            // Input field should now be visible (no longer have w-0 max-w-0 classes)
            await waitFor(() => {
                const input = screen.getByRole('textbox');
                expect(input).not.toHaveClass('w-0', 'max-w-0');
            });

            // Input should be focused
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('should auto-focus the input when expanded', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            await waitFor(() => {
                const input = screen.getByRole('textbox');
                expect(input).toHaveFocus();
            });
        });
    });

    describe('Search Functionality', () => {
        it('should automatically trigger ID search when user types (debounced)', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            // Expand the search bar
            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            // Type in the input
            const input = screen.getByRole('textbox');
            await user.type(input, 'test-search');

            // Should not call immediately (debounced)
            expect(mockHandleSearchId).not.toHaveBeenCalled();

            // Wait for debounce to complete using waitFor
            await waitFor(
                () => {
                    expect(mockHandleSearchId).toHaveBeenCalledWith('test-search');
                },
                { timeout: 1000 },
            );
        }, 10000);

        it('should not trigger search for empty input', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, '   '); // Just spaces

            // Wait for potential debounce, but it should NOT trigger
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Should not call search for empty/whitespace input
            expect(mockHandleSearchId).not.toHaveBeenCalled();
            expect(mockHandleSearchMetadata).not.toHaveBeenCalled();
            expect(mockHandleSearchSpec).not.toHaveBeenCalled();
        }, 10000);

        it('should trigger immediate search when Enter is pressed', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, 'immediate-search');

            // Make sure the dropdown is visible (required for Enter to work)
            expect(screen.getByText('id is "immediate-search"')).toBeInTheDocument();

            await user.keyboard('{Enter}');

            // Should call immediately, not wait for debounce
            expect(mockHandleSearchId).toHaveBeenCalledWith('immediate-search');
        }, 10000);
    });

    describe('Dropdown Functionality', () => {
        it('should show dropdown when user starts typing', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, 'test');

            // Dropdown should appear
            expect(screen.getByText('id is "test"')).toBeInTheDocument();
            expect(screen.getByText('metadata key or value is "test"')).toBeInTheDocument();
            expect(screen.getByText('spec is "test"')).toBeInTheDocument();
        }, 10000);

        it('should hide dropdown when input is cleared', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, 'test');

            // Dropdown should appear
            expect(screen.getByText('id is "test"')).toBeInTheDocument();

            // Clear the input
            await user.clear(input);

            // Dropdown should disappear
            expect(screen.queryByText('id is "test"')).not.toBeInTheDocument();
        }, 10000);

        it('should trigger appropriate search when dropdown option is clicked', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, 'dropdown-test');

            // Wait for dropdown to appear
            expect(
                screen.getByText('metadata key or value is "dropdown-test"'),
            ).toBeInTheDocument();

            // Click on metadata option
            await user.click(screen.getByText('metadata key or value is "dropdown-test"'));

            expect(mockHandleSearchMetadata).toHaveBeenCalledWith('dropdown-test');
        }, 10000);
    });

    describe('Search Type Selection', () => {
        it('should show type indicator after selecting a search type', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, 'type-test');

            // Click on spec option
            expect(screen.getByText('spec is "type-test"')).toBeInTheDocument();
            await user.click(screen.getByText('spec is "type-test"'));

            // Should show type indicator
            expect(screen.getByText('spec')).toBeInTheDocument();
        }, 10000);

        it('should trigger search with new type when type is changed', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, 'type-change-test');

            // Select metadata type first
            await waitFor(() => {
                expect(
                    screen.getByText('metadata key or value is "type-change-test"'),
                ).toBeInTheDocument();
            });
            await user.click(screen.getByText('metadata key or value is "type-change-test"'));

            expect(mockHandleSearchMetadata).toHaveBeenCalledWith('type-change-test');

            // Clear the mock to test type change
            mockHandleSearchMetadata.mockClear();

            // Click on the type indicator to open type dropdown
            const typeIndicator = screen.getByText('md');
            await user.click(typeIndicator);

            // Change to spec type
            await waitFor(() => {
                expect(screen.getByText('spec')).toBeInTheDocument();
            });
            const specOption = screen
                .getAllByText('spec')
                .find((el) => el.closest('.absolute.top-full') !== null);
            await user.click(specOption!);

            // Should trigger spec search with the same input
            expect(mockHandleSearchSpec).toHaveBeenCalledWith('type-change-test');
        });

        it('should use default ID search when no type is selected and Enter is pressed', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, 'default-search');
            await user.keyboard('{Enter}');

            // Should default to ID search
            expect(mockHandleSearchId).toHaveBeenCalledWith('default-search');
        });
    });

    describe('Keyboard Navigation', () => {
        it('should close search bar when Escape is pressed', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            // Input should be visible
            expect(screen.getByRole('textbox')).toBeInTheDocument();

            // Press Escape
            await user.keyboard('{Escape}');

            // Input should be hidden (have w-0 max-w-0 classes again)
            await waitFor(() => {
                const input = screen.getByRole('textbox');
                expect(input).toHaveClass('w-0', 'max-w-0');
            });
        });

        it('should navigate dropdown options with arrow keys', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');
            await user.type(input, 'arrow-test');

            // Wait for dropdown
            expect(screen.getByText('id is "arrow-test"')).toBeInTheDocument();

            // Press down arrow - first option should be focused
            await user.keyboard('{ArrowDown}');

            // Press Enter to select first option (id)
            await user.keyboard('{Enter}');

            expect(mockHandleSearchId).toHaveBeenCalledWith('arrow-test');
        }, 10000);
    });

    describe('Click Outside Behavior', () => {
        it('should close search bar when clicking outside', async () => {
            const user = userEvent.setup();
            render(
                <div>
                    <TiledSearchBar
                        handleSearchIdClick={mockHandleSearchId}
                        handleSearchMetadataClick={mockHandleSearchMetadata}
                        handleSearchSpecClick={mockHandleSearchSpec}
                    />
                    <div data-testid="outside">Outside element</div>
                </div>,
            );

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            // Input should be visible
            expect(screen.getByRole('textbox')).toBeInTheDocument();

            // Click outside
            await user.click(screen.getByTestId('outside'));

            // Input should be hidden (have w-0 max-w-0 classes again)
            await waitFor(() => {
                const input = screen.getByRole('textbox');
                expect(input).toHaveClass('w-0', 'max-w-0');
            });
        });
    });

    describe('Debounce Behavior', () => {
        it('should cancel previous search when typing quickly', async () => {
            const user = userEvent.setup();
            renderSearchBar();

            const searchContainer = getSearchContainer();
            await user.click(searchContainer!);

            const input = screen.getByRole('textbox');

            // Type first search
            await user.type(input, 'first');

            // Quickly clear and type again (should cancel first search)
            await user.clear(input);
            await user.type(input, 'second');

            // Wait for debounce to complete
            await waitFor(
                () => {
                    expect(mockHandleSearchId).toHaveBeenCalledTimes(1);
                    expect(mockHandleSearchId).toHaveBeenCalledWith('second');
                },
                { timeout: 1000 },
            );
        }, 10000);
    });
});
