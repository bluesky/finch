import React from 'react';
import { cn } from '@/lib/utils';

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
      className={cn(alignmentClass, className)} 
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default Text;