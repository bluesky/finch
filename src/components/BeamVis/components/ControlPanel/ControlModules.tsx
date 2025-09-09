// components/ControlPanel/ControlModules.tsx
import React, { useCallback, CSSProperties } from 'react';
import { ComponentConfig } from '../../types/ComponentConfig';

interface StageLayout {
  id: string;
  type: string;
}

interface ControlLayout {
  common?: { camera?: boolean; beam?: boolean; shutter?: boolean };
  stages?: StageLayout[];
  sample?: any;
}

interface ControlModulesProps {
  configs: ComponentConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<ComponentConfig[]>>;
  playAngle: number;
  handleManualAngleChange: (val: number) => void;
  handleStageXChange: (val: number) => void;
  handleStageYChange: (val: number) => void;
  handleStageZChange: (val: number) => void;
  motorX: number;
  motorY: number;
  motorZ: number;
  handleCenteringStageXChange: (val: number) => void;
  handleCenteringStageYChange: (val: number) => void;
  handleCenteringStageZChange: (val: number) => void;
  cameraX: number;
  setCameraX: (val: number) => void;
  buttonStyle: CSSProperties;
  sectionStyle: CSSProperties;
  labelStyle: CSSProperties;
  sliderStyle: CSSProperties;
  controlLayout: ControlLayout;
  // handleSampleMeshChange: (meshType: 'cube' | 'cylinder' | 'fbx' | 'obj') => void;
}

