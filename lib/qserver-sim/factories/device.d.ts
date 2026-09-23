import { Component, Device } from '../../../api/qServer/types/plansDevices';
/** Shorthand for the usual readable/movable/flyable combinations. */
export type DeviceKind = 'detector' | 'motor' | 'signal' | 'flyer';
export interface DeviceOptions {
    /** Kept for readability at the call site; the catalog key is set by the caller. */
    name: string;
    /** Preset flags and classname. Defaults to `'detector'`. */
    type?: DeviceKind;
    isReadable?: boolean;
    isMovable?: boolean;
    isFlyable?: boolean;
    classname?: string;
    module?: string;
    components?: Record<string, Component>;
}
/**
 * Build an allowed-device entry.
 *
 * ```ts
 * device({ name: 'I0', type: 'detector' })
 * device({ name: 'energy', type: 'motor' })
 * ```
 */
export declare function device(options: DeviceOptions): Device;
/** A leaf component, for building the nested `components` trees real devices report. */
export declare function component(options: Partial<Component> & {
    classname: string;
}): Component;
//# sourceMappingURL=device.d.ts.map