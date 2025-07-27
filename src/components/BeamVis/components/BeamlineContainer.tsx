// BeamlineContainer.tsx

import { useState, useRef, useEffect, useMemo, ChangeEvent, CSSProperties, FC } from 'react';
import ThreeScene from './ThreeScene/ThreeScene';
import ControlPanel from './ControlPanel/ControlPanel';
import { ComponentConfig } from '../types/ComponentConfig';
import { beamlineDefinitions, BeamlineDefinition } from '../beam_configs';
import * as THREE from 'three';

interface BeamlineContainerProps {
  devices: any,
  handleSetValueRequest: (pv: string, value: number) => void;
  motionState: any;
  initiateMove: (objectId: string, startPosition: THREE.Vector3) => void;
}

const BeamlineContainer: React.FC<BeamlineContainerProps> = ({
  devices,
  handleSetValueRequest,
  motionState,
  initiateMove
}) => {
  // --- STATE SETUP ---
  const [hovered, setHovered] = useState<{ axis: 'X' | 'Y' | 'Z'; dirSign: 1 | -1 } | null>(null);
  const availableBeamlines = useMemo(() => Object.keys(beamlineDefinitions), []);
  const defaultKey = availableBeamlines.length > 0 ? (availableBeamlines[2] || availableBeamlines[0]) : '';
  const [selectedBeamline, setSelectedBeamline] = useState(defaultKey);
  const [panelOpen, setPanelOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
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

  const playAngle = Number(devices['IOC:m7.VAL']?.value ?? 0);

  // --- EVENT HANDLERS ---

  const handleBeamlineChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBeamline(e.target.value);
  };

  const handleManualAngleChange = (val: number) => handleSetValueRequest('IOC:m7.VAL', val);
  const handleStageXChange = (val: number) => {
    const currentConfig = configs.find(c => c.id === 'horizontalStage');
    if (currentConfig) {
      const startPos = new THREE.Vector3().fromArray(currentConfig.transform.position);
      const idToAnnounce = currentConfig.synopticId || currentConfig.id;
      initiateMove(idToAnnounce, startPos);
    }
    handleSetValueRequest('bl531_xps2:sample_x_mm', val);
  };

  const handleStageYChange = (val: number) => {
    const currentConfig = configs.find(c => c.id === 'horizontalStage');
    if (currentConfig) {
      const startPos = new THREE.Vector3().fromArray(currentConfig.transform.position);
      const idToAnnounce = currentConfig.synopticId || currentConfig.id;
      initiateMove(idToAnnounce, startPos);
    }
    handleSetValueRequest('bl531_xps2:sample_y_mm', val);
  };

  const handleAxisHover = (axis: 'X' | 'Y' | 'Z', dirSign: 1 | -1) => {
    const stageConfig = configs.find(c => c.id === 'horizontalStage');
    const inversionFactor = stageConfig?.inversions?.[axis as keyof typeof stageConfig.inversions] ?? 1;
    const finalDirSign = (dirSign * inversionFactor) as 1 | -1;
    setHovered({ axis, dirSign: finalDirSign });
  };

  const handleAxisUnhover = () => {
    setHovered(null);
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
              onAxisHover={handleAxisHover}
              onAxisUnhover={handleAxisUnhover}
              key={selectedBeamline}
              panelOpen={panelOpen}
              togglePanel={() => setPanelOpen(p => !p)}
              configs={configs}
              setConfigs={() => {}}
              isPlaying={isPlaying}
              handlePlayPause={() => setIsPlaying(p => !p)}
              playAngle={playAngle}
              handleManualAngleChange={handleManualAngleChange}
              motorX={Number(devices['IOC:m1.VAL']?.value ?? 0)}
              motorY={Number(devices['IOC:m2.VAL']?.value ?? 0)}
              motorZ={Number(devices['IOC:m3.VAL']?.value ?? 0)}
              horizX={Number(devices['bl531_xps2:sample_x_mm.RBV']?.value ?? 0)}
              horizY={Number(devices['bl531_xps2:sample_y_mm.RBV']?.value ?? 0)}
              horizZ={Number(devices['IOC:m6.VAL']?.value ?? 0)}
              handleStageXChange={handleStageXChange}
              handleStageYChange={handleStageYChange}
              handleCenteringStageXChange={(val) => handleSetValueRequest('IOC:m1.VAL', val)}
              handleCenteringStageYChange={(val) => handleSetValueRequest('IOC:m2.VAL', val)}
              handleCenteringStageZChange={(val) => handleSetValueRequest('IOC:m3.VAL', val)}
              handleStageZChange={(val) => handleSetValueRequest('IOC:m6.VAL', val)}
              handleToggleVisibility={() => {}}
              controlLayout={beamlineDefinition.controlLayout}
              cameraX={0}
              setCameraX={() => {}}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BeamlineContainer;