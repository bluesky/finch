import { default as React } from '../../node_modules/react';
import { Node, Edge } from 'src/components/BeamVis/Synoptic_Config';
import * as THREE from 'three';
export interface SynopticViewProps {
    nodes: Node[];
    edges: Edge[];
    motionState: MotionState;
}
export interface MotionState {
    isMoving: boolean;
    objectId: string | null;
    startPosition: THREE.Vector3 | null;
}
declare const SynopticView: React.FC<SynopticViewProps>;
export default SynopticView;
//# sourceMappingURL=BeamVisSynoptic.d.ts.map