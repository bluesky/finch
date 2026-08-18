import type { Component, Device } from '@/api/qServer/types/plansDevices';
import { component, device } from '../factories/device';

/**
 * Finch's default device catalog: `det`, `det1`, `det2`, `motor`, `motor1`, `motor2`.
 *
 * Classnames, modules and the nested `components` trees mirror real `devices/allowed` output
 * from `ophyd.sim` (captured in `src/components/QServer/utils/qServerMockData.ts`), because UI
 * that inspects device metadata should see the same structure it would from a live server.
 */

const signal = (classname = 'Signal', module = 'ophyd.signal'): Component =>
    component({ classname, module });

/** `SynGauss` detector components, as ophyd.sim reports them. */
const detectorComponents: Record<string, Component> = {
    val: component({ classname: 'SynSignal', module: 'ophyd.sim' }),
    Imax: signal(),
    center: signal(),
    sigma: signal(),
    noise: component({ classname: 'EnumSignal', module: 'ophyd.sim' }),
    noise_multiplier: signal(),
};

/** `SynAxis` motor components. */
const motorComponents: Record<string, Component> = {
    readback: component({ classname: '_ReadbackSignal', module: 'ophyd.sim' }),
    setpoint: component({ classname: '_SetpointSignal', module: 'ophyd.sim' }),
    velocity: signal(),
    acceleration: signal(),
    unused: signal(),
};

export const detDevice: Device = device({
    name: 'det',
    type: 'detector',
    classname: 'SynGauss',
    components: detectorComponents,
});

export const det1Device: Device = device({
    name: 'det1',
    type: 'detector',
    classname: 'SynGauss',
    components: detectorComponents,
});

export const det2Device: Device = device({
    name: 'det2',
    type: 'detector',
    classname: 'SynGauss',
    components: detectorComponents,
});

export const motorDevice: Device = device({
    name: 'motor',
    type: 'motor',
    classname: 'SynAxis',
    components: motorComponents,
});

export const motor1Device: Device = device({
    name: 'motor1',
    type: 'motor',
    classname: 'SynAxis',
    components: motorComponents,
});

export const motor2Device: Device = device({
    name: 'motor2',
    type: 'motor',
    classname: 'SynAxis',
    components: motorComponents,
});

/** The catalog `createQServerSim` uses when no `devices` option is supplied. */
export const defaultDevices: Record<string, Device> = {
    det: detDevice,
    det1: det1Device,
    det2: det2Device,
    motor: motorDevice,
    motor1: motor1Device,
    motor2: motor2Device,
};
