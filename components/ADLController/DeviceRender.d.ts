import { Device } from '../../types/deviceControllerTypes';
import { Entry } from './types/ADLEntry';
export type DeviceRenderProps = {
    PV: Device;
    ADLEntry: Entry;
    [key: string]: any;
    onSubmit: (pv: string, value: string | boolean | number) => void;
};
declare function DeviceRender({ PV, ADLEntry, onSubmit, ...args }: DeviceRenderProps): import("react/jsx-runtime").JSX.Element | undefined;
export default DeviceRender;
//# sourceMappingURL=DeviceRender.d.ts.map