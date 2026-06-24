import React from 'react';
import { cn } from '@/lib/utils';

type SidebarItemProps = {
    /** content to be rendered underneath the title */
    children?: React.ReactNode;
    /** title text above children */
    title?: string;
    /** any valid JSX, but SVG works best for color attribute */
    icon?: JSX.Element;
    /** Tailwind ClassNames */
    className?: string;
    /** Tailwind ClassNames */
    classNameIcon?: string;
    /** Tailwind ClassNames */
    classNameTitle?: string;
    /** Tailwind ClassNames */
    classNameChildren?: string;
};
export default function SidebarItem({
    children,
    title,
    icon,
    className,
    classNameIcon,
    classNameTitle,
    classNameChildren,
    ...props
}: SidebarItemProps) {
    return (
        <div className={className} {...props}>
            <h2
                className={cn(
                    `text-sky-900 font-medium text-xl flex justify-start items-end`,
                    classNameTitle,
                )}
            >
                {icon && (
                    <div className={cn(`text-sky-900 h-8 aspect-square mr-2`, classNameIcon)}>
                        {icon}
                    </div>
                )}
                {title}
            </h2>
            <div className={cn(`text-slate-900 px-2`, classNameChildren)}>{children}</div>
        </div>
    );
}