const ControlModules: React.FC<ControlModulesProps> = ({
  configs,
  setConfigs,
  playAngle,
  handleManualAngleChange,
  handleStageXChange,
  handleStageYChange,
  handleStageZChange,
  handleCenteringStageXChange,
  // handleCenteringStageYChange
  handleCenteringStageZChange,
  cameraX,
  setCameraX,
  buttonStyle,
  sectionStyle,
  labelStyle,
  sliderStyle,
  controlLayout,
  // handleSampleMeshChange,
}) => {
  // Look up specific stage configs by their IDs.
  const horizontalStage = configs.find((c) => c.id === 'horizontalStage');
  const rotationStage = configs.find((c) => c.id === 'rotationStage');
  const centeringStage = configs.find((c) => c.id === 'centeringStage');

  // Conditionally render each section based on controlLayout.
  const showRotationControls = controlLayout.stages?.some((s) => s.id === 'rotationStage');
  const showHorizontalStageControls = controlLayout.stages?.some((s) => s.id === 'horizontalStage1');
  const showCenteringMotor = controlLayout.stages?.some((s) => s.id === 'centeringStage');

  // Shutter controls are rendered only if enabled in common.
  const showShutterControls = controlLayout.common?.shutter;
  const beamStopCfg = configs.find((c) => c.type === 'beamStop');
  const isShutterOpen = beamStopCfg?.shutterOpen || false;
  const shutterButtonColor = isShutterOpen ? '#dc3545' : '#28a745';
  const shutterButtonHoverColor = isShutterOpen ? '#c82333' : '#218838';
  const toggleShutter = useCallback(() => {
    setConfigs((prev) =>
      prev.map((cfg) =>
        cfg.type === 'beamStop'
          ? { ...cfg, shutterOpen: !cfg.shutterOpen }
          : cfg
      )
    );
  }, [setConfigs]);

  // Camera and beam controls based on common flags.
  const showCameraControls = controlLayout.common?.camera;
  const showBeamControls = controlLayout.common?.beam;
  const beamCfg = configs.find((c) => c.type === 'beam');
  const beamModes = beamCfg?.beamModes || [];
  const isCylinder = beamModes.includes('cylinder');
  const isPhotonStream = beamModes.includes('photonStream');
  const beamPower = beamCfg?.beamPower || 25;
  const beamMono = beamCfg?.beamMono || 'Xtal';

  const toggleBeamMode = (mode: 'cylinder' | 'photonStream') => {
    setConfigs((prev) =>
      prev.map((cfg) => {
        if (cfg.type === 'beam') {
          const modes = cfg.beamModes || [];
          return modes.includes(mode)
            ? { ...cfg, beamModes: modes.filter((m) => m !== mode) }
            : { ...cfg, beamModes: [...modes, mode] };
        }
        return cfg;
      })
    );
  };

  const setBeamPower = (val: number) => {
    setConfigs((prev) =>
      prev.map((cfg) => (cfg.type === 'beam' ? { ...cfg, beamPower: val } : cfg))
    );
  };

  const setBeamMono = (mono: 'Xtal' | 'Multilayer' | 'WhiteLight') => {
    setConfigs((prev) =>
      prev.map((cfg) => (cfg.type === 'beam' ? { ...cfg, beamMono: mono } : cfg))
    );
  };

  return (
    <>
      {/* Rotation Stage Controls */}
      {showRotationControls && rotationStage && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Rotation Stage Angle: {playAngle.toFixed(1)}°</div>
          <input
            type="range"
            min={0}
            max={360}
            step={0.1}
            value={playAngle}
            onChange={(e) => handleManualAngleChange(Number(e.target.value))}
            style={sliderStyle}
          />
        </div>
      )}

      {/* Horizontal Stage Movement Controls */}
      {/* {showHorizontalStageControls && horizontalStage && (
        <div style={sectionStyle}>
          <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Horizontal Stage Movement</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={labelStyle}>
              Front-Back (X-axis): {horizontalStage.transform.position[0].toFixed(2)}
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={horizontalStage.transform.position[0]}
              onChange={(e) => handleStageXChange(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={labelStyle}>
              Down-Up (Y-axis): {horizontalStage.transform.position[1].toFixed(2)}
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.01}
              value={horizontalStage.transform.position[1]}
              onChange={(e) => handleStageYChange(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={labelStyle}>
              Left-Right (Z-axis): {horizontalStage.transform.position[2].toFixed(2)}
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={horizontalStage.transform.position[2]}
              onChange={(e) => handleStageZChange(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>
        </div>
      )} */}

      {/* Centering Motor Controls */}
      {showCenteringMotor && centeringStage && (
        <div style={sectionStyle}>
          <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Centering Motor</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={labelStyle}>
              X: {centeringStage.transform.position[0].toFixed(2)}
            </div>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.01}
              value={centeringStage.transform.position[0]}
              onChange={(e) => handleCenteringStageXChange(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={labelStyle}>
              Z: {centeringStage.transform.position[2].toFixed(2)}
            </div>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.01}
              value={centeringStage.transform.position[2]}
              onChange={(e) => handleCenteringStageZChange(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>
        </div>
      )}

      {/* Sample Mesh Controls */}
      {/* <div style={sectionStyle}>
        <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Sample Mesh</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="sampleMesh"
              value="cube"
              checked={configs.find((c) => c.type === 'sample')?.meshType === 'cube'}
              onChange={() => handleSampleMeshChange('cube')}
              style={{ marginRight: '0.5rem' }}
            />
            Cube
          </label>
          <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="sampleMesh"
              value="cylinder"
              checked={configs.find((c) => c.type === 'sample')?.meshType === 'cylinder'}
              onChange={() => handleSampleMeshChange('cylinder')}
              style={{ marginRight: '0.5rem' }}
            />
            Cylinder
          </label>
          <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="sampleMesh"
              value="fbx"
              checked={configs.find((c) => c.type === 'sample')?.meshType === 'fbx'}
              onChange={() => handleSampleMeshChange('fbx')}
              style={{ marginRight: '0.5rem' }}
            />
            FBX Model
          </label>
          <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="sampleMesh"
              value="obj"
              checked={configs.find((c) => c.type === 'sample')?.meshType === 'obj'}
              onChange={() => handleSampleMeshChange('obj')}
              style={{ marginRight: '0.5rem' }}
            />
            OBJ Model
          </label>
        </div>
      </div> */}

      {/* Shutter Controls */}
      {showShutterControls && (
        <div style={sectionStyle}>
          <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Beam Stop</h3>
          <button
            onClick={toggleShutter}
            style={{ ...buttonStyle, backgroundColor: shutterButtonColor }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = shutterButtonHoverColor;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = shutterButtonColor;
            }}
          >
            {isShutterOpen ? 'Close Shutter' : 'Open Shutter'}
          </button>
        </div>
      )}

      {/* Camera Controls */}
      {/* {showCameraControls && (
        <div style={sectionStyle}>
          <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Camera X Position</h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={labelStyle}>X: {cameraX.toFixed(2)}</div>
            <input
              type="range"
              min={-20}
              max={10}
              step={0.1}
              value={cameraX}
              onChange={(e) => setCameraX(Number(e.target.value))}
              style={sliderStyle}
            />
          </div>
        </div>
      )} */}

      {/* Beam Controls */}
      {showBeamControls && (
        <>
          <div style={sectionStyle}>
            <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Beam Mode</h3>
            <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isCylinder}
                onChange={() => toggleBeamMode('cylinder')}
                style={{ marginRight: '0.5rem' }}
              />
              Cylinder
            </label>
            <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPhotonStream}
                onChange={() => toggleBeamMode('photonStream')}
                style={{ marginRight: '0.5rem' }}
              />
              Photon Stream
            </label>
          </div>
          <div style={sectionStyle}>
            <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Beam Energy (keV)</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min={0.001}
                max={50}
                step={0.1}
                value={beamPower}
                onChange={(e) => setBeamPower(Number(e.target.value))}
                style={{ flex: 1, marginRight: '1rem' }}
              />
              <span>{beamPower.toFixed(1)} keV</span>
            </div>
          </div>
          <div style={sectionStyle}>
            <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Monochromator Setting</h3>
            <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="beamMono"
                value="Xtal"
                checked={beamMono === 'Xtal'}
                onChange={() => setBeamMono('Xtal')}
                style={{ marginRight: '0.5rem' }}
              />
              Xtal (Pink)
            </label>
            <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="beamMono"
                value="Multilayer"
                checked={beamMono === 'Multilayer'}
                onChange={() => setBeamMono('Multilayer')}
                style={{ marginRight: '0.5rem' }}
              />
              Multilayer (Green)
            </label>
            <label style={{ display: 'flex', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="beamMono"
                value="WhiteLight"
                checked={beamMono === 'WhiteLight'}
                onChange={() => setBeamMono('WhiteLight')}
                style={{ marginRight: '0.5rem' }}
              />
              WhiteLight (White)
            </label>
          </div>
        </>
      )}
    </>
  );
};

export default ControlModules;
