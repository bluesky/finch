import { ComponentViewerCollection, TestItemCollection } from './types';

const getStorageKey = (namespace?: string) =>
    namespace ? `componentViewerResults_${namespace}` : 'componentViewerResults';

export const writeTestResultsToLocalStorage = (
    testResults: ComponentViewerCollection,
    namespace?: string,
) => {
    localStorage.setItem(getStorageKey(namespace), createTestResultsJSON(testResults));
};

const doesLocalStorageDataMatchTestItems = (
    testItems: TestItemCollection,
    storedResults: ComponentViewerCollection,
) => {
    const testItemKeys = Object.keys(testItems);
    const storedResultKeys = Object.keys(storedResults);

    if (!storedResults || storedResultKeys.length !== testItemKeys.length) {
        return false;
    } else {
        return storedResultKeys.every(
            (key: string) =>
                testItemKeys.includes(key) && testItems[key].name === storedResults[key].name,
        );
    }
};

export const initializeTestResults = (
    testItems: TestItemCollection,
    namespace?: string,
): ComponentViewerCollection => {
    //first check if we have existing results in local storage, if so then check if the ids and names match the testItems, if they do then return those results
    const storedResults = localStorage.getItem(getStorageKey(namespace));
    if (storedResults) {
        const parsedResults = JSON.parse(storedResults);
        if (doesLocalStorageDataMatchTestItems(testItems, parsedResults)) {
            console.log('Local storage data matches test items, loading stored results');
            // Merge testItems (which have React elements) with stored results (which have isPassing and comment)
            const enrichedResults: ComponentViewerCollection = Object.keys(testItems).reduce(
                (acc, key) => {
                    const item = testItems[key];
                    const storedResult = parsedResults[key];
                    acc[key] = {
                        ...item, // includes all original properties including the React element
                        isPassing: storedResult?.isPassing || false,
                        comment: storedResult?.comment || '',
                    };
                    return acc;
                },
                {} as ComponentViewerCollection,
            );
            return enrichedResults;
        }
    }

    //if there is no local storage data or if the ids and names don't match then initialize new results with all tests failing and empty comments
    console.log({ testItems });
    const initialResults: ComponentViewerCollection = {};
    Object.keys(testItems).forEach((key) => {
        initialResults[key] = { ...testItems[key], isPassing: false, comment: '' };
    });
    localStorage.setItem(getStorageKey(namespace), createTestResultsJSON(initialResults));
    return initialResults;
};

const createTestResultsJSON = (testResults: ComponentViewerCollection) => {
    //can't convert a react element to JSON so we strip it out here
    const sanitizedResults: Record<string, { name: string; isPassing: boolean; comment?: string }> =
        {};
    Object.keys(testResults).forEach((key) => {
        const { name, isPassing, comment } = testResults[key];
        sanitizedResults[key] = {
            name,
            isPassing,
            comment,
        };
    });
    return JSON.stringify(sanitizedResults);
};
