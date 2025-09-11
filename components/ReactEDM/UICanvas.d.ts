import { default as React } from '../../../node_modules/react';
import { Devices } from '../../types/deviceControllerTypes';
import { Entry } from './types/UIEntry';
export type UICanvasProps = {
    devices: Devices;
    UIData: Entry[];
    onSubmit?: (pv: string, value: string | boolean | number) => void;
    style?: React.CSSProperties;
    [key: string]: any;
};
declare function UICanvas({ UIData, devices, onSubmit, style, ...args }: UICanvasProps): import("react/jsx-runtime").JSX.Element;
export default UICanvas;
//# sourceMappingURL=UICanvas.d.ts.map