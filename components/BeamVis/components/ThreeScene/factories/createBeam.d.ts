import { BeamConfig } from '../../../types/ComponentConfig';
import { SharedResources } from '../ThreeScene';
import * as THREE from 'three';
/**
 * Creates a beam group.
 * - If "cylinder" is enabled, creates the cylinder beam.
 * - Photon stream logic is handled globally in ThreeScene.
 */
export declare function createBeam(cfg: BeamConfig, shared: SharedResources): THREE.Object3D;
//# sourceMappingURL=createBeam.d.ts.map