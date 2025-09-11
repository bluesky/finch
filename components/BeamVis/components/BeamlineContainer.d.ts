import * as THREE from 'three';
interface BeamlineContainerProps {
    devices: any;
    handleSetValueRequest: (pv: string, value: number) => void;
    motionState: any;
    initiateMove: (objectId: string, startPosition: THREE.Vector3) => void;
}
declare const BeamlineContainer: React.FC<BeamlineContainerProps>;
export default BeamlineContainer;
//# sourceMappingURL=BeamlineContainer.d.ts.map