import { Entry } from './types/ADLEntry';
export type DeviceRenderProps = {
    ADLEntry: Entry;
    val?: string | number | boolean;
    vis?: string;
    dynamic?: boolean;
    [key: string]: any;
};
declare function StyleRender({ ADLEntry, val, vis, dynamic, ...args }: DeviceRenderProps): import("react/jsx-runtime").JSX.Element | null;
export default StyleRender;
//# sourceMappingURL=StyleRender.d.ts.map