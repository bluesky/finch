import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TiledApiProvider, type TiledClientLike } from '@/api/tiled';
import { setupServer } from 'msw/node';
import { detectRGBInfo } from '@/components/Tiled/TiledFinder/utils';

// Import all Preview components
import PreviewNDArray from '@/components/Tiled/TiledFinder/PreviewNDArray';
import PreviewAwkward from '@/components/Tiled/TiledFinder/PreviewAwkward';
import PreviewSparse from '@/components/Tiled/TiledFinder/PreviewSparse';
import PreviewStructuredArray from '@/components/Tiled/TiledFinder/PreviewStructuredArray';
import PreviewTable from '@/components/Tiled/TiledFinder/PreviewTable';
import PreviewXArray from '@/components/Tiled/TiledFinder/PreviewXArray';

// Import types
import {
    TiledSearchItem,
    ArrayStructure,
    AwkwardStructure,
    SparseStructure,
    StructuredArrayStructure,
    TableStructure,
    XArrayStructure,
    TiledTableRow,
    TiledStructuredArrayData,
} from '@/components/Tiled/TiledFinder/types';

// The previews read through Finch's Tiled hooks, so the test injects a fake client through
// TiledApiProvider (the hooks' injection seam) rather than mocking module exports. Methods the
// previews never call are filled in by the provider and throw if reached.
const fakeClient = {
    getArrayAsPng: vi.fn(),
    getArrayAsImagePath: vi.fn(),
    getTablePartitionAsJSONSequence: vi.fn(),
    getArrayAsJSON: vi.fn(),
};

function renderWithClient(ui: ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <TiledApiProvider client={fakeClient as unknown as TiledClientLike}>
                {ui}
            </TiledApiProvider>
        </QueryClientProvider>,
    );
}

// Mock utils functions
vi.mock('@/components/Tiled/TiledFinder/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/components/Tiled/TiledFinder/utils')>();
    return {
        ...actual,
        generateSearchPath: vi.fn().mockReturnValue('/mock/path'),
        onPopoutClick: vi.fn(),
        createSliders: vi.fn().mockReturnValue([{ min: 0, max: 10, index: 0, value: 5 }]),
    };
});

// Mock server setup
const server = setupServer();

// Start server before all tests
beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });

    fakeClient.getArrayAsPng.mockResolvedValue(new Blob(['mock-image'], { type: 'image/png' }));
    fakeClient.getArrayAsImagePath.mockReturnValue('http://mock-url/image.png');
    fakeClient.getTablePartitionAsJSONSequence.mockResolvedValue([]);
    fakeClient.getArrayAsJSON.mockResolvedValue([]);

    // jsdom doesn't implement URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock ResizeObserver for testing environment
    // vitest 4 can only `new` a mock whose implementation is a class or function
    global.ResizeObserver = class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;

    // Mock IntersectionObserver for testing environment
    // vitest 4 can only `new` a mock whose implementation is a class or function
    global.IntersectionObserver = class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    } as unknown as typeof IntersectionObserver;

    // Mock window.matchMedia for chart components
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

// Reset handlers and clean up after each test
afterEach(() => {
    server.resetHandlers();
    server.close();
    vi.clearAllMocks();
});

