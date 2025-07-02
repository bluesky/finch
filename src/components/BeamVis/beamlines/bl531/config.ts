import { ComponentConfig } from '../../types/ComponentConfig';

export const bl531SceneConfig: ComponentConfig[] = [
  {
    id: 'sampleMount',
    type: 'stage',
    stageType: 'xyz',
    transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
    parentId: 'floor',
    visible: true,
    geometry: { width: 1, depth: 2, height: 0.3}
  }
];

export const bl531ControlLayout = {
  common: {
    camera: true,
  },

  stages: {
    id: 'sampleMount'
  }
};

export const bl531Definition = {
  sceneConfig: bl531SceneConfig,
  controlLayout: bl531ControlLayout,
  name: 'BL5.3.1 R&D',
};