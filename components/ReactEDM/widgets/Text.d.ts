import { default as React } from '../../../../node_modules/react';
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
declare const Text: React.FC<TextProps>;
export default Text;
//# sourceMappingURL=Text.d.ts.map