/**
 * @file beamline_configs.ts
 * @description Aggregates all beamline configuration definitions.
 */

import { ComponentConfig } from './types/ComponentConfig';

/**
 * Interface for a beamline configuration.
 */
export interface BeamlineDefinition {
  /** The 3D scene configuration (array of component definitions) */
  sceneConfig: ComponentConfig[];
  /** Layout information for the control panel */
  controlLayout: {
    common?: { camera?: boolean; beam?: boolean; shutter?: boolean };
    stages?: any[];
    sample?: any;
    // Additional layout properties can be added here.
  };
  /** The display name for the beamline */
  name: string;
}

/**
 * Beamline configuration for beamline 7.3.3.
 */
export const bl733Definition: BeamlineDefinition = {
  sceneConfig: [
    {
      id: 'beam',
      type: 'beam',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      geometry: { radius: 0.05, height: 8 },
      beamModes: ['cylinder'],
      visible: true,
      beamPower: 25,
      beamMono: 'Xtal',
    },
    {
      id: 'floor',
      type: 'motor',
      transform: { position: [0, -0.3, 0], rotation: [0, 0, 0] },
      visible: true,
    },
    {
      id: 'horizontalStage',
      type: 'stage',
      stageType: 'xyz',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      geometry: { width: 1, depth: 1, height: 0.2 },
      parentId: 'floor',
      visible: true,
    },
    {
      id: 'sample',
      type: 'sample',
      transform: { position: [0, 0.2, 0], rotation: [0, 0, 0] },
      geometry: { radius: 0.2, height: 0.4 },
      parentId: 'horizontalStage',
      visible: true,
      meshType: 'cube',
    },
    {
      id: 'detector',
      type: 'detector',
      transform: { position: [4, 0, 0], rotation: [0, Math.PI / 2, 0] },
      geometry: { width: 1, height: 1, depth: 0.2 },
      visible: true,
    },
    {
      id: 'beamStop',
      type: 'beamStop',
      parentId: 'beam',
      transform: { position: [-2, 0, 0], rotation: [0, 0, 0] },
      visible: true,
      shutterOpen: false,
    },
  ],
  controlLayout: {
    common: { camera: true, beam: true, shutter: true },
    stages: [{ id: 'horizontalStage1', type: 'xyz' }],
    sample: { showMeshOptions: true },
  },
  name: '7.3.3 RADIUS',
};

/**
 * Beamline configuration for beamline 8.3.2.
 */
export const bl832Definition: BeamlineDefinition = {
  sceneConfig: [
    {
      id: 'beam',
      type: 'beam',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      geometry: { radius: 0.05, height: 8 },
      beamModes: ['cylinder', 'photonStream'],
      visible: true,
      beamPower: 25,
      beamMono: 'Xtal',
    },
    {
      id: 'floor',
      type: 'motor',
      transform: { position: [0, -0.3, 0], rotation: [0, 0, 0] },
      visible: true,
    },
    {
      id: 'horizontalStage',
      type: 'stage',
      stageType: 'xyz',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      geometry: { width: 1, depth: 1, height: 0.2 },
      parentId: 'floor',
      visible: true,
    },
    {
      id: 'rotationStage',
      type: 'stage',
      stageType: 'cylindrical',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      geometry: { radius: 0.4, height: 0.4 },
      parentId: 'horizontalStage',
      visible: true,
    },
    {
      id: 'centeringStage',
      type: 'stage',
      stageType: 'xyz',
      transform: { position: [0, 0.25, 0], rotation: [0, 0, 0] },
      geometry: { width: 0.5, depth: 0.5, height: 0.05 },
      parentId: 'rotationStage',
      visible: true,
    },
    {
      id: 'sample',
      type: 'sample',
      transform: { position: [0, 0.2, 0], rotation: [0, 0, 0] },
      geometry: { radius: 0.2, height: 0.4 },
      parentId: 'centeringStage',
      visible: true,
      meshType: 'cube',
    },
    {
      id: 'detector',
      type: 'detector',
      transform: { position: [4, 0, 0], rotation: [0, Math.PI / 2, 0] },
      geometry: { width: 1, height: 1, depth: 0.2 },
      visible: true,
    },
    {
      id: 'beamStop',
      type: 'beamStop',
      parentId: 'beam',
      transform: { position: [-2, 0, 0], rotation: [0, 0, 0] },
      visible: true,
      shutterOpen: false,
    },
  ],
  controlLayout: {
    common: { camera: true, beam: true, shutter: true },
    stages: [
      { id: 'horizontalStage1', type: 'xyz' },
      { id: 'rotationStage', type: 'cylindrical' },
      { id: 'centeringStage', type: 'xyz' },
    ],
    sample: { showMeshOptions: true },
  },
  name: '8.3.2 Tomography',
};

