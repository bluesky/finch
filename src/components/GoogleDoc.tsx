import React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type doc = {
    title: string;
    url: string;
    description?: string;
};

type GoogleDocProps = {
    /** URL of a single document to embed. Used when no docs list is provided, or as the initial selection when docs is also provided. */
    url?: string;
    /** List of documents to show in a dropdown selector. When provided, renders a select menu and defaults to the first item (or url if given). */
    docs?: doc[];
    /** Additional classnames */
    className?: string;
};

const googleDocIcon = 'https://img.icons8.com/?size=100&id=30464&format=png&color=000000';

export default function GoogleDoc({ url, docs, className, ...props }: GoogleDocProps) {
    const [selectedDocUrl, setSelectedDocUrl] = useState<string>(
        url ? url : docs && docs.length > 0 ? docs[0].url : '',
    );

    const handleDocChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDocUrl(event.target.value);
    };

    return docs && docs.length > 0 ? (
        <div className={cn('w-full h-full flex flex-col bg-white', className)} {...props}>
            <div className="p-4 bg-gray-100 border-b border-gray-300 flex items-center gap-4">
                <img src={googleDocIcon} alt="Google Doc" className="w-8 h-8" />
                <select
                    value={selectedDocUrl}
                    onChange={handleDocChange}
                    className="p-2 border border-gray-300 rounded"
                >
                    {docs.map((doc, index) => (
                        <option key={index} value={doc.url}>
                            {doc.title}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex-grow">
                <iframe
                    src={selectedDocUrl}
                    title="Google Doc Viewer"
                    className="w-full h-[calc(90vh-4rem)] border border-gray-300 shadow-lg"
                    allow="fullscreen"
                />
            </div>
        </div>
    ) : (
        <div
            className={cn('w-full h-full flex justify-center items-center bg-white', className)}
            {...props}
        >
            <iframe
                src={url}
                title="Google Doc Viewer"
                className="w-full h-full border border-gray-300 shadow-lg"
                allow="fullscreen"
            />
        </div>
    );
}
