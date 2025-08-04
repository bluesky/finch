import { default as React } from '../../../node_modules/react';
import { Devices } from '../../types/deviceControllerTypes';
import { Entry } from './types/ADLEntry';
export type ADLCanvasProps = {
    devices: Devices;
    ADLData: Entry[];
    onSubmit?: (pv: string, value: string | boolean | number) => void;
    style?: React.CSSProperties;
    [key: string]: any;
};
declare function ADLCanvas({ ADLData, devices, onSubmit, style, ...args }: ADLCanvasProps): import("react/jsx-runtime").JSX.Element;
export default ADLCanvas;
//# sourceMappingURL=ADLCanvas.d.ts.map