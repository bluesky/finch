import React, { useCallback, CSSProperties } from 'react';
import { ComponentConfig } from '../../../types/ComponentConfig';

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
  handleMotorXChange: (val: number) => void;
  handleMotorYChange: (val: number) => void;
  handleMotorZChange: (val: number) => void;
  cameraX: number;
  setCameraX: (val: number) => void;
  buttonStyle: CSSProperties;
  sectionStyle: CSSProperties;
  labelStyle: CSSProperties;
  sliderStyle: CSSProperties;
}

const ControlModules: React.FC<ControlModulesProps> = ({
  configs,
  setConfigs,
  playAngle,
  handleManualAngleChange,
  handleStageXChange,
  handleStageYChange,
  handleStageZChange,
  motorX,
  motorY,
  motorZ,
  handleMotorXChange,
  handleMotorYChange,
  handleMotorZChange,
  cameraX,
  setCameraX,
  buttonStyle,
  sectionStyle,
  labelStyle,
  sliderStyle,
}) => {
  //////////////////////////////////////////////////////////
  // StageControls logic
  //////////////////////////////////////////////////////////
  const stageConfig = configs.find((c) => c.type === 'stage');
  const stagePosX = stageConfig?.transform.position[0] || 0;
  const stagePosY = stageConfig?.transform.position[1] || 0;
  const stagePosZ = stageConfig?.transform.position[2] || 0;

  //////////////////////////////////////////////////////////
  // ShutterControls logic
  //////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////
  // CameraControls logic
  //////////////////////////////////////////////////////////
  // Already have cameraX, setCameraX in props.

  //////////////////////////////////////////////////////////
  // BeamControls logic
  //////////////////////////////////////////////////////////
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
      prev.map((cfg) =>
        cfg.type === 'beam' ? { ...cfg, beamPower: val } : cfg
      )
    );
  };

  const setBeamMono = (mono: 'Xtal' | 'Multilayer' | 'WhiteLight') => {
    setConfigs((prev) =>
      prev.map((cfg) =>
        cfg.type === 'beam' ? { ...cfg, beamMono: mono } : cfg
      )
    );
  };

  return (
    <>
      {/* ----------------------
          Stage Controls UI
      ---------------------- */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Stage Rotation: {playAngle.toFixed(1)}°</div>
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

      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Stage Movement</h3>
        <div style={{ marginBottom: '1rem' }}>
          <div style={labelStyle}>Front-Back (X-axis): {stagePosX.toFixed(2)}</div>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={stagePosX}
            onChange={(e) => handleStageXChange(Number(e.target.value))}
            style={sliderStyle}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={labelStyle}>
            Down-Up (Y-axis):{
              ' '
            }
            {configs
              .find((c) => c.id === 'horizontalStage')
              ?.transform.position[1].toFixed(2)}
          </div>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.01}
            value={
              configs.find((c) => c.id === 'horizontalStage')?.transform.position[1] || 0
            }
            onChange={(e) => handleStageYChange(Number(e.target.value))}
            style={sliderStyle}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={labelStyle}>Left-Right (Z-axis): {stagePosZ.toFixed(2)}</div>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={stagePosZ}
            onChange={(e) => handleStageZChange(Number(e.target.value))}
            style={sliderStyle}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '0.5rem', color: '#555555' }}>Centering Motor</h3>
        <div style={{ marginBottom: '1rem' }}>
          <div style={labelStyle}>X: {motorX.toFixed(2)}</div>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.01}
            value={motorX}
            onChange={(e) => handleMotorXChange(Number(e.target.value))}
            style={sliderStyle}
          />
        </div>
        {/* If needed for Y:
        <div style={{ marginBottom: '1rem' }}>
          <div style={labelStyle}>Y: {motorY.toFixed(2)}</div>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.01}
            value={motorY}
            onChange={(e) => handleMotorYChange(Number(e.target.value))}
            style={sliderStyle}
          />
        </div>
        */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={labelStyle}>Z: {motorZ.toFixed(2)}</div>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.01}
            value={motorZ}
            onChange={(e) => handleMotorZChange(Number(e.target.value))}
            style={sliderStyle}
          />
        </div>
      </div>

      {/* ----------------------
          Shutter Controls UI
      ---------------------- */}
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

      {/* ----------------------
          Camera Controls UI
      ---------------------- */}
      {/* <div style={sectionStyle}>
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
      </div> */}

      {/* ----------------------
          Beam Controls UI
      ---------------------- */}
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
  );
};

export default ControlModules;
