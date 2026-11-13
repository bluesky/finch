import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import {
    isTiledApiError,
    getTiledSearch,
    setDefaultBearerToken,
    setGlobalApiKey,
    getDefaultTiledInitialPath,
    getTiledMetadata,
} from '@/api/tiled';
import { getAuthFromLocalStorage } from './utils';
import {
    TiledSearchResult,
    TiledSearchItem,
    Breadcrumb,
    ArrayStructure,
    AwkwardStructure,
    ContainerStructure,
    TableStructure,
    TiledStructures,
    PreviewSize,
    isArrayStructure,
    isContainerStructure,
    isTableStructure,
    isAwkwardStructure,
    isSparseStructure,
    SparseStructure,
} from './types';
import {
    getTiledStructureIcon,
    generateSearchPath,
    getLastSearchFromLocalStorage,
    writeSearchPathToLocalStorage,
} from './utils';

export type useTiledProps = {
    url?: string;
    apiKey?: string;
    searchPath?: string;
    bearerToken?: string;
    initialSearchPath?: string;
    reverseSort?: boolean;
    pageLimit?: number;
    reloadLastItemOnStartup?: boolean;
    /** Called when a request is rejected with 401, so the viewer can show its login screen. */
    onAuthError?: () => void;
};
type Url = string;

/**
 * Helper function to calculate the effective ancestor length accounting for global initial path
 * @param ancestors - Array of ancestor strings from a TiledSearchItem
 * @returns The effective ancestor length after accounting for global initial path segments
 */
const getEffectiveAncestorLength = (ancestors: string[]): number => {
    const globalInitialPath = getDefaultTiledInitialPath();
    let effectiveAncestorLength = ancestors.length;

    if (globalInitialPath) {
        const cleanGlobalPath = globalInitialPath.replace(/^\/+|\/+$/g, '');
        const globalPathSegments = cleanGlobalPath ? cleanGlobalPath.split('/') : [];

        // If ancestors start with the global initial path segments, subtract those from the length
        if (globalPathSegments.length > 0 && ancestors.length >= globalPathSegments.length) {
            const ancestorsStartWithGlobal = globalPathSegments.every(
                (segment, index) => ancestors[index] === segment,
            );

            if (ancestorsStartWithGlobal) {
                effectiveAncestorLength = ancestors.length - globalPathSegments.length;
            }
        }
    }

    return effectiveAncestorLength;
};

