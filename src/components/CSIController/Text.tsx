import React from 'react';
import { cn } from '@/lib/utils';

export interface TextProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    dynamic: boolean
    [key: string]: any;
}

const Text: React.FC<TextProps> = ({ children, className, style, dynamic, ...props }) => {
    return (
        <div
            className={cn(className)}
            style={style}
            {...props}
        >
            {children}
        </div>
    );
};

export default Text;