import { cn } from '@/lib/utils';
import React from 'react';
import { useState } from 'react';
const openHamburgerIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
    </svg>
);

const closedHamburgerIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25"
        />
    </svg>
);

type SidebarProps = {
    /** Children rendered inside sidebar */
    children?: React.ReactNode;
    /** Should this take up full height of the parent? If not then it will take up the VH minus some rems for a header */
    isFullHeight?: boolean;
    /** How wide is the sidebar */
    size?: 'small' | 'medium' | 'large';
    /** Should the shadow on the right be disabled? */
    disableShadow?: boolean;
    /** Display a hamburger icon that allows the sidebar to collapse? */
    collapsible?: boolean;
    /** App Title */
    title?: string;
    /** Additional ClassNames applied to the heading element */
    classNameHeading?: string;
    /** Additional ClassNames applied to the root element */
    className?: string;
    /** Additional ClassNames applied to the title element */
    classNameTitle?: string;
};
export default function Sidebar({
    children,
    isFullHeight = false,
    size = 'medium',
    disableShadow = false,
    collapsible = false,
    title,
    className,
    classNameHeading = 'bg-slate-200/10',
    classNameTitle,
    ...props
}: SidebarProps) {
    const widthSizes = {
        collapsed: 'w-10',
        small: 'w-48',
        medium: 'w-64',
        large: 'w-96',
    };

    const [isCollapsed, setIsCollapsed] = useState(false);
    const handleIconClick = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside
            className={cn(
                `
                ${isCollapsed ? widthSizes.collapsed : widthSizes[size]}
                ${disableShadow ? '' : 'shadow-right'}
                ${isFullHeight ? 'h-full' : 'h-[calc(100vh-4rem)]'} 
                z-10 transition-all duration-300 overflow-auto flex-col items-center justify-center bg-slate-200
                `,
                className,
            )}
            {...props}
        >
            <div
                className={cn(
                    `bg-slate-200/10 backdrop-blur-sm flex justify-start items-center sticky top-0`,
                    classNameHeading,
                )}
            >
                {collapsible && (
                    <div
                        className="w-6 aspect-square hover:cursor-pointer hover:text-sky-800 mx-2 my-2"
                        onClick={handleIconClick}
                    >
                        {isCollapsed ? openHamburgerIcon : closedHamburgerIcon}
                    </div>
                )}
                {title && !isCollapsed && (
                    <h1
                        className={cn(
                            'text-sky-900 text-2xl flex-grow text-center',
                            classNameTitle,
                        )}
                    >
                        {title}
                    </h1>
                )}
                {collapsible && !isCollapsed && <div className="w-10 aspect-square"></div>}
            </div>
            <div className="px-2 py-4 flex-col space-y-4 overflow-auto">
                {isCollapsed ? '' : children}
            </div>
        </aside>
    );
}
