import { DetectorConfig } from '../../../types/ComponentConfig';
import * as THREE from 'three';
export declare function createDetector(cfg: DetectorConfig, shared: {
    xRayMaterial: THREE.ShaderMaterial;
    materials: Record<string, THREE.Material>;
}): THREE.Object3D;
//# sourceMappingURL=createDetector.d.ts.map