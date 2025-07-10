import { useEffect, useState, useRef, useMemo, useCallback } from "react";

import { getSearchResults, getFirstSearchWithApiKey } from "./apiClient";
import { 
    TiledSearchResult, 
    TiledSearchItem, 
    Breadcrumb, 
    ArrayStructure, 
    ContainerStructure, 
    TableStructure, 
    TiledStructures,
    PreviewSize, 
    isArrayStructure,
    isContainerStructure,
    isTableStructure,
 } from "./types";
import { getTiledStructureIcon, generateSearchPath, } from "./utils";
export type useTiledProps = {
    url?: string,
    apiKey?: string,
    searchPath?: string,
}
type Url = string;
export const useTiled = (url?:Url, apiKey?:string, searchPath?:string) => {

    const [ columns, setColumns ] = useState<TiledSearchResult[]>([]);
    const [ breadcrumbs, setBreadcrumbs ] = useState<Breadcrumb[]>([]);
    const [ imageUrl, setImageUrl ] = useState<string | undefined>();
    const [ popoutUrl, setPopoutUrl ] = useState<string | undefined>();
    const [ previewSize, setPreviewSize ] = useState<PreviewSize>('hidden');
    const [ previewItem, setPreviewItem ]  = useState<TiledSearchItem<ArrayStructure> | TiledSearchItem<TableStructure> | null >(null);
    const [ warning, setWarning ] = useState<string | undefined>(undefined);
    const ancestorStack = useRef<TiledSearchItem<TiledStructures>[]>([]);
    const currentAncestorId = useRef<number>(-1);


    var handleLeftArrowClick:Function;
    var handleRightArrowClick:Function;
    //Update the arrow click functions so they always have the correct pathing.
    //there may be a better way to do this without relying on state updates re-running 'useTiled.ts' and
    //subsequently recreating these functions, but this does work and eleminates the <TiledHeader /> component
    //from needing to know anything related to the business logic.
    if (currentAncestorId.current > -1) {
        handleLeftArrowClick = () => {
            console.log('current ID before subtracting is: ' + currentAncestorId.current)
            currentAncestorId.current = currentAncestorId.current - 1;
            if (currentAncestorId.current < 0) {
                //uesr has clicked back onto the root directory
                getSearchResults(searchPath, url, (res:TiledSearchResult) => setColumns([res]));
                setBreadcrumbs([]);
                setImageUrl('');
                setPopoutUrl('');
                setPreviewSize('hidden');
            } else {
                //user has clicked back onto a container.
                const item = ancestorStack.current[currentAncestorId.current]; 
                updateCurrentSelectedItem(item);
            }
        };
    }

    if (currentAncestorId.current + 1 < ancestorStack.current.length) {
        handleRightArrowClick = () => {
            currentAncestorId.current = currentAncestorId.current + 1;
            const item = ancestorStack.current[currentAncestorId.current];
            updateCurrentSelectedItem(item);
        }

    }

    const defaultPreviewSize = 'medium';

    const updateColumns = useCallback((clickedItem:TiledSearchItem<TiledStructures>, newColumn?:TiledSearchResult ) => {
        setColumns((prevState) => {
            const newState = prevState.slice(0, clickedItem.attributes.ancestors.length + 1);
    
            if (newColumn) {
                return [...newState, newColumn];
            }
    
            return newState;
        });
    }, []);




    const updateBreadcrumbs = useCallback((clickedItem:TiledSearchItem<TiledStructures>) => {
        //function assumes users may only click on items that exist in the current search 'stack' and cannot jump to a different branch
        setBreadcrumbs((prevState) => {
            var stateCopy = [...prevState]; //must use shallow to copy to hold function references
            const ancestors:string[] = clickedItem.attributes.ancestors;
            while (stateCopy.length  > ancestors.length) {
                stateCopy.pop();
            }
            var newBreadcrumb:Breadcrumb = {
                label: clickedItem.id,
                icon: getTiledStructureIcon(clickedItem.attributes.structure_family),
                onClick: ()=>handleColumnItemClick(clickedItem)
            }
            stateCopy.push(newBreadcrumb);
            return stateCopy;
        })
    }, []);


    const closePreview = () => {
        //remove the preview component from 
        setImageUrl(undefined);
        setPopoutUrl(undefined);
        setPreviewSize('hidden');
    }

    const updateAncestorRefs = (item:TiledSearchItem<TiledStructures>) => {
        //this function is only called when the user navigates by directly clicking an item, not using the nav arrows
        currentAncestorId.current = item.attributes.ancestors.length;
        ancestorStack.current = ancestorStack.current.slice(0, currentAncestorId.current);
        ancestorStack.current = [...ancestorStack.current, item];
    }
    const handleColumnItemClick = useCallback((item:TiledSearchItem<TiledStructures>) => {
        updateAncestorRefs(item);
        updateCurrentSelectedItem(item);
    }, []);

    const updateCurrentSelectedItem = (item:TiledSearchItem<TiledStructures>) => {
        if (isArrayStructure(item)) {
            handleArrayClick(item); 
          } else if (isTableStructure(item)) {
            handleTableClick(item); 
          } else if (isContainerStructure(item)) {
            handleContainerClick(item); 
          } else {
            console.error('Error: No matching structure family found for: ' + item.attributes.structure_family);
          }
    }


    const handleArrayClick = useCallback((item:TiledSearchItem<ArrayStructure>) => {
        setPreviewItem(item);
        updateBreadcrumbs(item);
        setPreviewSize(defaultPreviewSize);
        updateColumns(item);
    }, []);

    const handleTableClick = useCallback((item:TiledSearchItem<TableStructure>) => {
        setPreviewItem(item);
        updateBreadcrumbs(item);
        setPreviewSize(defaultPreviewSize);
        updateColumns(item);
    }, []);

    const handleContainerClick = (item:TiledSearchItem<ContainerStructure>) => {
        //search container, put results into column, disable preview
        setPreviewItem(null)
        const searchPath = generateSearchPath(item);
        getSearchResults(searchPath, url, (res:TiledSearchResult) => handleSearchResponse(item, res));
        closePreview();
    };

    const handleSearchResponse = useCallback((clickedItem:TiledSearchItem<TiledStructures>, res:TiledSearchResult) => {
        updateColumns(clickedItem, res);
        updateBreadcrumbs(clickedItem);
    }, []);

    const resetAllData = () => {
        setBreadcrumbs([]);
        ancestorStack.current = [];
        currentAncestorId.current = -1;
        setPreviewItem(null);
        setPreviewSize('hidden');
        getSearchResults(searchPath, url, (res:TiledSearchResult) => setColumns([res]));
    }

    const initializeData = async () => {
        //attempt to get data from base Tiled Url. Display error on UI if no data comes back
        let response = null;
        if (apiKey) {
            response = await getFirstSearchWithApiKey(apiKey, searchPath, url); //only need to use apiKey once to set cookie for future requests
        } else {
            response = await getSearchResults(searchPath, url);
        }
        if (response!== null && typeof response !== 'string' && 'data' in response) {
            setColumns([response]);
        } else {
            setWarning('No data found at the provided Tiled URL. Please check the URL or API key.');
        }
    }

    useEffect(() => {
        //get first set of results from root
        try{
            initializeData();
        } catch (e) {
            console.error('error getting first tiled request: ', e);
            setWarning('Error initializing Tiled data. Please check the console for more details.');
        }
    }, []);

    return useMemo(() => ({
        columns,
        breadcrumbs,
        imageUrl,
        popoutUrl,
        previewSize,
        previewItem,
        handleColumnItemClick,
        handleLeftArrowClick,
        handleRightArrowClick,
        resetAllData,
        warning,
    }), [columns, breadcrumbs, imageUrl, popoutUrl, previewSize, handleColumnItemClick, warning])

}