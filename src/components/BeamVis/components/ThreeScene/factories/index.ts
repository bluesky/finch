import * as THREE from 'three';
import { ComponentConfig } from '../../../types/ComponentConfig';
import { createBeam } from './createBeam';
import { createBeamStop } from './createBeamStop';
import { createDetector } from './createDetector';
import { createMotor } from './createMotor';
import { createSample } from './createSample';
import { createStage } from './stage';  // from stage/index.ts
// If you have a createRobotArm.ts, import it here
import { SharedResources } from '../ThreeScene';

export function createObjectFromConfig(cfg: ComponentConfig, shared: SharedResources): THREE.Object3D | null {
  switch (cfg.type) {
    case 'beam':
      return createBeam(cfg, shared);
    case 'stage':
      return createStage(cfg);
    case 'detector':
      return createDetector(cfg, shared);
    case 'beamStop':
      return createBeamStop(cfg);
    case 'motor':
      return createMotor(cfg);
    case 'sample':
      return createSample(cfg);
    // case 'robotArm': return createRobotArm(cfg);
    default:
      console.warn(`Unrecognized component type: ${cfg.type}`);
      return null;
  }
}
