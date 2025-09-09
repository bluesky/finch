import { ComponentConfig } from '../../types/ComponentConfig';

export const bl832SceneConfig: ComponentConfig[] = [
  {
    id: 'beam',
    type: 'beam',
    transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
    geometry: { radius: 0.05, height: 8 },
    beamModes: ['cylinder', 'photonStream'], // default to cylinder
    visible: true,
    beamPower: 25,           // 25 keV
    beamMono: 'Xtal',        // Pink by default
  },
  {
    id: 'floor',
    type: 'motor', // or just a dummy container?
    transform: { position: [0, -0.3, 0], rotation: [0, 0, 0] },
    visible: true,
  },
  /********************************************************
   * Horizontal Stage (X/Y or X/Z). We'll call it xyz for now
   ********************************************************/
  {
    id: 'horizontalStage',
    type: 'stage',
    stageType: 'xyz', // we only plan to move X and Y, but let's keep it general
    transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
    geometry: { width: 1, depth: 1, height: 0.2 },
    parentId: 'floor',
    visible: true,
  },
  // * Rotation Stage on top
  /********************************************************
   ********************************************************/
  {
    id: 'rotationStage',
    type: 'stage',
    stageType: 'cylindrical',
    transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
    geometry: { radius: 0.4, height: 0.4 },
    parentId: 'horizontalStage',
    visible: true,
  },
  /********************************************************
   * Another small "centering" motor stage on top
   ********************************************************/
  {
    id: 'centeringStage',
    type: 'stage',
    stageType: 'xyz',
    transform: { position: [0, 0.25, 0], rotation: [0, 0, 0] },
    geometry: { width: 0.5, depth: 0.5, height: 0.05 },
    parentId: 'rotationStage',
    visible: true,
  },
  /********************************************************
   * Sample
   ********************************************************/
  {
    id: 'sample',
    type: 'sample',
    transform: { position: [0, 0.2, 0], rotation: [0, 0, 0] },
    geometry: { radius: 0.2, height: 0.4 },
    parentId: 'centeringStage',
    visible: true,
    meshType: 'cube',
  },
  /********************************************************
   * Detector
   ********************************************************/
  {
    id: 'detector',
    type: 'detector',
    transform: {
      position: [4, 0, 0],
      rotation: [0, Math.PI / 2, 0],
    },
    geometry: { width: 1, height: 1, depth: 0.2 },
    visible: true,
  },
  /********************************************************
   * Beam Stop
   ********************************************************/
  {
    id: 'beamStop',
    type: 'beamStop',
    parentId: 'beam',
    transform: { position: [-2, 0, 0], rotation: [0, 0, 0] },
    visible: true,
    shutterOpen: false,
  },
];

export const bl832ControlLayout = {
  // We definitely want camera + beam + shutter controls
  common: {
    camera: true,
    beam: true,
    shutter: true,
  },
  // We have multiple stages: horizontalStage1, rotationStage, centeringStage
  stages: [
    { id: 'horizontalStage1', type: 'xyz' },
    { id: 'rotationStage', type: 'cylindrical' },
    { id: 'centeringStage', type: 'xyz' },
  ],
  sample: {
    showMeshOptions: true,
  },
};

export const bl832Definition = {
  sceneConfig: bl832SceneConfig,
  controlLayout: bl832ControlLayout,
  name: '8.3.2 Tomography',
};

