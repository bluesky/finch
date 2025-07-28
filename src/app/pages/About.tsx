import React, { useState, useEffect, useMemo, useRef } from 'react';
// import './App.css';
import SynopticView from 'src/components/BeamVisSynoptic';
import BeamlineContainer from '@/components/BeamVis/components/BeamlineContainer';
import { nodes, edges } from 'src/components/BeamVis/Synoptic_Config';
import { Legend } from 'src/components/BeamVis/Legend'
import useOphydSocket from 'src/hooks/useOphydSocket';
import * as THREE from 'three';

interface MotionState {
  isMoving: boolean;
  objectId: string | null;
  startPosition: THREE.Vector3 | null;
}

const App: React.FC = () => {

  const pvList = useMemo(() => [
    'IOC:m1.VAL', 'IOC:m2.VAL', 'IOC:m3.VAL',
    'bl531_xps2:sample_x_mm', 'bl531_xps2:sample_y_mm',
    'bl531_xps2:sample_x_mm.RBV', 'bl531_xps2:sample_y_mm.RBV',
    'IOC:m6.VAL', 'IOC:m7.VAL'
  ], []);
  const { devices, handleSetValueRequest } = useOphydSocket('ws://192.168.10.155:8002/ophydSocket', pvList);
  const [motionState, setMotionState] = useState<MotionState>({
    isMoving: false, objectId: null, startPosition: null,
  });
  const moveEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!motionState.isMoving) return;
    if (moveEndTimeoutRef.current) clearTimeout(moveEndTimeoutRef.current);
    moveEndTimeoutRef.current = setTimeout(() => {
      setMotionState({ isMoving: false, objectId: null, startPosition: null });
    }, 250);
    return () => { if (moveEndTimeoutRef.current) clearTimeout(moveEndTimeoutRef.current); };
  }, [devices, motionState.isMoving]);


  const initiateMove = (objectId: string, startPosition: THREE.Vector3) => {
    setMotionState({
      isMoving: true,
      objectId: objectId,
      startPosition: startPosition,
    });
  };

  return (
    <>
      <div className='main-container'>
        <div className='synoptic-panel'>
          <header className='main-header'>
            <h1>BL5.3.1</h1>
          </header>
          <Legend />
          <SynopticView nodes={nodes} edges={edges} motionState={motionState} />
        </div>
        <div className='beamvis-panel'>
          <div className='beamvis-container'>
            <h2>BeamVis 3D</h2>
            <BeamlineContainer
              devices={devices}
              handleSetValueRequest={handleSetValueRequest}
              motionState={motionState}
              initiateMove={initiateMove}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default App;
