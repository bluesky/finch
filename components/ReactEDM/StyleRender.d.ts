import { Entry } from './types/UIEntry';
import { Devices } from '../../types/deviceControllerTypes';
export type StyleRenderProps = {
    device: Entry;
    devices: Devices;
    args: {
        [key: string]: any;
    };
};
declare function StyleRender({ device, devices, args }: StyleRenderProps): import("react/jsx-runtime").JSX.Element | null;
export default StyleRender;
//# sourceMappingURL=StyleRender.d.ts.map