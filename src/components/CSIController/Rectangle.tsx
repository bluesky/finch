import React from 'react'
import { cn } from '@/lib/utils';
import styles from "./styles.json";
import { useVariant } from "./VariantContext";

export interface RectangleProps {
  className?: string;
  [key: string]: any;
}

const Rectangle: React.FC<RectangleProps> = ({ 
  className,
  ...props 
}) => {
    const { variant } = useVariant();
    return (
        <div
            {...props}
            className={cn("border-2 border-gray-300", styles.variants[variant as keyof typeof styles.variants].rectangle)}
        />
    )
}

export default Rectangle