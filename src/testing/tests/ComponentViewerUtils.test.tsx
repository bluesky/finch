import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    initializeTestResults,
    writeTestResultsToLocalStorage,
} from '../../features/ComponentViewer/utils';
import { TestItemCollection } from '../../features/ComponentViewer/types';

const makeTestItems = (): TestItemCollection => ({
    test1: { name: 'Test One', element: <div>one</div> },
    test2: { name: 'Test Two', element: <div>two</div> },
});

describe('ComponentViewer utils', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    describe('initializeTestResults', () => {
        it('initializes all tests as failing with empty comments when no stored data', () => {
            const testItems = makeTestItems();
            const results = initializeTestResults(testItems);

            expect(results.test1.isPassing).toBe(false);
            expect(results.test1.comment).toBe('');
            expect(results.test2.isPassing).toBe(false);
            expect(results.test2.comment).toBe('');
        });

        it('preserves React elements in the returned collection', () => {
            const testItems = makeTestItems();
            const results = initializeTestResults(testItems);

            expect(results.test1.element).toBeDefined();
            expect(results.test2.element).toBeDefined();
        });

        it('writes initial results to localStorage', () => {
            const testItems = makeTestItems();
            initializeTestResults(testItems);

            const stored = localStorage.getItem('componentViewerResults');
            expect(stored).not.toBeNull();
            const parsed = JSON.parse(stored!);
            expect(parsed.test1.name).toBe('Test One');
            expect(parsed.test1.isPassing).toBe(false);
        });

        it('uses namespace key when namespace is provided', () => {
            const testItems = makeTestItems();
            initializeTestResults(testItems, 'myNS');

            expect(localStorage.getItem('componentViewerResults_myNS')).not.toBeNull();
            expect(localStorage.getItem('componentViewerResults')).toBeNull();
        });

        it('loads stored results when they match test items', () => {
            const testItems = makeTestItems();
            // First init to write to storage
            initializeTestResults(testItems);
            // Manually mark test1 as passing
            const stored = JSON.parse(localStorage.getItem('componentViewerResults')!);
            stored.test1.isPassing = true;
            stored.test1.comment = 'looks good';
            localStorage.setItem('componentViewerResults', JSON.stringify(stored));

            const results = initializeTestResults(testItems);
            expect(results.test1.isPassing).toBe(true);
            expect(results.test1.comment).toBe('looks good');
        });

        it('resets when stored keys do not match current test items', () => {
            // Store data for different items
            localStorage.setItem(
                'componentViewerResults',
                JSON.stringify({
                    oldKey: { name: 'Old', isPassing: true, comment: 'stale' },
                }),
            );
            const testItems = makeTestItems();
            const results = initializeTestResults(testItems);

            expect(results.test1.isPassing).toBe(false);
            expect(results.test2.isPassing).toBe(false);
        });

        it('resets when stored names do not match current test item names', () => {
            // Store data with same keys but different names
            localStorage.setItem(
                'componentViewerResults',
                JSON.stringify({
                    test1: { name: 'Wrong Name', isPassing: true, comment: '' },
                    test2: { name: 'Test Two', isPassing: false, comment: '' },
                }),
            );
            const testItems = makeTestItems();
            const results = initializeTestResults(testItems);

            expect(results.test1.isPassing).toBe(false);
        });
    });

    describe('writeTestResultsToLocalStorage', () => {
        it('serializes results to localStorage without React elements', () => {
            const testItems = makeTestItems();
            const collection = {
                test1: { ...testItems.test1, isPassing: true, comment: 'nice' },
                test2: { ...testItems.test2, isPassing: false, comment: '' },
            };

            writeTestResultsToLocalStorage(collection);

            const stored = JSON.parse(localStorage.getItem('componentViewerResults')!);
            expect(stored.test1.name).toBe('Test One');
            expect(stored.test1.isPassing).toBe(true);
            expect(stored.test1.comment).toBe('nice');
            expect(stored.test1.element).toBeUndefined();
        });

        it('uses namespace key when provided', () => {
            const testItems = makeTestItems();
            const collection = {
                test1: { ...testItems.test1, isPassing: false, comment: '' },
            };

            writeTestResultsToLocalStorage(collection, 'ns2');

            expect(localStorage.getItem('componentViewerResults_ns2')).not.toBeNull();
        });
    });
});
