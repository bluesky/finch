import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import { isTiledApiError, useTiledClient, useTiledSearchQuery } from '@/api/tiled';
import type { TiledColumnRequest } from './useTiledColumnResult';
import {
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
 * @param globalInitialPath - The client's initial path, which ancestors include but columns do not
 * @returns The effective ancestor length after accounting for global initial path segments
 */
const getEffectiveAncestorLength = (ancestors: string[], globalInitialPath: string): number => {
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
    // Every read goes through Finch's query hooks: each column calls them itself (see
    // useTiledColumnResult), so this hook only decides *which* columns are open. The client — the
    // app's TiledApiProvider, or the one Tiled.tsx builds from its props — is resolved by the hooks.
    const { client } = useTiledClient();
    const initialPathRef = useRef('');
    initialPathRef.current =
        typeof client.getInitialPath === 'function' ? client.getInitialPath() : '';

    const rootRequest = useCallback(
        (revision?: number): TiledColumnRequest => ({
            kind: 'search',
            path: searchPath || '',
            config: { searchOptions: { sort: reverseSort ? '-' : '', pageLimit } },
            isRoot: true,
            revision,
        }),
        [searchPath, reverseSort, pageLimit],
    );
    const containerRequest = useCallback(
        (item: TiledSearchItem<TiledStructures>): TiledColumnRequest => ({
            kind: 'search',
            path: generateSearchPath(item),
            //sort key may be 'time' for RE data or defaults to '_'
            config: {
                searchOptions: {
                    sort: item.attributes.sorting ? item.attributes.sorting[0].key : undefined,
                    pageLimit,
                },
            },
        }),
        [pageLimit],
    );

    // A 401 with no stored session rejects without reaching the client's onAuthError, so columns
    // report failures here and a 401 opens the login screen. A failed top-level listing means the
    // server could not be reached.
    const onAuthErrorRef = useRef(onAuthError);
    onAuthErrorRef.current = onAuthError;
    const handleColumnError = useCallback((request: TiledColumnRequest, error: unknown) => {
        if (isTiledApiError(error) && error.status === 401) {
            onAuthErrorRef.current?.();
            return;
        }
        console.error('Tiled request failed:', error);
        if (request.kind === 'search' && request.isRoot) {
            setWarning(
                'There was an error connecting to the Tiled server. Please check the console for more details.',
            );
        }
    }, []);

    const [columns, setColumns] = useState<TiledColumnRequest[]>([]);
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
                setColumns([rootRequest(Date.now())]);
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
        (clickedItem: TiledSearchItem<TiledStructures>, newColumn?: TiledColumnRequest) => {
            setColumns((prevState) => {
                const effectiveAncestorLength = getEffectiveAncestorLength(
                    clickedItem.attributes.ancestors,
                    initialPathRef.current,
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

    const replaceLastColumn = useCallback((newColumn: TiledColumnRequest) => {
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
                initialPathRef.current,
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
        const effectiveAncestorLength = getEffectiveAncestorLength(
            item.attributes.ancestors,
            initialPathRef.current,
        );

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
                    // otherwise expand: open a column for its contents
                    updateColumns(item, containerRequest(item));
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
        [containerRequest, updateColumns],
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
        updateColumns(item, containerRequest(item));
        updateBreadcrumbs(item);
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

    const resetAllData = () => {
        setBreadcrumbs([]);
        writeSearchPathToLocalStorage('');
        ancestorStack.current = [];
        currentAncestorId.current = -1;
        setPreviewItem(null);
        setSelectedContainerForPreview(null);
        setPreviewSize('hidden');
        setColumns([rootRequest(Date.now())]); //refetch the top level so new runs appear
    };

    const handleSearchId = useCallback(
        (id: string) => {
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
            //show only that item in the last column (empty if it does not exist)
            replaceLastColumn({ kind: 'item', path: searchPathWithId });
        },
        [replaceLastColumn],
    );

    const handleSearchMetadata = useCallback(
        (metadata: string) => {
            //perform a metadata search on the current path
            const currentPath =
                ancestorStack.current.length > 0
                    ? generateSearchPath(ancestorStack.current[ancestorStack.current.length - 1])
                    : '';
            //update the last column with the search results
            replaceLastColumn({
                kind: 'search',
                path: currentPath,
                config: {
                    searchFilters: { fulltext: { text: metadata } },
                    searchOptions: { sort: reverseSort ? '-' : '', pageLimit },
                },
            });
        },
        [pageLimit, replaceLastColumn, reverseSort],
    );

    const handleSearchSpec = useCallback(
        (spec: string) => {
            //perform a spec search on the current path
            const currentPath =
                ancestorStack.current.length > 0
                    ? generateSearchPath(ancestorStack.current[ancestorStack.current.length - 1])
                    : '';
            //update the last column with the search results
            replaceLastColumn({
                kind: 'search',
                path: currentPath,
                config: {
                    searchFilters: { specs: { include: [spec], exclude: [] } },
                    searchOptions: { sort: reverseSort ? '-' : '', pageLimit },
                },
            });
        },
        [pageLimit, replaceLastColumn, reverseSort],
    );

    const handleNewPageClick = (link: Url, columnIndex: number, nextPageIndex?: number) => {
        //in a column if results exceed page limit the left/right arrows are enabled for viewing other pages at the same path
        if (!link) return; //if no link is provided, do nothing
        //only the paging parameters are read from the link; the column keeps its own path and filters
        const newPageUrl = new URL(link);
        const pageOffset = nextPageIndex
            ? nextPageIndex
            : parseInt(newPageUrl.searchParams.get('page[offset]') || '0');
        const pageLimit = parseInt(newPageUrl.searchParams.get('page[limit]') || '100');

        setColumns((prevState) => {
            const column = prevState[columnIndex];
            if (!column || column.kind !== 'search') return prevState;
            const newState = [...prevState];
            newState[columnIndex] = {
                ...column,
                config: {
                    ...column.config,
                    searchOptions: { ...column.config.searchOptions, pageOffset, pageLimit },
                },
            };
            return newState;
        });
    };

    // Open the top-level listing, and again whenever the client or listing options change. The
    // revision makes an already-open column refetch (e.g. after a new API key).
    useEffect(() => {
        setWarning(undefined);
        setColumns([rootRequest(Date.now())]);
        // `url`, `apiKey` and `bearerToken` are not read here: they mean a new client, which is a
        // reason to reload from the root.
    }, [rootRequest, url, apiKey, bearerToken]);

    //kick off restoring the viewer from optional user defined initial path or localStorage history
    useEffect(() => {
        if (preloadedColumnsPath) {
            setRemainingHistoryArray(preloadedColumnsPath.split('/').filter(Boolean));
        }
    }, [preloadedColumnsPath]);

    // Restore one path segment at a time, as if the user clicked it: find the next segment's item in
    // the column that lists it, then select it, which opens the following column. The listing is read
    // with the same useTiledSearchQuery call that column makes, so TanStack serves both from one cache
    // entry and no extra request is sent.
    const fullHistoryArray = useMemo(
        () => (preloadedColumnsPath ? preloadedColumnsPath.split('/').filter(Boolean) : []),
        [preloadedColumnsPath],
    );
    const historyColumnIndex =
        reloadLastItemOnStartup && remainingHistoryArray && remainingHistoryArray.length > 0
            ? fullHistoryArray.length - remainingHistoryArray.length
            : -1;
    // Only once that column is the last one open, i.e. the previous segment has been selected.
    const historyColumn =
        historyColumnIndex >= 0 && columns.length === historyColumnIndex + 1
            ? columns[historyColumnIndex]
            : undefined;
    const historySearch = historyColumn?.kind === 'search' ? historyColumn : undefined;
    const historyListing = useTiledSearchQuery(historySearch?.path ?? '', historySearch?.config, {
        enabled: historySearch !== undefined,
    });
    useEffect(() => {
        if (!historySearch || !remainingHistoryArray) return;
        if (historyListing.isError) {
            setRemainingHistoryArray(null);
            return;
        }
        if (!historyListing.data) return;
        const searchPath = remainingHistoryArray[0];
        const matchingItem = historyListing.data.data.find(
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
    }, [
        historySearch,
        historyListing.data,
        historyListing.isError,
        remainingHistoryArray,
        handleColumnItemClick,
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
            handleColumnError,
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
