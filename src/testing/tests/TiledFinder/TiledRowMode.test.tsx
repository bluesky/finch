import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Tiled from '@/components/Tiled/TiledFinder/Tiled';
import { mockTiledResponse, mockTiledSearch2PageLimitResponse } from './mocks/responses';
import { resetDefaultTiledApiClient } from '@/api/tiled';

const BASE_URL = 'https://test-server.example.com/api/v1';

const server = setupServer();

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

describe('Tiled row display mode', () => {
    it('shows the preview panel on the right before any item is clicked', async () => {
        server.use(http.get(`${BASE_URL}/search/*`, () => HttpResponse.json(mockTiledResponse)));

        render(<Tiled tiledBaseUrl={BASE_URL} displayMode="rows" />);

        await waitFor(
            () => {
                expect(screen.getByText('sampleFolder')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );

        expect(screen.getByText('Select container or data to preview')).toBeInTheDocument();
    });

    it('renders items in rows mode', async () => {
        server.use(http.get(`${BASE_URL}/search/*`, () => HttpResponse.json(mockTiledResponse)));

        render(<Tiled tiledBaseUrl={BASE_URL} displayMode="rows" />);

        await waitFor(
            () => {
                expect(screen.getByText('sampleFolder')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('renders the same items as column mode', async () => {
        server.use(
            http.get(`${BASE_URL}/search/*`, () =>
                HttpResponse.json(mockTiledSearch2PageLimitResponse),
            ),
        );

        const { unmount } = render(<Tiled tiledBaseUrl={BASE_URL} displayMode="rows" />);

        await waitFor(
            () => {
                expect(
                    screen.getByText(/0e0699be-aaec-432f-b373-b19b95bbef5d/),
                ).toBeInTheDocument();
                expect(
                    screen.getByText(/547e809b-57ed-488b-897e-4595ccb17efa/),
                ).toBeInTheDocument();
            },
            { timeout: 3000 },
        );

        unmount();
        resetDefaultTiledApiClient();

        server.use(
            http.get(`${BASE_URL}/search/*`, () =>
                HttpResponse.json(mockTiledSearch2PageLimitResponse),
            ),
        );

        render(<Tiled tiledBaseUrl={BASE_URL} displayMode="columns" />);

        await waitFor(
            () => {
                expect(
                    screen.getByText(/0e0699be-aaec-432f-b373-b19b95bbef5d/),
                ).toBeInTheDocument();
                expect(
                    screen.getByText(/547e809b-57ed-488b-897e-4595ccb17efa/),
                ).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('shows pagination in rows mode', async () => {
        server.use(
            http.get(`${BASE_URL}/search/*`, () =>
                HttpResponse.json(mockTiledSearch2PageLimitResponse),
            ),
        );

        render(<Tiled tiledBaseUrl={BASE_URL} displayMode="rows" />);

        await waitFor(
            () => {
                expect(screen.getByText('1 - 2 of 62')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('clicking a container in rows mode triggers a sub-search and shows children inline', async () => {
        server.use(
            http.get(`${BASE_URL}/search/*`, ({ request }) => {
                if (request.url.includes('sampleFolder')) {
                    return HttpResponse.json({
                        data: [
                            {
                                id: 'image',
                                attributes: {
                                    ancestors: ['sampleFolder'],
                                    structure_family: 'array',
                                    specs: [],
                                    metadata: {},
                                    structure: {
                                        data_type: {
                                            endianness: 'little',
                                            kind: 'f',
                                            itemsize: 4,
                                            dt_units: null,
                                        },
                                        chunks: [[128], [128], [128]],
                                        shape: [128, 128, 128],
                                        dims: null,
                                        resizable: false,
                                    },
                                    sorting: null,
                                    data_sources: null,
                                },
                                links: {
                                    self: `${BASE_URL}/metadata/sampleFolder/image`,
                                    full: `${BASE_URL}/array/full/sampleFolder/image`,
                                    block: `${BASE_URL}/array/block/sampleFolder/image?block={0},{1},{2}`,
                                },
                                meta: null,
                            },
                        ],
                        links: {
                            self: `${BASE_URL}/search/sampleFolder?page[offset]=0&page[limit]=100`,
                            first: `${BASE_URL}/search/sampleFolder?page[offset]=0&page[limit]=100`,
                            last: `${BASE_URL}/search/sampleFolder?page[offset]=0&page[limit]=100`,
                            next: null,
                            prev: null,
                        },
                        meta: { count: 1 },
                    });
                }
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(<Tiled tiledBaseUrl={BASE_URL} displayMode="rows" />);

        await waitFor(
            () => {
                expect(screen.getByText('sampleFolder')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );

        fireEvent.click(screen.getByText('sampleFolder'));

        await waitFor(
            () => {
                expect(screen.getByText('image')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it('children are rendered inside the same wrapper element as the parent item after expanding a container', async () => {
        server.use(
            http.get(`${BASE_URL}/search/*`, ({ request }) => {
                if (request.url.includes('sampleFolder')) {
                    return HttpResponse.json({
                        data: [
                            {
                                id: 'image',
                                attributes: {
                                    ancestors: ['sampleFolder'],
                                    structure_family: 'array',
                                    specs: [],
                                    metadata: {},
                                    structure: {
                                        data_type: {
                                            endianness: 'little',
                                            kind: 'f',
                                            itemsize: 4,
                                            dt_units: null,
                                        },
                                        chunks: [[128], [128], [128]],
                                        shape: [128, 128, 128],
                                        dims: null,
                                        resizable: false,
                                    },
                                    sorting: null,
                                    data_sources: null,
                                },
                                links: {
                                    self: `${BASE_URL}/metadata/sampleFolder/image`,
                                    full: `${BASE_URL}/array/full/sampleFolder/image`,
                                    block: `${BASE_URL}/array/block/sampleFolder/image?block={0},{1},{2}`,
                                },
                                meta: null,
                            },
                        ],
                        links: {
                            self: `${BASE_URL}/search/sampleFolder?page[offset]=0&page[limit]=100`,
                            first: `${BASE_URL}/search/sampleFolder?page[offset]=0&page[limit]=100`,
                            last: `${BASE_URL}/search/sampleFolder?page[offset]=0&page[limit]=100`,
                            next: null,
                            prev: null,
                        },
                        meta: { count: 1 },
                    });
                }
                return HttpResponse.json(mockTiledResponse);
            }),
        );

        render(<Tiled tiledBaseUrl={BASE_URL} displayMode="rows" />);

        await waitFor(
            () => {
                expect(screen.getByText('sampleFolder')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );

        fireEvent.click(screen.getByText('sampleFolder'));

        await waitFor(
            () => {
                expect(screen.getByText('image')).toBeInTheDocument();
            },
            { timeout: 3000 },
        );

        // In rows mode, TiledRowList renders children inside the same wrapper <div> as
        // the parent <li>. So sampleFolder's li.parentElement should contain 'image'.
        // After expanding, sampleFolder appears in multiple places (breadcrumb, preview header),
        // so find the instance that lives inside a <li> (the row item).
        const folderElements = screen.getAllByText('sampleFolder');
        const folderInList = folderElements.find((el) => el.closest('li') !== null);
        const folderListItem = folderInList?.closest('li');
        const wrapperDiv = folderListItem?.parentElement;
        expect(wrapperDiv).toBeTruthy();
        expect(wrapperDiv).toContainElement(screen.getByText('image'));
    });
});
