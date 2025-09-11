import { CSSProperties } from '../../../../node_modules/react';
import { Entry } from '../types/UIEntry';
type RelatedDispProps = {
    label?: string;
    style?: CSSProperties;
    fileArray: Entry["display"];
    [key: string]: any;
};
declare function RelatedDisp({ fileArray, label, style, ...args }: RelatedDispProps): import("react/jsx-runtime").JSX.Element;
export default RelatedDisp;
//# sourceMappingURL=RelatedDisp.d.ts.map