import { default as React } from '../../../../../node_modules/react';
import { ComponentConfig } from '../../types/ComponentConfig';
import * as THREE from 'three';
export type HoveredAxis = {
    axis: 'X' | 'Y' | 'Z';
    dirSign: 1 | -1;
} | null;
interface ThreeSceneProps {
    sceneConfig: ComponentConfig[];
    highlightedAxis: HoveredAxis;
    motionState: {
        isMoving: boolean;
        objectId: string | null;
        startPosition: THREE.Vector3 | null;
    };
}
export interface SharedResources {
    xRayMaterial: THREE.ShaderMaterial;
    materials: {
        detector: THREE.MeshPhongMaterial;
        beam: THREE.MeshStandardMaterial;
        sampleCube: THREE.MeshPhongMaterial;
    };
    geometries?: object;
}
declare const ThreeScene: React.FC<ThreeSceneProps>;
export default ThreeScene;
//# sourceMappingURL=ThreeScene.d.ts.map