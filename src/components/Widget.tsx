import { useState } from 'react';
import React from 'react';

export type WidgetProps = {
    /** Content to be displayed below the header */
    children?: React.ReactNode;
    /** The title of the widget */
    title?: string;
    /** An icon that can be any valid jsx (SVG, PNG, etc) */
    icon?: JSX.Element;
    /** Tailwind ClassName only applied when expand icon is not active*/
    defaultHeight?: string;
    /** Tailwind ClassName */
    minHeight?: string;
    /** Tailwind ClassName */
    maxHeight?: string;
    /** Tailwind ClassName */
    minWidth?: string;
    /** Tailwind ClassName */
    width?: string;
    /** Tailwind ClassName */
    maxWidth?: string;
    /** Tailwind ClassName applied only when user clicks expand icon */
    expandedWidth?: string;
    /** Additional Tailwind ClassName styles applied only to the content */
    contentStyles?: string;
};

export default function Widget({
    children,
    title = '',
    icon,
    defaultHeight = 'h-64',
    minHeight = 'min-h-64',
    maxHeight = 'max-h-3/4',
    minWidth = 'min-w-64',
    width = 'w-1/4',
    maxWidth = 'max-w-full',
    expandedWidth = 'w-full',
    contentStyles = '',
    ...props
}: WidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const arrowsPointingIn = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
            />
        </svg>
    );

    const arrowsPointingOut = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
        </svg>
    );

    return (
        <div
            className={`p-2 rounded-md ${defaultHeight} ${minHeight} ${maxHeight} ${minWidth} ${isExpanded ? expandedWidth : `${width} ${maxWidth}`}`}
            {...props}
        >
            <div className="w-full h-full shadow-sm bg-white rounded-md">
                {/* Title */}
                <header className="bg-sky-950 h-10 flex items-center rounded-t-md justify-between">
                    <div className="flex justify-center items-center truncate">
                        {icon ? (
                            <div className="h-6 ml-2 aspect-square text-white">{icon}</div>
                        ) : (
                            ''
                        )}
                        <h3 className="text-white text-lg font-semibold pl-4 truncate">{title}</h3>
                    </div>
                    <div
                        className="text-white pr-2 hover:cursor-pointer hover:text-slate-300"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? arrowsPointingIn : arrowsPointingOut}
                    </div>
                </header>

                {/* Main Body */}
                <div
                    className={`h-[calc(100%-2.5rem)] rounded-b-md flex w-full overflow-auto p-2 ${contentStyles}`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
