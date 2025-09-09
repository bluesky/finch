import { StageConfig } from '../../../../types/ComponentConfig';
import { createXYZStage } from './createXYZStage';
import { createCylindricalStage } from './createCylindricalStage';
import { createTiltStage } from './createTiltStage';
import * as THREE from 'three';

export function createStage(cfg: StageConfig): THREE.Object3D {
  switch (cfg.stageType) {
    case 'xyz':
      return createXYZStage(cfg);
    case 'cylindrical':
      return createCylindricalStage(cfg);
    case 'tilt':
      return createTiltStage(cfg);
    // case 'rotation': ...
    default:
      console.warn(`Unknown stageType: ${cfg.stageType}, defaulting to XYZ.`);
      return createXYZStage(cfg);
  }
}
