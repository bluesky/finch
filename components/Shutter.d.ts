type ShutterProps = {
    /** EPICS process variable name for the shutter device. Defaults to 'bl531:LJT4:1:AO0'. */
    pv?: string;
    /** The numeric PV value that indicates the shutter is open. Defaults to 0. */
    valueWhenOpen?: number;
    /** The numeric PV value that indicates the shutter is closed. Defaults to 5. */
    valueWhenClosed?: number;
    /** Additional CSS classes applied to the root container div. */
    className?: string;
    /** Additional CSS classes applied to the dropdown control panel. */
    classNameDropdown?: string;
    /** Additional CSS classes applied to the status circle when the shutter is open. */
    classNameStatusCircleOpen?: string;
    /** Additional CSS classes applied to the status circle when the shutter is closed. */
    classNameStatusCircleClosed?: string;
    /** Additional CSS classes applied to the status circle when the device is disconnected or in an unknown state. */
    classNameStatusCircleDisconnected?: string;
};
export default function Shutter({ pv, valueWhenOpen, valueWhenClosed, className, classNameDropdown, classNameStatusCircleOpen, classNameStatusCircleClosed, classNameStatusCircleDisconnected, ...props }: ShutterProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Shutter.d.ts.map