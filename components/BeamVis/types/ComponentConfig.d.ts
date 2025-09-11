/********************************************************
 * Shared Type Definitions
 ********************************************************/
export interface Transform {
    position: [number, number, number];
    rotation: [number, number, number];
    scale?: [number, number, number];
}
/** Top-level definition for ANY component in the scene */
export interface BaseConfig {
    id: string;
    type: 'beam' | 'stage' | 'detector' | 'beamStop' | 'motor' | 'sample' | 'robotArm';
    parentId?: string;
    visible?: boolean;
    transform: Transform;
    synopticId?: string;
    inversions?: {
        x?: -1 | 1;
        y?: -1 | 1;
        z?: -1 | 1;
    };
}
/** Stage sub-types (e.g., tilt, cylindrical, stacked translations) */
export type StageType = 'xyz' | 'cylindrical' | 'tilt' | 'rotation';
/** Extended config for a stage-type component */
export interface StageConfig extends BaseConfig {
    type: 'stage';
    stageType: StageType;
    geometry?: {
        width?: number;
        depth?: number;
        height?: number;
        radius?: number;
    };
}
/** Beam config */
export interface BeamConfig extends BaseConfig {
    type: 'beam';
    geometry?: {
        radius?: number;
        height?: number;
    };
    beamModes?: Array<'cylinder' | 'photonStream'>;
    beamPower?: number;
    beamMono?: 'Xtal' | 'Multilayer' | 'WhiteLight';
    shutterOpen?: boolean;
}
/** Detector config */
export interface DetectorConfig extends BaseConfig {
    type: 'detector';
    geometry?: {
        width?: number;
        height?: number;
        depth?: number;
    };
}
/** BeamStop config */
export interface BeamStopConfig extends BaseConfig {
    type: 'beamStop';
    geometry?: {
        width?: number;
        height?: number;
        depth?: number;
    };
    shutterOpen?: boolean;
}
/** Motor config */
export interface MotorConfig extends BaseConfig {
    type: 'motor';
}
/** Sample config */
export interface SampleConfig extends BaseConfig {
    type: 'sample';
    meshType?: 'cube' | 'cylinder' | 'fbx' | 'obj';
    meshUrl?: string;
    geometry?: {
        radius?: number;
        height?: number;
        width?: number;
        depth?: number;
    };
}
/** For future expansions: robot arm config, etc. */
/** The union type of all possible configs */
export type ComponentConfig = BeamConfig | StageConfig | DetectorConfig | BeamStopConfig | MotorConfig | SampleConfig;
/********************************************************
 * Beam Color Mapping
 * Maps beam monochromator types to a HEX color string.
 ********************************************************/
export declare const beamColorMap: Record<NonNullable<BeamConfig['beamMono']>, string>;
//# sourceMappingURL=ComponentConfig.d.ts.map