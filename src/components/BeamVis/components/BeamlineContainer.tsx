/**
 * @file BeamlineContainer.tsx
 * @description Connects to EPICS PVs via PVWS to drive the 3D scene and controls.
 */

import { useState, useEffect, useMemo, ChangeEvent, CSSProperties, FC, useContext } from 'react';
import ThreeScene from './ThreeScene/ThreeScene';
import ControlPanel from './ControlPanel/ControlPanel';
import { ComponentConfig } from '../types/ComponentConfig';
import { beamlineDefinitions, BeamlineDefinition } from '../beam_configs';
import { usePV, useEpics } from '../EPICS/EpicsContext';
import useOphydSocket from 'src/hooks/useOphydSocket';

const BeamlineContainer: FC = () => {

  const [active3d, setActive3d] = useState<string | null>(null)
  // hover state for axes
  const [hovered, setHovered] = useState<{ axis: 'X' | 'Y' | 'Z'; dirSign: 1 | -1 } | null>(null)
  // Available beamlines
  const availableBeamlines = useMemo(() => Object.keys(beamlineDefinitions), []);
  const [selectedBeamline, setSelectedBeamline] = useState(availableBeamlines[2] || '');

  // Static beamline definition and configs
  const [beamlineDefinition, setBeamlineDefinition] = useState<BeamlineDefinition | null>(null);
  const [configs, setConfigs] = useState<ComponentConfig[]>([]);

  // UI state
  const [panelOpen, setPanelOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playAngle, setPlayAngle] = useState(0);
  const [cameraX, setCameraX] = useState(-10);

  const pvList = useMemo(
    () => [
      'IOC:m1.VAL', // centeringStageX
      'IOC:m2.VAL', // centeringStageY
      'IOC:m3.VAL', // centeringStageZ
      'bl531_xps2:sample_x_mm', // horizontalStageX
      'bl531_xps2:sample_y_mm', // horizontalStageY
      'IOC:m6.VAL', // horizontalStageZ
      'IOC:m7.VAL' // rotationStage
    ], []);

  const { devices, handleSetValueRequest } = useOphydSocket('ws://192.168.10.155:8002/ophydSocket', pvList);

  const deviceArray = useMemo(
    () => Object.values(devices || {}),
    [devices]
  );

  // EPICS PV subscriptions (use full .VAL field names)
  // const motorX = usePV('IOC:m1.VAL');
  // const motorY = usePV('IOC:m2.VAL');
  // const motorZ = usePV('IOC:m3.VAL');
  // const horizX = usePV('IOC:m4.VAL');
  // const horizY = usePV('IOC:m5.VAL');
  // const horizZ = usePV('IOC:m6.VAL');
  // const rotationStage = usePV('IOC:m7.VAL');

  const motorX = devices['IOC:m1.VAL']?.value ?? 0;
  const motorY = devices['IOC:m2.VAL']?.value ?? 0;
  const motorZ = devices['IOC:m3.VAL']?.value ?? 0;
  const horizX = devices['bl531_xps2:sample_x_mm']?.value ?? 0;
  const horizY = devices['bl531_xps2:sample_y_mm']?.value ?? 0;
  const horizZ = devices['IOC:m6.VAL']?.value ?? 0;
  const rotationStage = devices['IOC:m7.VAL']?.value ?? 0;


  const publish = handleSetValueRequest;


  // Load beamline definition on selection
  useEffect(() => {
    if (!selectedBeamline) return;
    const def = beamlineDefinitions[selectedBeamline];
    setBeamlineDefinition(def);
    setConfigs(def.sceneConfig);
    setPlayAngle(0);
    setCameraX(-10);
  }, [selectedBeamline]);

  // Reflect live PV values into 3D scene
  useEffect(() => {
    setConfigs(prev =>
      prev.map(cfg =>
        cfg.id === 'centeringStage'
          ? {
            ...cfg, transform: {
              ...cfg.transform, position: [
                Number(devices['IOC:m1.VAL']?.value),
                Number(devices['IOC:m2.VAL']?.value),
                Number(devices['IOC:m3.VAL']?.value)]
            }
          }
          : cfg
      )
    );
  }, [motorX, motorY, motorZ]);

  useEffect(() => {
    setConfigs(prev =>
      prev.map(cfg =>
        cfg.id === 'horizontalStage'
          ? {
            ...cfg, transform: {
              ...cfg.transform, position: [
                Number(devices['bl531_xps2:sample_x_mm']?.value),
                Number(devices['bl531_xps2:sample_y_mm']?.value),
                Number(devices['IOC:m6.VAL']?.value)
              ]
            }
          }
          : cfg
      )
    );
  }, [horizX, horizY, horizZ]);

  useEffect(() => {
    const angleNum = Number(rotationStage)
    setPlayAngle(angleNum);
    setConfigs(prev =>
      prev.map(cfg =>
        cfg.id === 'rotationStage'
          ? { ...cfg, transform: { ...cfg.transform, rotation: [0, (Math.PI * angleNum) / 180, 0] } }
          : cfg
      )
    );
  }, [rotationStage]);

  // Sample mesh handler
  const handleSampleMeshChange = (meshType: 'cube' | 'cylinder' | 'fbx' | 'obj') => {
    setConfigs(prev =>
      prev.map(cfg =>
        cfg.type === 'sample'
          ? { ...cfg, meshType, meshUrl: meshType === 'fbx' ? 'beam_vis/assets/bananas.fbx' : meshType === 'obj' ? 'beam_vis/assets/al-1795-0875.obj' : undefined }
          : cfg
      )
    );
  };

  // Control panel toggles
  const togglePanel = () => setPanelOpen(p => !p);
  const handlePlayPause = () => setIsPlaying(p => !p);
  // const handleManualAngleChange = (val: number) => {
  // setPlayAngle(val);
  // setConfigs(prev =>
  // prev.map(cfg =>
  // cfg.id === 'rotationStage'
  // ? { ...cfg, transform: { ...cfg.transform, rotation: [0, (Math.PI * val) / 180, 0] } }
  // : cfg
  // )
  // );
  // };

  // Publish PV writes
  const handleCenteringStageXChange = (val: number) => publish('IOC:m1.VAL', val);
  const handleCenteringStageYChange = (val: number) => publish('IOC:m2.VAL', val);
  const handleCenteringStageZChange = (val: number) => publish('IOC:m3.VAL', val);
  // const handleStageXChange = (val: number) => publish('IOC:m4.VAL', val);
  // const handleStageYChange = (val: number) => publish('IOC:m5.VAL', val);
  // const handleStageZChange = (val: number) => publish('IOC:m6.VAL', val);
  const handleManualAngleChange = (val: number) => publish('IOC:m7.VAL', val);

  // Horizontal stage (local only)
  const handleStageXChange = (val: number) => {
    handleSetValueRequest('bl531_xps2:sample_x_mm', val);
    setConfigs(prev =>
      prev.map(cfg =>
        cfg.id === 'horizontalStage'
          ? { ...cfg, transform: { ...cfg.transform, position: [val, cfg.transform.position[1], cfg.transform.position[2]] } }
          : cfg
      )
    );
  };
  const handleStageYChange = (val: number) => {
    handleSetValueRequest('bl531_xps2:sample_y_mm', val);
    setConfigs(prev =>
      prev.map(cfg =>
        cfg.id === 'horizontalStage'
          ? { ...cfg, transform: { ...cfg.transform, position: [cfg.transform.position[0], val, cfg.transform.position[2]] } }
          : cfg
      )
    );
  };
  const handleStageZChange = (val: number) => {
    setConfigs(prev =>
      prev.map(cfg =>
        cfg.id === 'horizontalStage'
          ? { ...cfg, transform: { ...cfg.transform, position: [cfg.transform.position[0], cfg.transform.position[1], val] } }
          : cfg
      )
    );
  };

  // Visibility toggle
  const handleToggleVisibility = (id: string) => setConfigs(prev => prev.map(cfg => (cfg.id === id ? { ...cfg, visible: !cfg.visible } : cfg)));

  // Beamline selector
  const handleBeamlineChange = (e: ChangeEvent<HTMLSelectElement>) => setSelectedBeamline(e.target.value);

  const rightPanelStyle: CSSProperties = { width: '100%', borderLeft: '1px solid #ccc', height: '100%', overflowY: 'auto' };

  if (!beamlineDefinition) return <div>Loading beamline...</div>;

  return (
    <div>
      <div>
        <ThreeScene key={selectedBeamline} sceneConfig={configs} highlightedAxis={hovered} />
      </div>
      <div style={rightPanelStyle}>
        <h2 style={{ margin: 0, padding: '8px' }}>Beamline: {beamlineDefinition.name}</h2>
        <select value={selectedBeamline} onChange={handleBeamlineChange} style={{ margin: '8px', marginBottom: '8px' }}>
          {availableBeamlines.map(bl => <option key={bl} value={bl}>{bl}</option>)}
        </select>
        <ControlPanel
          onAxisHover={(axis, dirSign) => setHovered({ axis, dirSign })}
          onAxisUnhover={() => setHovered(null)}
          key={selectedBeamline}
          panelOpen={panelOpen}
          togglePanel={togglePanel}
          configs={configs}
          setConfigs={setConfigs}
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          playAngle={playAngle}
          handleManualAngleChange={handleManualAngleChange}
          cameraX={cameraX}
          setCameraX={setCameraX}
          motorX={Number(motorX)}
          motorY={Number(motorY)}
          motorZ={Number(motorZ)}
          horizX={Number(horizX)}
          horizY={Number(horizY)}
          horizZ={Number(horizZ)}
          handleCenteringStageXChange={handleCenteringStageXChange}
          handleCenteringStageYChange={handleCenteringStageYChange}
          handleCenteringStageZChange={handleCenteringStageZChange}
          handleStageXChange={handleStageXChange}
          handleStageYChange={handleStageYChange}
          handleStageZChange={handleStageZChange}
          handleToggleVisibility={handleToggleVisibility}
          controlLayout={beamlineDefinition.controlLayout}
        // handleSampleMeshChange={handleSampleMeshChange}
        />
      </div>
    </div>
  );
};

export default BeamlineContainer;