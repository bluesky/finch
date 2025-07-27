// BeamlineContainer.tsx

import { useState, useRef, useEffect, useMemo, ChangeEvent, CSSProperties, FC } from 'react';
import ThreeScene from './ThreeScene/ThreeScene';
import ControlPanel from './ControlPanel/ControlPanel';
import { ComponentConfig } from '../types/ComponentConfig';
import { beamlineDefinitions, BeamlineDefinition } from '../beam_configs';
import useOphydSocket from 'src/hooks/useOphydSocket';
import * as THREE from 'three';

interface MotionState {
  isMoving: boolean;
  objectId: string | null;
  startPosition: THREE.Vector3 | null;
}

const BeamlineContainer: FC = () => {
  // --- STATE SETUP ---
  const [hovered, setHovered] = useState<{ axis: 'X' | 'Y' | 'Z'; dirSign: 1 | -1 } | null>(null);
  const availableBeamlines = useMemo(() => Object.keys(beamlineDefinitions), []);
  const defaultKey = availableBeamlines.length > 0 ? (availableBeamlines[2] || availableBeamlines[0]) : '';
  const [selectedBeamline, setSelectedBeamline] = useState(defaultKey);
  const [panelOpen, setPanelOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const [motionState, setMotionState] = useState<MotionState>({
    isMoving: false,
    objectId: null,
    startPosition: null
  });

  const moveEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // --- OPHYD SOCKET & DATA ---
  const pvList = useMemo(() => [
    'IOC:m1.VAL', 'IOC:m2.VAL', 'IOC:m3.VAL',
    'bl531_xps2:sample_x_mm', 'bl531_xps2:sample_y_mm',
    'bl531_xps2:sample_x_mm.RBV', 'bl531_xps2:sample_y_mm.RBV',
    'IOC:m6.VAL', 'IOC:m7.VAL'
  ], []);

  const { devices, handleSetValueRequest } = useOphydSocket('ws://192.168.10.155:8002/ophydSocket', pvList);
  const isReady = useMemo(() => Object.keys(devices).length > 0, [devices]);

  const beamlineDefinition = beamlineDefinitions[selectedBeamline];

  const configs: ComponentConfig[] = useMemo(() => {
    if (!beamlineDefinition) return [];

    // Start with the static configuration for the selected beamline.
    let currentConfigs = beamlineDefinition.sceneConfig;

    // If the live device data is ready, inject its values into our config.
    if (isReady) {
      currentConfigs = currentConfigs.map(cfg => {
        switch (cfg.id) {
          case 'centeringStage':
            return {
              ...cfg,
              transform: {
                ...cfg.transform,
                position: [
                  Number(devices['IOC:m1.VAL']?.value ?? cfg.transform.position[0]),
                  Number(devices['IOC:m2.VAL']?.value ?? cfg.transform.position[1]),
                  Number(devices['IOC:m3.VAL']?.value ?? cfg.transform.position[2])
                ]
              }
            };
          case 'horizontalStage':
            return {
              ...cfg,
              transform: {
                ...cfg.transform,
                position: [
                  -Number(devices['bl531_xps2:sample_x_mm.RBV']?.value ?? cfg.transform.position[0]),
                  Number(devices['bl531_xps2:sample_y_mm.RBV']?.value ?? cfg.transform.position[1]),
                  Number(devices['IOC:m6.VAL']?.value ?? cfg.transform.position[2])
                ]
              }
            };
          case 'rotationStage':
            const angleNum = Number(devices['IOC:m7.VAL']?.value ?? 0);
            return {
              ...cfg,
              transform: {
                ...cfg.transform,
                rotation: [0, (Math.PI * angleNum) / 180, 0]
              }
            };
          default:
            return cfg;
        }
      });
    }

    return currentConfigs;
  }, [selectedBeamline, beamlineDefinition, devices, isReady]);

  useEffect(() => {
    // Only run the debounce logic if a move has been initiated.
    if (!motionState.isMoving) {
      return;
    }

    // A new 'devices' object has arrived. This means a PV value changed.
    // We reset the "end of move" timer.
    if (moveEndTimeoutRef.current) {
      clearTimeout(moveEndTimeoutRef.current);
    }

    // If we don't receive another 'devices' update within 250ms,
    // we'll assume the movement has stopped.
    moveEndTimeoutRef.current = setTimeout(() => {
      setMotionState({ isMoving: false, objectId: null, startPosition: null });
    }, 250); // 250ms is a good value

    // Cleanup on unmount
    return () => {
      if (moveEndTimeoutRef.current) {
        clearTimeout(moveEndTimeoutRef.current);
      }
    };
  }, [devices, motionState.isMoving]); // The key change: watch 'devices'


  // 3. UPDATE THE HANDLERS TO START THE GHOSTING
  // This function will be called by any jog/move button.
  const initiateMove = (objectId: string) => {
    const currentConfig = configs.find(c => c.id === objectId);
    if (currentConfig) {
      // Set the state to begin the ghosting effect
      setMotionState({
        isMoving: true,
        objectId: objectId,
        startPosition: new THREE.Vector3().fromArray(currentConfig.transform.position),
      });
    }
  };// Watch all position PVs

  const playAngle = Number(devices['IOC:m7.VAL']?.value ?? 0);

  // --- EVENT HANDLERS ---

  const handleBeamlineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBeamline(e.target.value);
  };

  const handleManualAngleChange = (val: number) => handleSetValueRequest('IOC:m7.VAL', val);
  const handleStageXChange = (val: number) => {
    initiateMove('horizontalStage');
    handleSetValueRequest('bl531_xps2:sample_x_mm', val);
  };
  const handleStageYChange = (val: number) => {
    initiateMove('horizontalStage');
    handleSetValueRequest('bl531_xps2:sample_y_mm', val);
  };


  // --- RENDER LOGIC ---
  if (!beamlineDefinition) return <div>Loading beamline definition...</div>;

  return (
    <div>
      {!isReady ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Connecting to Beamline Controls...</h2>
        </div>
      ) : (
        <>
          <div>
            <ThreeScene
            key={selectedBeamline}
            sceneConfig={configs}
            highlightedAxis={hovered}
            motionState={motionState}
            />
          </div>
          <div style={{ width: '100%', borderLeft: '1px solid #ccc', height: '100%', overflowY: 'auto' }}>
            <h2 style={{ margin: 0, padding: '8px' }}>Beamline: {beamlineDefinition.name}</h2>
            <select value={selectedBeamline} onChange={handleBeamlineChange} style={{ margin: '8px' }}>
              {availableBeamlines.map(bl => <option key={bl} value={bl}>{bl}</option>)}
            </select>
            <ControlPanel
              onAxisHover={(axis, dirSign) => setHovered({ axis, dirSign })}
              onAxisUnhover={() => setHovered(null)}
              key={selectedBeamline} // Using key here is still good practice
              panelOpen={panelOpen}
              togglePanel={() => setPanelOpen(p => !p)}
              configs={configs}
              setConfigs={() => {}} // setConfigs is no longer needed by ControlPanel
              isPlaying={isPlaying}
              handlePlayPause={() => setIsPlaying(p => !p)}
              playAngle={playAngle}
              handleManualAngleChange={handleManualAngleChange}
              // Pass the live values directly to the control panel
              motorX={Number(devices['IOC:m1.VAL']?.value ?? 0)}
              motorY={Number(devices['IOC:m2.VAL']?.value ?? 0)}
              motorZ={Number(devices['IOC:m3.VAL']?.value ?? 0)}
              horizX={Number(devices['bl531_xps2:sample_x_mm.RBV']?.value ?? 0)}
              horizY={Number(devices['bl531_xps2:sample_y_mm.RBV']?.value ?? 0)}
              horizZ={Number(devices['IOC:m6.VAL']?.value ?? 0)}
              // Pass down the handlers
              handleStageXChange={handleStageXChange}
              handleStageYChange={handleStageYChange}
              // You would add other handlers here as needed
              handleCenteringStageXChange={(val) => handleSetValueRequest('IOC:m1.VAL', val)}
              handleCenteringStageYChange={(val) => handleSetValueRequest('IOC:m2.VAL', val)}
              handleCenteringStageZChange={(val) => handleSetValueRequest('IOC:m3.VAL', val)}
              handleStageZChange={(val) => handleSetValueRequest('IOC:m6.VAL', val)}
              handleToggleVisibility={() => {}} // You may need to implement this differently now
              controlLayout={beamlineDefinition.controlLayout}
              cameraX={0} /* dummy prop */
              setCameraX={() => {}} /* dummy prop */
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BeamlineContainer;