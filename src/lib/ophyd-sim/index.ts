// Core
export { createOphydSim } from './core/createOphydSim';
export type {
    OphydSim,
    CreateOphydSimOptions,
    DeviceFactory,
    SimRegistration,
    SimValue,
    SimValueContext,
    SimValueFn,
    SimEvent,
    SimListener,
    PVMetadata,
    TickHandler,
    Unsubscribe,
} from './core/types';

// Devices
export { signal } from './devices/signal';
export type { SignalOptions } from './devices/signal';
export { motor } from './devices/motor';
export type { MotorOptions } from './devices/motor';
export { detector, mapLinearClamped, OPACITY_SUFFIX, MODE_SUFFIX } from './devices/detector';
export type {
    DetectorConfig,
    DetectorImageConfig,
    DetectorModulation,
    ModulationPoint,
} from './devices/detector';

// Generators
export { gaussian, gaussian2d, randomNoise, randomWalk, braggAngle } from './generators';
export type {
    GaussianOptions,
    Gaussian2dOptions,
    RandomNoiseOptions,
    RandomWalkOptions,
    BraggAngleOptions,
} from './generators';

// Transport
export { createOphydSimTransport } from './transport/createOphydSimTransport';

// Camera
export { SimCameraSocket, createSimCameraSocketFactory } from './camera/SimCameraSocket';
export type { SimCameraSocketOptions, CameraFramePayload } from './camera/SimCameraSocket';
export {
    createSimDetectorCameraSocketFactory,
    renderDetectorFrame,
} from './camera/createSimDetectorCameraSocketFactory';
export type { SimDetectorCameraOptions } from './camera/createSimDetectorCameraSocketFactory';
export type {
    CameraSocketLike,
    CameraSocketFactory,
    CameraSocketMessageEvent,
} from './camera/types';

// React
export {
    OphydSimProvider,
    useOphydSim,
    useOphydSimOptional,
    useSimSignal,
    useSimSet,
} from './react';
export type { OphydSimProviderProps } from './react';

// Storybook
export { withOphydSim } from './storybook/decorator';

// Scenarios
export { defaultBeamline } from './scenarios/defaultBeamline';
export { beamstopBeamline, simDetectorConfig } from './scenarios/beamstopBeamline';
export {
    beamstopCurrentModel,
    beamYAtEnergy,
    ENERGY_PV,
    ENERGY_MIN_EV,
    ENERGY_MAX_EV,
    ENERGY_REF_EV,
    CENTER_X,
    CENTER_Y,
    SIGMA_X,
    SIGMA_Y,
    PEAK_CURRENT,
    BEAM_SHIFT_AMPLITUDE_MM,
} from './scenarios/beamstopModel';
export type { BeamstopCurrentModelOptions } from './scenarios/beamstopModel';
