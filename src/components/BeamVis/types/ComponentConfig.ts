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
  parentId?: string;    // if this object is attached to another
  visible?: boolean;
  transform: Transform;
  synopticId?: string;
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
  // Additional stage properties, e.g. tiltRange, rotationLimits, etc.
}

/** Beam config */
export interface BeamConfig extends BaseConfig {
  type: 'beam';
  geometry?: {
    radius?: number;
    height?: number;
  };
  beamModes?: Array<'cylinder' | 'photonStream'>;
  beamPower?: number; // in keV
  beamMono?: 'Xtal' | 'Multilayer' | 'WhiteLight';
  shutterOpen?: boolean; // if you keep that on beam or beamStop
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
  // Possibly specify motor type or range
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
export type ComponentConfig =
  | BeamConfig
  | StageConfig
  | DetectorConfig
  | BeamStopConfig
  | MotorConfig
  | SampleConfig;

/********************************************************
 * Beam Color Mapping
 * Maps beam monochromator types to a HEX color string.
 ********************************************************/
export const beamColorMap: Record<NonNullable<BeamConfig['beamMono']>, string> = {
  Xtal: '#BF83FC',       // Pink
  Multilayer: '#00FF7F',  // Green
  WhiteLight: '#ffffff',  // White
};
