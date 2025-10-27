import React from "react";
import { useState } from "react";

export type doc = {
    title: string;
    url: string;
    description?: string;
}

type GoogleDocProps = {
    url?: string;
    docs?: doc[];
};

const googleDocIcon = "https://img.icons8.com/?size=100&id=30464&format=png&color=000000";

export default function GoogleDoc({ url, docs }: GoogleDocProps) {
    const [ selectedDocUrl, setSelectedDocUrl ] = useState<string>(url ? url : (docs && docs.length > 0 ? docs[0].url : ""));

    const handleDocChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDocUrl(event.target.value);
    };

    return docs && docs.length > 0 ? (
        <div className="w-full h-full flex flex-col">
            <div className="p-4 bg-gray-100 border-b border-gray-300 flex items-center gap-4">
                <img src={googleDocIcon} alt="Google Doc" className="w-8 h-8"/>
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
        <div className="w-full h-full flex justify-center items-center ">
            <iframe
                src={url}
                title="Google Doc Viewer"
                className="w-full h-[90vh] border border-gray-300 shadow-lg"
                allow="fullscreen"
            />
        </div>
    );
}