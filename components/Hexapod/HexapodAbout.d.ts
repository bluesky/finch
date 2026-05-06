import { Device, OphydDevice } from '../../types/deviceControllerTypes';
export type HexapodAboutProps = {
    /** The device object whose raw fields are pretty-printed as JSON. */
    device: Device | OphydDevice;
    /** Additional CSS class names to apply to the pre element. */
    className?: string;
};
export default function HexapodAbout({ device, className }: HexapodAboutProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=HexapodAbout.d.ts.map