describe('Preview Components', () => {
    // Mock data for different structure types
    const mockArrayItem: TiledSearchItem<ArrayStructure> = {
        id: 'test-array',
        attributes: {
            ancestors: [],
            structure_family: 'array',
            specs: [],
            metadata: {},
            structure: {
                data_type: {
                    endianness: 'little',
                    kind: 'f',
                    itemsize: 8,
                    dt_units: null,
                },
                chunks: [
                    [100, 100],
                    [100, 100],
                ],
                shape: [100, 100],
                dims: null,
                resizable: false,
            },
            sorting: null,
            data_sources: null,
        },
        links: {
            self: 'http://mock/array',
            full: 'http://mock/array/full',
            block: 'http://mock/array/block',
        },
        meta: null,
    };

    const mockAwkwardItem: TiledSearchItem<AwkwardStructure> = {
        id: 'test-awkward',
        attributes: {
            ancestors: [],
            structure_family: 'awkward',
            specs: [],
            metadata: {},
            structure: {
                length: 3,
                form: {
                    class: 'ListOffsetArray',
                    offsets: 'i64',
                    primitive: 'float64',
                    inner_shape: [],
                    parameters: {},
                    form_key: 'node1',
                    content: {
                        class: 'NumpyArray',
                        primitive: 'float64',
                        inner_shape: [],
                        parameters: {},
                        form_key: 'node2',
                    },
                },
            },
            sorting: null,
            data_sources: null,
        },
        links: {
            self: 'http://mock/awkward',
            full: 'http://mock/awkward/full',
        },
        meta: null,
    };

    const mockSparseItem: TiledSearchItem<SparseStructure> = {
        id: 'test-sparse',
        attributes: {
            ancestors: [],
            structure_family: 'sparse',
            specs: [],
            metadata: {},
            structure: {
                layout: 'COO',
                shape: [100, 100],
                chunks: [[100], [100]],
                dims: null,
                resizable: false,
            },
            sorting: null,
            data_sources: null,
        },
        links: {
            self: 'http://mock/sparse',
            full: 'http://mock/sparse/full',
        },
        meta: null,
    };

    const mockStructuredArrayItem: TiledSearchItem<StructuredArrayStructure> = {
        id: 'test-structured-array',
        attributes: {
            ancestors: [],
            structure_family: 'array',
            specs: [],
            metadata: {},
            structure: {
                data_type: {
                    itemsize: 24,
                    fields: [
                        {
                            name: 'x',
                            dtype: {
                                endianness: 'little',
                                kind: 'f',
                                itemsize: 8,
                                dt_units: null,
                            },
                            shape: null,
                        },
                        {
                            name: 'y',
                            dtype: {
                                endianness: 'little',
                                kind: 'f',
                                itemsize: 8,
                                dt_units: null,
                            },
                            shape: null,
                        },
                        {
                            name: 'z',
                            dtype: {
                                endianness: 'little',
                                kind: 'i',
                                itemsize: 4,
                                dt_units: null,
                            },
                            shape: null,
                        },
                    ],
                },
                chunks: [
                    [50, 25],
                    [50, 25],
                ],
                shape: [100, 100],
                dims: null,
                resizable: false,
            },
            sorting: null,
            data_sources: null,
        },
        links: {
            self: 'http://mock/structured-array',
            full: 'http://mock/structured-array/full',
        },
        meta: null,
    };

    const mockTableItem: TiledSearchItem<TableStructure> = {
        id: 'test-table',
        attributes: {
            ancestors: [],
            structure_family: 'table',
            specs: [],
            metadata: {},
            structure: {
                arrow_schema: 'mock_arrow_schema',
                npartitions: 2,
                columns: ['A', 'B', 'C'],
                resizable: false,
            },
            sorting: null,
            data_sources: null,
        },
        links: {
            self: 'http://mock/table',
            full: 'http://mock/table/full',
            partition: 'http://mock/table/partition',
        },
        meta: null,
    };

    const mockXArrayItem: TiledSearchItem<XArrayStructure> = {
        id: 'test-xarray',
        attributes: {
            ancestors: [],
            structure_family: 'array',
            specs: [],
            metadata: {},
            structure: {
                data_type: {
                    endianness: 'little',
                    kind: 'f',
                    itemsize: 8,
                    dt_units: null,
                },
                chunks: [[50], [50]],
                shape: [100, 100],
                dims: ['x', 'y'],
                resizable: false,
            },
            sorting: null,
            data_sources: null,
        },
        links: {
            self: 'http://mock/xarray',
            full: 'http://mock/xarray/full',
        },
        meta: null,
    };

    // Mock table data for components that load data
    const mockTableData: TiledTableRow[] = [
        { A: 1, B: 2, C: 3 },
        { A: 4, B: 5, C: 6 },
        { A: 7, B: 8, C: 9 },
    ];

    // Mock structured array data (should be arrays, not objects)
    const mockStructuredArrayData: TiledStructuredArrayData = [
        ['rex', 2.5, 100],
        ['fido', 5.5, 200],
        ['max', 8.5, 300],
    ];

    describe('PreviewNDArray Component', () => {
        it('should render array item with title and image container', async () => {
            renderWithClient(<PreviewNDArray arrayItem={mockArrayItem} />);

            await waitFor(() => {
                expect(screen.getByText('test-array')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText(/True Dimensions:/)).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText(/\[100, 100\]/)).toBeInTheDocument();
            });
        });

        it('should handle different array dimensions', async () => {
            const threeDArray = {
                ...mockArrayItem,
                attributes: {
                    ...mockArrayItem.attributes,
                    structure: {
                        ...mockArrayItem.attributes.structure,
                        shape: [10, 100, 100],
                    },
                },
            };

            renderWithClient(<PreviewNDArray arrayItem={threeDArray} />);

            await waitFor(() => {
                expect(screen.getByText('test-array')).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText(/\[10, 100, 100\]/)).toBeInTheDocument();
            });
        });

        it('should handle isFullWidth prop', async () => {
            renderWithClient(<PreviewNDArray arrayItem={mockArrayItem} isFullWidth={true} />);

            await waitFor(() => {
                expect(screen.getByText('test-array')).toBeInTheDocument();
            });
        });

        it('should handle custom URL prop', async () => {
            renderWithClient(
                <PreviewNDArray arrayItem={mockArrayItem} url="https://custom-url.com" />,
            );

            await waitFor(() => {
                expect(screen.getByText('test-array')).toBeInTheDocument();
            });
        });
    });

    describe('PreviewAwkward Component', () => {
        it('should render awkward item with placeholder message', () => {
            renderWithClient(<PreviewAwkward awkwardItem={mockAwkwardItem} />);

            expect(screen.getByText(/You've clicked an awkward item!/)).toBeInTheDocument();
            expect(screen.getByText(/We don't have a preview for this yet/)).toBeInTheDocument();
            expect(screen.getByText('Awkward item ID: test-awkward')).toBeInTheDocument();
        });

        it('should handle custom URL prop', () => {
            renderWithClient(<PreviewAwkward awkwardItem={mockAwkwardItem} />);

            expect(screen.getByText('Awkward item ID: test-awkward')).toBeInTheDocument();
        });
    });

    describe('PreviewSparse Component', () => {
        it('should render sparse item with placeholder message', () => {
            renderWithClient(<PreviewSparse sparseItem={mockSparseItem} />);

            expect(screen.getByText(/You've clicked a sparse item!/)).toBeInTheDocument();
            expect(screen.getByText(/We don't have a preview for this yet/)).toBeInTheDocument();
            expect(screen.getByText('Sparse item ID: test-sparse')).toBeInTheDocument();
        });

        it('should handle custom URL prop', () => {
            renderWithClient(<PreviewSparse sparseItem={mockSparseItem} />);

            expect(screen.getByText('Sparse item ID: test-sparse')).toBeInTheDocument();
        });
    });

    describe('PreviewStructuredArray Component', () => {
        beforeEach(async () => {
            fakeClient.getArrayAsJSON.mockResolvedValue(mockStructuredArrayData);
        });

        it('should render structured array item with table', async () => {
            renderWithClient(
                <PreviewStructuredArray structuredArrayItem={mockStructuredArrayItem} />,
            );

            expect(screen.getByText('test-structured-array')).toBeInTheDocument();

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            });
        });

        it('should show loading state initially', async () => {
            fakeClient.getArrayAsJSON.mockReturnValue(new Promise(() => {})); // Never resolves

            renderWithClient(
                <PreviewStructuredArray structuredArrayItem={mockStructuredArrayItem} />,
            );

            expect(screen.getByText('test-structured-array')).toBeInTheDocument();
        });

        it('should handle custom URL prop', async () => {
            renderWithClient(
                <PreviewStructuredArray
                    structuredArrayItem={mockStructuredArrayItem}
                    url="https://custom-url.com"
                />,
            );

            await waitFor(() => {
                expect(screen.getByText('test-structured-array')).toBeInTheDocument();
            });
        });
    });

    describe('PreviewTable Component', () => {
        beforeEach(async () => {
            fakeClient.getTablePartitionAsJSONSequence.mockResolvedValue(mockTableData);
        });

        it('should render table item with data', async () => {
            renderWithClient(<PreviewTable tableItem={mockTableItem} />);

            // Table title appears immediately; plot title appears after data loads
            await waitFor(() => {
                expect(screen.getAllByText('test-table')).toHaveLength(2);
            });

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            });

            // Check for row count display
            await waitFor(() => {
                expect(screen.getByText(/Rows: 3/)).toBeInTheDocument();
            });
        });

        it('should show partition selector when multiple partitions exist', async () => {
            renderWithClient(<PreviewTable tableItem={mockTableItem} />);

            // Wait for component to render
            await waitFor(() => {
                expect(screen.getAllByText('test-table')).toHaveLength(2);
            });

            // Should show partition selector since npartitions > 1
            await waitFor(() => {
                expect(screen.getAllByDisplayValue('0')).toHaveLength(3); // Multiple inputs with value 0
            });
        });

        it('should handle single partition table', async () => {
            const singlePartitionTable = {
                ...mockTableItem,
                attributes: {
                    ...mockTableItem.attributes,
                    structure: {
                        ...mockTableItem.attributes.structure,
                        npartitions: 1,
                    },
                },
            };

            renderWithClient(<PreviewTable tableItem={singlePartitionTable} />);

            await waitFor(() => {
                expect(screen.getAllByText('test-table')).toHaveLength(2);
            });

            // Should not show partition selector for single partition
            expect(screen.getAllByDisplayValue('0')).toHaveLength(2); // Only 2 inputs with value 0 (not the SelectInteger)
        });

        it('should handle custom URL prop', async () => {
            renderWithClient(
                <PreviewTable tableItem={mockTableItem} url="https://custom-url.com" />,
            );

            await waitFor(() => {
                expect(screen.getAllByText('test-table')).toHaveLength(2);
            });
        });
    });

    describe('PreviewXArray Component', () => {
        beforeEach(async () => {
            fakeClient.getArrayAsJSON.mockResolvedValue([
                [1, 2],
                [3, 4],
            ]);
        });

        it('should render xarray item with dimensions info', async () => {
            renderWithClient(<PreviewXArray xarrayItem={mockXArrayItem} />);

            expect(screen.getByText('test-xarray')).toBeInTheDocument();
            expect(screen.getByText(/Dimensions: x\(100\) × y\(100\)/)).toBeInTheDocument();

            // Wait for table to render
            await waitFor(() => {
                expect(screen.getByRole('table')).toBeInTheDocument();
            });
        });

        it('should handle 1D xarray data', async () => {
            const oneDXArray = {
                ...mockXArrayItem,
                attributes: {
                    ...mockXArrayItem.attributes,
                    structure: {
                        ...mockXArrayItem.attributes.structure,
                        shape: [100],
                        dims: ['x'],
                    },
                },
            };

            renderWithClient(<PreviewXArray xarrayItem={oneDXArray} />);

            expect(screen.getByText('test-xarray')).toBeInTheDocument();
            expect(screen.getByText(/Dimensions: x\(100\)/)).toBeInTheDocument();
        });

        it('should handle custom URL prop', async () => {
            renderWithClient(
                <PreviewXArray xarrayItem={mockXArrayItem} url="https://custom-url.com" />,
            );

            await waitFor(() => {
                expect(screen.getByText('test-xarray')).toBeInTheDocument();
            });
        });
    });

    describe('Component Error Handling', () => {
        it('should handle API errors gracefully in PreviewTable', async () => {
            fakeClient.getTablePartitionAsJSONSequence.mockRejectedValue(
                new Error('Mock API error'),
            );

            renderWithClient(<PreviewTable tableItem={mockTableItem} />);

            expect(screen.getByText('test-table')).toBeInTheDocument();
            // Component should still render even if API fails
        });

        it('should handle API errors gracefully in PreviewStructuredArray', async () => {
            fakeClient.getArrayAsJSON.mockRejectedValue(new Error('Mock API error'));

            renderWithClient(
                <PreviewStructuredArray structuredArrayItem={mockStructuredArrayItem} />,
            );

            expect(screen.getByText('test-structured-array')).toBeInTheDocument();
            // Component should still render even if API fails
        });

        it('should handle API errors gracefully in PreviewXArray', async () => {
            fakeClient.getArrayAsJSON.mockRejectedValue(new Error('Mock API error'));

            renderWithClient(<PreviewXArray xarrayItem={mockXArrayItem} />);

            expect(screen.getByText('test-xarray')).toBeInTheDocument();
            // Component should still render even if API fails
        });
    });

    describe('RGB Support', () => {
        const makeArrayItem = (shape: number[], colorMode?: string) => ({
            ...mockArrayItem,
            attributes: {
                ...mockArrayItem.attributes,
                metadata: colorMode ? { color_mode: colorMode } : {},
                structure: { ...mockArrayItem.attributes.structure, shape },
            },
        });

        describe('detectRGBInfo', () => {
            it('returns autoRGB=true when metadata color_mode is RGB', () => {
                const result = detectRGBInfo(makeArrayItem([256, 256, 3], 'RGB'), false);
                expect(result.autoRGB).toBe(true);
                expect(result.isRGB).toBe(true);
                expect(result.canToggleRGB).toBe(false);
                expect(result.channelFirst).toBe(false);
            });

            it('returns canToggleRGB=true when last dim is 3 and no metadata', () => {
                const result = detectRGBInfo(makeArrayItem([256, 256, 3]), false);
                expect(result.autoRGB).toBe(false);
                expect(result.canToggleRGB).toBe(true);
                expect(result.isRGB).toBe(false);
            });

            it('activates isRGB when user toggles a candidate', () => {
                const result = detectRGBInfo(makeArrayItem([256, 256, 3]), true);
                expect(result.isRGB).toBe(true);
                expect(result.channelFirst).toBe(false);
            });

            it('detects channelFirst when first dim is 3 and last dim is not', () => {
                const result = detectRGBInfo(makeArrayItem([3, 256, 256], 'RGB'), false);
                expect(result.channelFirst).toBe(true);
            });

            it('returns no RGB info for a regular 2D array', () => {
                const result = detectRGBInfo(makeArrayItem([100, 100]), false);
                expect(result.autoRGB).toBe(false);
                expect(result.canToggleRGB).toBe(false);
                expect(result.isRGB).toBe(false);
            });
        });

        describe('PreviewNDArray RGB rendering', () => {
            it('shows palette toggle icon when last dim is 3 and no color_mode metadata', async () => {
                renderWithClient(<PreviewNDArray arrayItem={makeArrayItem([256, 256, 3])} />);
                await waitFor(() => {
                    expect(screen.getByTitle('Change view to RGB')).toBeInTheDocument();
                });
            });

            it('does not show palette icon when color_mode is RGB (auto mode)', async () => {
                renderWithClient(
                    <PreviewNDArray arrayItem={makeArrayItem([256, 256, 3], 'RGB')} />,
                );
                await waitFor(() => {
                    expect(screen.getByText('test-array')).toBeInTheDocument();
                });
                expect(screen.queryByTitle('Change view to RGB')).not.toBeInTheDocument();
            });

            it('does not show palette icon for a normal 3D array without dim-3 last', async () => {
                renderWithClient(<PreviewNDArray arrayItem={makeArrayItem([10, 256, 256])} />);
                await waitFor(() => {
                    expect(screen.getByText('test-array')).toBeInTheDocument();
                });
                expect(screen.queryByTitle('Change view to RGB')).not.toBeInTheDocument();
            });

            it('toggles palette icon active state on click', async () => {
                renderWithClient(<PreviewNDArray arrayItem={makeArrayItem([256, 256, 3])} />);
                const icon = await screen.findByTitle('Change view to RGB');
                expect(icon).not.toHaveClass('text-sky-600');
                fireEvent.click(icon);
                expect(icon).toHaveClass('text-sky-600');
            });
        });
    });

    describe('Component Integration', () => {
        it('should handle missing optional props gracefully', async () => {
            // Test all components without optional URL prop
            renderWithClient(<PreviewNDArray arrayItem={mockArrayItem} />);
            await waitFor(() => {
                expect(screen.getByText('test-array')).toBeInTheDocument();
            });

            renderWithClient(<PreviewAwkward awkwardItem={mockAwkwardItem} />);
            await waitFor(() => {
                expect(screen.getByText(/Awkward item ID:/)).toBeInTheDocument();
            });

            renderWithClient(<PreviewSparse sparseItem={mockSparseItem} />);
            await waitFor(() => {
                expect(screen.getByText(/Sparse item ID:/)).toBeInTheDocument();
            });

            renderWithClient(
                <PreviewStructuredArray structuredArrayItem={mockStructuredArrayItem} />,
            );
            await waitFor(() => {
                expect(screen.getByText('test-structured-array')).toBeInTheDocument();
            });

            renderWithClient(<PreviewTable tableItem={mockTableItem} />);
            await waitFor(() => {
                expect(screen.getByText('test-table')).toBeInTheDocument();
            });

            renderWithClient(<PreviewXArray xarrayItem={mockXArrayItem} />);
            await waitFor(() => {
                expect(screen.getByText('test-xarray')).toBeInTheDocument();
            });
        });

        it('should handle empty data gracefully', async () => {
            fakeClient.getTablePartitionAsJSONSequence.mockResolvedValue([]);

            renderWithClient(<PreviewTable tableItem={mockTableItem} />);

            await waitFor(() => {
                expect(screen.getByText('test-table')).toBeInTheDocument();
            });
        });
    });
});