/**
 * Beamline configuration for the example beamline.
 */
export const exampleDefinition: BeamlineDefinition = {
  sceneConfig: [
    {
      id: 'beam',
      type: 'beam',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      geometry: { radius: 0.05, height: 8 },
      beamModes: ['cylinder', 'photonStream'],
      visible: true,
      beamPower: 25,
      beamMono: 'Xtal',
    },
    {
      id: 'floor',
      type: 'motor',
      transform: { position: [0, -0.3, 0], rotation: [0, 0, 0] },
      visible: true,
    },
    {
      id: 'horizontalStage',
      type: 'stage',
      stageType: 'xyz',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      geometry: { width: 1, depth: 1, height: 0.2 },
      parentId: 'floor',
      visible: true,
    },
    {
      id: 'rotationStage',
      type: 'stage',
      stageType: 'cylindrical',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      geometry: { radius: 0.4, height: 0.4 },
      parentId: 'horizontalStage',
      visible: true,
    },
    {
      id: 'centeringStage',
      type: 'stage',
      stageType: 'xyz',
      transform: { position: [0, 0.25, 0], rotation: [0, 0, 0] },
      geometry: { width: 0.5, depth: 0.5, height: 0.05 },
      parentId: 'rotationStage',
      visible: true,
    },
    {
      id: 'sample',
      type: 'sample',
      transform: { position: [0, 0.2, 0], rotation: [0, 0, 0] },
      geometry: { radius: 0.2, height: 0.4 },
      parentId: 'centeringStage',
      visible: true,
      meshType: 'cube',
    },
    {
      id: 'detector',
      type: 'detector',
      transform: { position: [4, 0, 0], rotation: [0, Math.PI / 2, 0] },
      geometry: { width: 1, height: 1, depth: 0.2 },
      visible: true,
    },
    {
      id: 'beamStop',
      type: 'beamStop',
      parentId: 'beam',
      transform: { position: [-2, 0, 0], rotation: [0, 0, 0] },
      visible: true,
      shutterOpen: false,
    },
  ],
  controlLayout: {
    common: { camera: true, beam: true, shutter: true },
    stages: [
      { id: 'horizontalStage1', type: 'xyz' },
      { id: 'rotationStage', type: 'cylindrical' },
      { id: 'centeringStage', type: 'xyz' },
    ],
    sample: { showMeshOptions: true },
  },
  name: 'Example Beamline',
};

export const bl531Definition: BeamlineDefinition = {
  sceneConfig: [
    {
      id: 'horizontalStage',
      type: 'stage',
      stageType: 'xyz',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      synopticId: 'sample-mount',
      visible: true,
      geometry: { width: 2, depth: 1, height: 0.3},
      inversions: { x: -1 }
    },
  ],
  controlLayout: {
    common: {camera: true},
    stages: [
      { id: 'horizontalStage1', type: 'xyz' }
    ]
  },
  name: 'BL5.3.1 R&D',
};

/**
 * Export the available beamline definitions as a lookup.
 */
export const beamlineDefinitions: Record<string, BeamlineDefinition> = {
  bl733: bl733Definition,
  bl832: bl832Definition,
  bl531: bl531Definition,
  example: exampleDefinition,
};
