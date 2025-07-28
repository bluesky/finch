import React from 'react';
import { cn } from '@/lib/utils';
import styles from "./styles.json";
import { useVariant } from "./VariantContext";

export interface TextProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    dynamic?: boolean;
    vis?: string;
    val?: string | number | boolean;
    align?: string;
    [key: string]: any;
}

const Text: React.FC<TextProps> = ({
    children,
    className,
    style,
    dynamic,
    vis,
    val,
    align,
    ...props
}) => {
    const { variant } = useVariant();
    // Handle visibility logic for dynamic text
    if (dynamic) {
        const visibilityConditions: Record<string, boolean> = {
            "if zero": val === 0,
            "if not zero": val !== 0,
        };

        if (vis && !visibilityConditions[vis]) {
            return null;
        }
    }

    // Handle alignment logic
    const alignmentClasses = {
        "horiz. right": "text-right",
        "horiz. centered": "text-center",
        "horiz. left": "text-left"
    } as const;

    const alignmentClass = align ? alignmentClasses[align as keyof typeof alignmentClasses] : null;

    return (
        <div
            className={cn(alignmentClass, styles.variants[variant as keyof typeof styles.variants].text)}
            style={style}
            {...props}
        >
            {children}
        </div>
    );
};

export default Text;