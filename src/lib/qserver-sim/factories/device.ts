import type { Component, Device } from '@/api/qServer/types/plansDevices';

/** Shorthand for the usual readable/movable/flyable combinations. */
export type DeviceKind = 'detector' | 'motor' | 'signal' | 'flyer';

const KIND_FLAGS: Record<
    DeviceKind,
    { is_readable: boolean; is_movable: boolean; is_flyable: boolean; classname: string }
> = {
    detector: { is_readable: true, is_movable: false, is_flyable: false, classname: 'SynGauss' },
    motor: { is_readable: true, is_movable: true, is_flyable: false, classname: 'SynAxis' },
    signal: { is_readable: true, is_movable: true, is_flyable: false, classname: 'Signal' },
    flyer: { is_readable: true, is_movable: false, is_flyable: true, classname: 'SynFlyer' },
};

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
export function device(options: DeviceOptions): Device {
    const preset = KIND_FLAGS[options.type ?? 'detector'];
    return {
        is_readable: options.isReadable ?? preset.is_readable,
        is_movable: options.isMovable ?? preset.is_movable,
        is_flyable: options.isFlyable ?? preset.is_flyable,
        classname: options.classname ?? preset.classname,
        module: options.module ?? 'ophyd.sim',
        ...(options.components !== undefined ? { components: options.components } : {}),
    };
}

/** A leaf component, for building the nested `components` trees real devices report. */
export function component(options: Partial<Component> & { classname: string }): Component {
    return {
        is_readable: options.is_readable ?? true,
        is_movable: options.is_movable ?? true,
        is_flyable: options.is_flyable ?? false,
        classname: options.classname,
        module: options.module ?? 'ophyd.signal',
        ...(options.components !== undefined ? { components: options.components } : {}),
    };
}
