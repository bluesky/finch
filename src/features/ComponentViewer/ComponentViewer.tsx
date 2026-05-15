import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

import { TestItemCollection, ComponentViewerCollection } from './types';
import { initializeTestResults, writeTestResultsToLocalStorage } from './utils';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export type ComponentViewerProps = {
    testItems: TestItemCollection;
    className?: string;
    namespace?: string;
};
export default function ComponentViewer({ testItems, className, namespace }: ComponentViewerProps) {
    const initializedTestResults = useMemo(
        () => initializeTestResults(testItems, namespace),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [namespace],
    ); //we will get infinite re renders if we don't memoize the testItems which contain devices that rapidly update
    const [testResults, setTestResults] =
        useState<ComponentViewerCollection>(initializedTestResults);
    //const [ copyButtonText, setCopyButtonText ] = useState<string>('Copy Table');
    const [commandCopyStates, setCommandCopyStates] = useState<Record<string, string>>({});
    const [currentTestIndex, setCurrentTestIndex] = useState<number>(0);

    const testKeys = Object.keys(testItems);
    const currentTestKey = testKeys[currentTestIndex];
    const currentTest = currentTestKey ? testResults[currentTestKey] : null;

    const handleCommentChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
        id: string,
        comment: string,
    ) => {
        e.preventDefault();
        setTestResults((prevResults) => {
            const updatedResults = { ...prevResults };
            if (updatedResults[id]) {
                updatedResults[id] = { ...updatedResults[id], comment };
            }
            writeTestResultsToLocalStorage(updatedResults, namespace);
            return updatedResults;
        });
    };

    const handleStatusToggle = (
        e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>,
        id: string,
    ) => {
        e.preventDefault();
        setTestResults((prevResults) => {
            const updatedResults = { ...prevResults };
            if (updatedResults[id]) {
                updatedResults[id] = {
                    ...updatedResults[id],
                    isPassing: !updatedResults[id].isPassing,
                };
            }
            writeTestResultsToLocalStorage(updatedResults, namespace);
            return updatedResults;
        });
    };

    // const resetTestResults = () => {
    //     const blankTestResults: ComponentViewerCollection = {};
    //     Object.keys(testItems).forEach(key => {
    //         blankTestResults[key] = { ...testItems[key], isPassing: false, comment: '' };
    //     });
    //     setTestResults(blankTestResults);
    //     writeTestResultsToLocalStorage(blankTestResults);
    // };

    // const handleCopyTableToMarkdown = () => {
    //     const header = '| ID | Name | Status | Comment |\n| --- | --- | --- | --- |\n';
    //     const rows = Object.keys(testResults).map(key => {
    //         const result = testResults[key];
    //         const status = result.isPassing ? '✓' : '✗';
    //         return `| ${key} | ${result.name} | ${status} | ${result.comment || ''} |`;
    //     }).join('\n');
    //     const markdownTable = header + rows;
    //     navigator.clipboard.writeText(markdownTable)
    //         .then(() => {
    //             setCopyButtonText('Copied');
    //             setTimeout(() => {
    //                 setCopyButtonText('Copy Table');
    //             }, 1000);
    //         })
    //         .catch(err => alert('Failed to copy test results: ' + err));
    // }

    const handleCopyCommand = (key: string, command: string) => {
        navigator.clipboard
            .writeText(command)
            .then(() => {
                setCommandCopyStates((prev) => ({ ...prev, [key]: 'Copied' }));
                setTimeout(() => {
                    setCommandCopyStates((prev) => ({ ...prev, [key]: 'Copy' }));
                }, 1000);
            })
            .catch((err) => alert('Failed to copy command: ' + err));
    };

    const handleTestChange = (newIndex: number) => {
        // Reset API client global state before switching tests
        setCurrentTestIndex(newIndex);
        //clear the tiled_csrf cookie to prevent auth issues when switching between tests that require different authentication states
        document.cookie = 'tiled_csrf=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    };

    const nextTest = () => {
        if (currentTestIndex < testKeys.length - 1) {
            handleTestChange(currentTestIndex + 1);
        }
    };

    const prevTest = () => {
        if (currentTestIndex > 0) {
            handleTestChange(currentTestIndex - 1);
        }
    };

    return (
        <div className={cn('w-full lg:w-3/4 max-w-6xl m-auto', className)}>
            {/* <h1 className="text-2xl text-center mb-4 text-sky-700">Component Test Page</h1> */}
            {/* A summary table that shows the test results, including id, name, passing status, and optional comment */}
            <table className="max-w-full m-auto border-collapse border border-gray-200 text-sm bg-white">
                <thead>
                    <tr>
                        <th className="border border-gray-200 p-1 w-1/12">ID</th>
                        <th className="border border-gray-200 p-1 w-1/6">Name</th>
                        <th className="border border-gray-200 p-1 w-1/12">Status</th>
                        <th className="border border-gray-200 p-1 w-1/2">Comment</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(testResults).map((key, index) => {
                        const result = testResults[key];
                        const isSelected = index === currentTestIndex;
                        return (
                            <tr
                                key={key}
                                onClick={() => handleTestChange(index)}
                                className={`cursor-pointer hover:bg-blue-100 transition-colors ${
                                    isSelected ? 'bg-sky-200' : ''
                                }`}
                            >
                                <td className="border border-gray-200 p-1">{key}</td>
                                <td className="border border-gray-200 p-1">{result.name}</td>
                                <td className="border border-gray-200 p-1 text-center">
                                    {result.isPassing ? (
                                        <span className="text-green-500 ">✓</span>
                                    ) : (
                                        <span className="text-red-500 ">✗</span>
                                    )}
                                </td>
                                <td className="border border-gray-200 p-1">{result.comment}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Copy to Markdown button */}
            {/* <div className="mt-4">
                <button
                    onClick={handleCopyTableToMarkdown}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    {copyButtonText}
                </button>
            </div> */}

            {/* Current Test Display */}
            {currentTest && (
                <div className="mt-8 max-w-fit m-auto" key={currentTest.name}>
                    <h2 className="text-xl mb-2 font-light text-center">
                        {currentTestKey}: {currentTest.name}
                    </h2>
                    {/* Carousel Navigation */}
                    <div className="flex items-center space-x-4 justify-center w-full">
                        <button
                            onClick={prevTest}
                            disabled={currentTestIndex === 0}
                            className="px-3 py-2 text-gray-800 rounded hover:text-sky-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <CaretLeft className="inline mr-1" />
                        </button>
                        <span className="text-sm text-gray-600">
                            {currentTestIndex + 1} of {testKeys.length}
                        </span>
                        <button
                            onClick={nextTest}
                            disabled={currentTestIndex === testKeys.length - 1}
                            className="px-3 py-2 text-gray-800 rounded hover:text-sky-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <CaretRight className="inline ml-1" />
                        </button>
                    </div>

                    {/* Component */}
                    <div className="w-full flex items-center justify-center">
                        {testItems[currentTestKey]?.element}
                    </div>

                    {/* Test Pass/Fail slider */}
                    <div className="flex items-center justify-between py-4 mt-8">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm">Failing</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={currentTest.isPassing}
                                        onChange={(e) => handleStatusToggle(e, currentTestKey)}
                                    />
                                    <div
                                        className={`w-11 h-6 rounded-full transition-colors ${currentTest.isPassing ? 'bg-green-500' : 'bg-red-500'}`}
                                    >
                                        <div
                                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${currentTest.isPassing ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}
                                        ></div>
                                    </div>
                                </label>
                                <span className="text-sm">Passing</span>
                            </div>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div className="mb-6">
                        <textarea
                            className="w-full h-24 resize-none border border-gray-300 rounded p-3 align-top"
                            value={currentTest.comment || ''}
                            onChange={(e) => handleCommentChange(e, currentTestKey, e.target.value)}
                            placeholder="Enter your test comments here..."
                        />
                    </div>

                    {/*Optional Startup Command */}
                    {currentTest.command && (
                        <div className="mb-4">
                            <div className="flex items-center space-x-2">
                                <code className="flex-1 bg-gray-100 border border-gray-300 rounded p-3 text-sm font-mono overflow-x-auto max-w-fit">
                                    {currentTest.command}
                                </code>
                                <button
                                    onClick={() =>
                                        handleCopyCommand(currentTestKey, currentTest.command!)
                                    }
                                    className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors whitespace-nowrap"
                                >
                                    {commandCopyStates[currentTestKey] || 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Display info if available */}
                    {currentTest.info && (
                        <div className="mb-4 max-w-5xl">
                            <p className="text-gray-600 text-sm text-wrap w-fit">
                                Info: {currentTest.info}
                                {currentTest.link && (
                                    <>
                                        {' '}
                                        <a
                                            className="text-blue-500 underline"
                                            href={currentTest.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            here
                                        </a>
                                    </>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Issues */}
                    <p className="text-sm text-gray-500">
                        Having issues? If the component id starts with 'real' then you will need a
                        backend running and configured... Otherwise it could be an issue with the
                        component itself!
                    </p>
                </div>
            )}
        </div>
    );
}
