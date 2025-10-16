import React from "react";

type GoogleDocProps = {
    url: string;
};

export default function GoogleDoc({ url }: GoogleDocProps) {
    return (
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