export const useTiled = ({
    url,
    apiKey,
    searchPath,
    bearerToken,
    initialSearchPath,
    reverseSort,
    pageLimit,
    reloadLastItemOnStartup,
    onAuthError,
}: useTiledProps) => {
    // Finch's client only calls its global auth-error callback after a failed token refresh against
    // its own configured server, and the viewer sends a per-call baseUrl. A 401 here therefore
    // surfaces as a rejected request, and the viewer routes it to the login screen itself. Held in a
    // ref because several callbacks below have frozen dependency arrays.
    const onAuthErrorRef = useRef(onAuthError);
    onAuthErrorRef.current = onAuthError;
    const handleRequestError = useCallback((error: unknown) => {
        if (isTiledApiError(error) && error.status === 401) {
            onAuthErrorRef.current?.();
            return;
        }
        console.error('Tiled request failed:', error);
    }, []);
    const [columns, setColumns] = useState<TiledSearchResult[]>([]);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [popoutUrl, setPopoutUrl] = useState<string | undefined>();
    const [previewSize, setPreviewSize] = useState<PreviewSize>('hidden');
    const [previewItem, setPreviewItem] = useState<
        | TiledSearchItem<ArrayStructure>
        | TiledSearchItem<TableStructure>
        | TiledSearchItem<AwkwardStructure>
        | TiledSearchItem<SparseStructure>
        | null
    >(null);
    const [selectedContainerForPreview, setSelectedContainerForPreview] =
        useState<TiledSearchItem<ContainerStructure> | null>(null);
    const [warning, setWarning] = useState<string | undefined>(undefined);
    const [remainingHistoryArray, setRemainingHistoryArray] = useState<string[] | null>(null);
    const ancestorStack = useRef<TiledSearchItem<TiledStructures>[]>([]);
    const currentAncestorId = useRef<number>(-1);

    const localStorageHistoryPath = useMemo(() => getLastSearchFromLocalStorage(), []);
    const preloadedColumnsPath = useMemo(
        () =>
            initialSearchPath
                ? initialSearchPath
                : localStorageHistoryPath
                  ? localStorageHistoryPath
                  : null,
        [initialSearchPath, localStorageHistoryPath],
    );

    let handleLeftArrowClick: () => void;
    let handleRightArrowClick: () => void;
    //Update the arrow click functions so they always have the correct pathing.
    //there may be a better way to do this without relying on state updates re-running 'useTiled.ts' and
    //subsequently recreating these functions, but this does work and eleminates the <TiledHeader /> component
    //from needing to know anything related to the business logic.
    if (currentAncestorId.current > -1) {
        handleLeftArrowClick = () => {
            currentAncestorId.current = currentAncestorId.current - 1;
            if (currentAncestorId.current < 0) {
                //uesr has clicked back onto the root directory
                void getTiledSearch(
                    searchPath || '',
                    { searchOptions: { sort: reverseSort ? '-' : '', pageLimit } },
                    { baseUrl: url, initialPath: initialSearchPath },
                )
                    .then((res: TiledSearchResult) => setColumns([res]))
                    .catch(handleRequestError);
                setBreadcrumbs([]);
                setImageUrl('');
                setPopoutUrl('');
                setPreviewSize('hidden');
                writeSearchPathToLocalStorage('');
            } else {
                //user has clicked back onto a container.
                const item = ancestorStack.current[currentAncestorId.current];
                updateCurrentSelectedItem(item);
                writeSearchPathToLocalStorage(item);
            }
        };
    }

    if (currentAncestorId.current + 1 < ancestorStack.current.length) {
        handleRightArrowClick = () => {
            currentAncestorId.current = currentAncestorId.current + 1;
            const item = ancestorStack.current[currentAncestorId.current];
            updateCurrentSelectedItem(item);
            writeSearchPathToLocalStorage(item);
        };
    }

    const defaultPreviewSize = 'medium';

    const updateColumns = useCallback(
        (clickedItem: TiledSearchItem<TiledStructures>, newColumn?: TiledSearchResult) => {
            setColumns((prevState) => {
                const effectiveAncestorLength = getEffectiveAncestorLength(
                    clickedItem.attributes.ancestors,
                );
                const newState = prevState.slice(0, effectiveAncestorLength + 1);

                if (newColumn) {
                    return [...newState, newColumn];
                }

                return newState;
            });
        },
        [],
    );

    const replaceLastColumnWithSingleSearchResult = useCallback((newColumn: TiledSearchResult) => {
        setColumns((prevState) => {
            const newState = [...prevState.slice(0, -1), newColumn];
            return newState;
        });
    }, []);

    const updateBreadcrumbs = useCallback((clickedItem: TiledSearchItem<TiledStructures>) => {
        //function assumes users may only click on items that exist in the current search 'stack' and cannot jump to a different branch
        setBreadcrumbs((prevState) => {
            const stateCopy = [...prevState]; //must use shallow to copy to hold function references
            const effectiveAncestorLength = getEffectiveAncestorLength(
                clickedItem.attributes.ancestors,
            );

            while (stateCopy.length > effectiveAncestorLength) {
                stateCopy.pop();
            }

            const newBreadcrumb: Breadcrumb = {
                label: clickedItem.id,
                icon: getTiledStructureIcon(clickedItem),
                onClick: () => handleColumnItemClick(clickedItem),
            };
            stateCopy.push(newBreadcrumb);
            return stateCopy;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const closePreview = () => {
        //remove the preview component from
        setImageUrl(undefined);
        setPopoutUrl(undefined);
        setPreviewSize('hidden');
    };

    const updateAncestorRefs = (item: TiledSearchItem<TiledStructures>) => {
        //this function is only called when the user navigates by directly clicking an item, not using the nav arrows
        const effectiveAncestorLength = getEffectiveAncestorLength(item.attributes.ancestors);

        currentAncestorId.current = effectiveAncestorLength;
        ancestorStack.current = ancestorStack.current.slice(0, currentAncestorId.current);
        ancestorStack.current = [...ancestorStack.current, item];
    };
    const handleColumnItemClick = useCallback((item: TiledSearchItem<TiledStructures>) => {
        updateAncestorRefs(item);
        updateCurrentSelectedItem(item);
        writeSearchPathToLocalStorage(item);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRowItemClick = useCallback(
        (item: TiledSearchItem<TiledStructures>, depth: number) => {
            if (isContainerStructure(item)) {
                setBreadcrumbs((prevBreadcrumbs) => {
                    // if already expanded at this depth, collapse
                    if (
                        prevBreadcrumbs.length > depth &&
                        prevBreadcrumbs[depth].label === item.id
                    ) {
                        setColumns((prevCols) => prevCols.slice(0, depth + 1));
                        setSelectedContainerForPreview(null);
                        setPreviewItem(null);
                        ancestorStack.current = ancestorStack.current.slice(0, depth);
                        currentAncestorId.current = depth - 1;
                        return prevBreadcrumbs.slice(0, depth);
                    }
                    // otherwise expand: fire network request
                    const searchPath = generateSearchPath(item);
                    const firstSortKey = item.attributes.sorting
                        ? item.attributes.sorting[0].key
                        : undefined;
                    void getTiledSearch(
                        searchPath,
                        { searchOptions: { sort: firstSortKey, pageLimit } },
                        { baseUrl: url, initialPath: initialSearchPath },
                    )
                        .then((res: TiledSearchResult) => {
                            updateColumns(item, res);
                        })
                        .catch(handleRequestError);
                    setSelectedContainerForPreview(item);
                    setPreviewItem(null);
                    setPreviewSize('hidden');
                    updateAncestorRefs(item);
                    writeSearchPathToLocalStorage(item);

                    const newState = prevBreadcrumbs.slice(0, depth);
                    const newBreadcrumb: Breadcrumb = {
                        label: item.id,
                        icon: getTiledStructureIcon(item),
                        onClick: () => handleRowItemClick(item, depth),
                    };
                    return [...newState, newBreadcrumb];
                });
            } else {
                // non-container: show preview
                updateAncestorRefs(item);
                updateCurrentSelectedItem(item);
                writeSearchPathToLocalStorage(item);
                setSelectedContainerForPreview(null);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [url, initialSearchPath, pageLimit, updateColumns],
    );

    const updateCurrentSelectedItem = (item: TiledSearchItem<TiledStructures>) => {
        if (isArrayStructure(item)) {
            handleArrayClick(item);
        } else if (isTableStructure(item)) {
            handleTableClick(item);
        } else if (isContainerStructure(item)) {
            handleContainerClick(item);
        } else if (isAwkwardStructure(item)) {
            handleAwkwardClick(item);
        } else if (isSparseStructure(item)) {
            handleSparseClick(item);
        } else {
            console.error(
                'Error: No matching structure family found for: ' +
                    item.attributes.structure_family,
            );
            console.log({ item });
        }
    };

    const handleArrayClick = useCallback((item: TiledSearchItem<ArrayStructure>) => {
        setPreviewItem(item);
        updateBreadcrumbs(item);
        setPreviewSize(defaultPreviewSize);
        updateColumns(item);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTableClick = useCallback((item: TiledSearchItem<TableStructure>) => {
        setPreviewItem(item);
        updateBreadcrumbs(item);
        setPreviewSize(defaultPreviewSize);
        updateColumns(item);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleContainerClick = (item: TiledSearchItem<ContainerStructure>) => {
        //search container, put results into column, disable preview
        setPreviewItem(null);
        const searchPath = generateSearchPath(item);
        const firstSortKey = item.attributes.sorting ? item.attributes.sorting[0].key : undefined; //sort key may be 'time' for RE data or defaults to '_'
        void getTiledSearch(
            searchPath,
            { searchOptions: { sort: firstSortKey, pageLimit } },
            { baseUrl: url, initialPath: initialSearchPath },
        )
            .then((res: TiledSearchResult) => handleSearchResponse(item, res))
            .catch(handleRequestError);
        closePreview();
    };

    const handleAwkwardClick = (item: TiledSearchItem<AwkwardStructure>) => {
        setPreviewItem(item);
        updateBreadcrumbs(item);
        setPreviewSize(defaultPreviewSize);
        updateColumns(item);
    };

    const handleSparseClick = (item: TiledSearchItem<SparseStructure>) => {
        setPreviewItem(item);
        updateBreadcrumbs(item);
        setPreviewSize(defaultPreviewSize);
        updateColumns(item);
    };

    const handleSearchResponse = useCallback(
        (clickedItem: TiledSearchItem<TiledStructures>, res: TiledSearchResult) => {
            updateColumns(clickedItem, res);
            updateBreadcrumbs(clickedItem);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const resetAllData = () => {
        setBreadcrumbs([]);
        writeSearchPathToLocalStorage('');
        ancestorStack.current = [];
        currentAncestorId.current = -1;
        setPreviewItem(null);
        setSelectedContainerForPreview(null);
        setPreviewSize('hidden');
        setColumns([]); //api call can take some time for larger dbs, so clear out existing columns first
        void getTiledSearch(
            searchPath || '',
            { searchOptions: { sort: reverseSort ? '-' : '', pageLimit } },
            { baseUrl: url, initialPath: initialSearchPath },
        )
            .then((res: TiledSearchResult) => setColumns([res]))
            .catch(handleRequestError);
    };

    const handleSearchId = useCallback(
        async (id: string) => {
            //the tiled api doesn't provide a direct way to do a partial search on id (only metadata and spec)
            //so we make new api request to tiled for the specific id as the path in the url
            //this is not really a 'search' as a much as a shot in the dark to see if there is a path
            //perform the search off the existing searchPath or root if none provided

            //concatenate the id onto the last column's path if it exists
            const searchPathWithId =
                ancestorStack.current.length > 0
                    ? generateSearchPath(
                          ancestorStack.current[ancestorStack.current.length - 1],
                          id,
                      )
                    : id;
            try {
                //check if the items metadata exists and append to the last column if it does
                const metadataResult = await getTiledMetadata(searchPathWithId, {
                    baseUrl: url || '',
                }).catch(() => null);
                if (metadataResult) {
                    //construct new column array because metadata searches are missing the links field
                    //wipe out the current column and place only the specified item
                    const newColumn: TiledSearchResult = {
                        data: [metadataResult],
                        links: {
                            self: '?page[offset]=0&page[limit]=1',
                            first: '?page[offset]=0&page[limit]=1',
                            last: '?page[offset]=0&page[limit]=1',
                            next: null,
                            prev: null,
                        },
                        meta: { count: 1 },
                        error: null,
                    };
                    replaceLastColumnWithSingleSearchResult(newColumn);
                } else {
                    //TODO display something to say no results found
                    const emptyColumn: TiledSearchResult = {
                        data: [],
                        links: {
                            self: '?page[offset]=0&page[limit]=1',
                            first: '?page[offset]=0&page[limit]=1',
                            last: '?page[offset]=0&page[limit]=1',
                            next: null,
                            prev: null,
                        },
                        meta: { count: 0 },
                        error: null,
                    };
                    replaceLastColumnWithSingleSearchResult(emptyColumn);
                }
            } catch (error) {
                console.error('Error performing search by ID:', error);
            }
        },
        [replaceLastColumnWithSingleSearchResult, url],
    );

    const handleSearchMetadata = useCallback(
        async (metadata: string) => {
            //perform a metadata search on the current path
            const currentPath =
                ancestorStack.current.length > 0
                    ? generateSearchPath(ancestorStack.current[ancestorStack.current.length - 1])
                    : '';
            try {
                const results: TiledSearchResult = await getTiledSearch(
                    currentPath,
                    {
                        searchFilters: { fulltext: { text: metadata } },
                        searchOptions: { sort: reverseSort ? '-' : '', pageLimit },
                    },
                    { baseUrl: url, initialPath: initialSearchPath },
                );
                if (results) {
                    //update the last column with the new search results
                    console.log('handleSearchMetadata results');
                    replaceLastColumnWithSingleSearchResult(results);
                }
            } catch (error) {
                //TODO display error. maybe something to say no results found
                console.error('Error performing metadata search:', error);
            }
        },
        [initialSearchPath, pageLimit, replaceLastColumnWithSingleSearchResult, reverseSort, url],
    );

    const handleSearchSpec = useCallback(
        async (spec: string) => {
            //perform a spec search on the current path
            const currentPath =
                ancestorStack.current.length > 0
                    ? generateSearchPath(ancestorStack.current[ancestorStack.current.length - 1])
                    : '';
            try {
                const results: TiledSearchResult = await getTiledSearch(
                    currentPath,
                    {
                        searchFilters: { specs: { include: [spec], exclude: [] } },
                        searchOptions: { sort: reverseSort ? '-' : '', pageLimit },
                    },
                    { baseUrl: url, initialPath: initialSearchPath },
                );
                if (results) {
                    //update the last column with the new search results
                    replaceLastColumnWithSingleSearchResult(results);
                }
            } catch (error) {
                //TODO display error. maybe something to say no results found
                console.error('Error performing spec search:', error);
            }
        },
        [initialSearchPath, pageLimit, replaceLastColumnWithSingleSearchResult, reverseSort, url],
    );

    const initializeData = useCallback(async () => {
        //attempt to get data from base Tiled Url. Display error on UI if no data comes back
        let response = null;
        const auth = getAuthFromLocalStorage();
        if (auth) {
            setDefaultBearerToken(auth.accessToken);
        }
        if (bearerToken) setDefaultBearerToken(bearerToken); //if there is both accessToken in localStorage and a bearerToken prop, the bearerToken prop takes precedence
        if (apiKey) {
            setGlobalApiKey(apiKey); //will add apiKey to ALL future requests, in testing there were issues with the cookies being sent after the intial apiKey call so this is done on each req
        }
        try {
            response = await getTiledSearch(
                searchPath || '',
                { searchOptions: { sort: reverseSort ? '-' : '', pageLimit } },
                { baseUrl: url, initialPath: initialSearchPath },
            );
        } catch (error) {
            if (isTiledApiError(error) && error.status === 401) {
                onAuthErrorRef.current?.();
                return;
            }
            console.error('Error fetching search results:', error);
            setWarning(
                'There was an error connecting to the Tiled server. Please check the console for more details.',
            );
        }
        if (response !== null && typeof response !== 'string' && 'data' in response) {
            setColumns([response]);
        } else {
            setWarning(
                'There was an error connecting to the Tiled server. Please check the console for more details.',
            );
        }
    }, [apiKey, bearerToken, reverseSort, searchPath, url, initialSearchPath, pageLimit]);

    const reloadLastSearch = useCallback(
        (searchPath: string) => {
            //make a search for the searchPath id in the last column
            const lastColumn = columns[columns.length - 1];

            //columns contains an array of objects, each object has an id, if the id matches the searchPath then call handleColumnItemClick(matchingItem)
            const matchingItem = lastColumn.data.find(
                (item: TiledSearchItem<TiledStructures>) => item.id === searchPath,
            );
            if (matchingItem) {
                handleColumnItemClick(matchingItem);
                setRemainingHistoryArray((prev) => (prev ? prev.slice(1) : null)); //return the original array with the first element removed. returns empty array on last search
            } else {
                console.warn(
                    `Attempted to load previous search, no matching item found for search path: ${searchPath} in the current page offset, initializing at root.`,
                );
                setRemainingHistoryArray(null);
            }
        },
        [columns, handleColumnItemClick],
    );

    const handleNewPageClick = (link: Url, columnIndex: number, nextPageIndex?: number) => {
        //in a column if results exceed page limit the left/right arrows are enabled for making subsequent requests at the same path with different page offsets
        if (!link) return; //if no link is provided, do nothing
        //we don't want to use the exact hostname in case the user has any sort of proxy setup, therefore strip off the page offset and limit as a single string
        const newPageUrl = new URL(link);
        const pageOffset = nextPageIndex
            ? nextPageIndex
            : parseInt(newPageUrl.searchParams.get('page[offset]') || '0');
        const pageLimit = parseInt(newPageUrl.searchParams.get('page[limit]') || '100');

        //grab the search path after /search and before the query params
        const searchPath = newPageUrl.pathname.split('/search/')[1].split('?')[0];
        void getTiledSearch(
            searchPath,
            { searchOptions: { pageOffset, pageLimit, sort: reverseSort ? '-' : '' } },
            { baseUrl: url, initialPath: initialSearchPath },
        )
            .then((res: TiledSearchResult) => updateColumnWithNewPage(res, columnIndex))
            .catch(handleRequestError);
    };

    const updateColumnWithNewPage = (newColumn: TiledSearchResult, columnIndex: number) => {
        if (newColumn === null || newColumn.data.length === 0) {
            console.warn('No data returned for the new page.');
            return;
        }
        setColumns((prevState) => {
            const newState = [...prevState];
            newState[columnIndex] = newColumn;
            return newState;
        });
    };

    useEffect(() => {
        //get first set of results from root
        try {
            initializeData();
        } catch (e) {
            console.error('error getting first tiled request: ', e);
            setWarning('Error initializing Tiled data. Please check the console for more details.');
        }

        //kick off the calls to populate the viewer from optional user defined initial path or localStorage history
        if (preloadedColumnsPath) {
            const searchArray = preloadedColumnsPath.split('/').filter(Boolean);
            setRemainingHistoryArray(searchArray);
        }
    }, [initializeData, preloadedColumnsPath]);

    useEffect(() => {
        //keeps triggering to simulate a user clicking a column element until every subpath of preloadedColumnsPath is displayed in the viewer
        //this must be done sequentially so that various state vars can update properly before each successive search

        if (reloadLastItemOnStartup) {
            if (columns.length <= 0) return; //base case when this runs prior to columns initialized with data
            if (!remainingHistoryArray || remainingHistoryArray.length === 0) return; //base case when there are no more subpaths to display

            if (preloadedColumnsPath && remainingHistoryArray) {
                const fullHistoryArray = preloadedColumnsPath.split('/').filter(Boolean);
                const currentHistoryIndex = fullHistoryArray.length - remainingHistoryArray.length; //get the column index we should be searching in
                if (columns.length === currentHistoryIndex + 1) {
                    //only do the search if the column state is ready
                    reloadLastSearch(remainingHistoryArray[0]);
                }
            }
        }
    }, [
        remainingHistoryArray,
        columns,
        preloadedColumnsPath,
        reloadLastSearch,
        reloadLastItemOnStartup,
    ]);

    return useMemo(
        () => ({
            columns,
            breadcrumbs,
            imageUrl,
            popoutUrl,
            previewSize,
            previewItem,
            selectedContainerForPreview,
            handleColumnItemClick,
            handleRowItemClick,
            handleLeftArrowClick,
            handleRightArrowClick,
            resetAllData,
            warning,
            handleNewPageClick,
            handleSearchId,
            handleSearchMetadata,
            handleSearchSpec,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            columns,
            breadcrumbs,
            imageUrl,
            popoutUrl,
            previewSize,
            previewItem,
            selectedContainerForPreview,
            handleColumnItemClick,
            handleRowItemClick,
            resetAllData,
            warning,
            handleNewPageClick,
        ],
    );
};
