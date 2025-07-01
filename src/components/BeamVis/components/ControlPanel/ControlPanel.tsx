// components/ControlPanel/ControlPanel.tsx
import React, { CSSProperties } from 'react';
import ControlModules from './ControlModules';
import { ComponentConfig } from '../../types/ComponentConfig';

interface ControlPanelProps {
  panelOpen: boolean;
  togglePanel: () => void;
  configs: ComponentConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<ComponentConfig[]>>;
  isPlaying: boolean;
  handlePlayPause: () => void;
  playAngle: number;
  handleManualAngleChange: (val: number) => void;
  cameraX: number;
  setCameraX: (val: number) => void;
  motorX: number;
  motorY: number;
  motorZ: number;
  handleCenteringStageXChange: (val: number) => void;
  handleCenteringStageYChange: (val: number) => void;
  handleCenteringStageZChange: (val: number) => void;
  handleStageXChange: (val: number) => void;
  handleStageYChange: (val: number) => void;
  handleStageZChange: (val: number) => void;
  handleToggleVisibility: (id: string) => void;
  handleSampleMeshChange: (meshType: 'cube' | 'cylinder' | 'fbx' | 'obj') => void;
  controlLayout: {
    common?: { camera?: boolean; beam?: boolean; shutter?: boolean };
    stages?: any[];
    sample?: any;
    // ...other layout properties...
  };
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  panelOpen,
  togglePanel,
  configs,
  setConfigs,
  isPlaying,
  handlePlayPause,
  playAngle,
  handleManualAngleChange,
  cameraX,
  setCameraX,
  motorX,
  motorY,
  motorZ,
  handleCenteringStageXChange,
  handleCenteringStageYChange,
  handleCenteringStageZChange,
  handleStageXChange,
  handleStageYChange,
  handleStageZChange,
  handleToggleVisibility,
  handleSampleMeshChange,
  controlLayout,
}) => {
  // Original inline styles
  const outerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: panelOpen ? '320px' : '0px',
    minWidth: panelOpen ? '320px' : '0px',
    maxWidth: panelOpen ? '320px' : '0px',
    overflowY: 'auto',
    borderLeft: panelOpen ? '1px solid #ccc' : 'none',
    backgroundColor: '#C1D3E3',
    transition: 'width 0.3s ease',
    boxShadow: panelOpen ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
    color: '#464B53',
    flexShrink: 0,
    position: 'relative',
  };

  const panelContentStyle: CSSProperties = {
    display: panelOpen ? 'flex' : 'none',
    flexDirection: 'column',
    height: '100%',
    padding: panelOpen ? '1.5rem' : '0',
    transition: 'opacity 0.3s ease',
    opacity: panelOpen ? 1 : 0,
  };

  const buttonStyle: CSSProperties = {
    padding: '0.6rem 1rem',
    margin: '0.5rem 0',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  };

  const sectionStyle: CSSProperties = { marginBottom: '1.5rem' };
  const labelStyle: CSSProperties = { marginBottom: '0.5rem', fontWeight: 'bold' };
  const sliderStyle: CSSProperties = { width: '100%' };

  return (
    <div style={outerStyle}>
      {panelOpen && (
        <div style={panelContentStyle}>
          <button
            onClick={togglePanel}
            style={{ ...buttonStyle, alignSelf: 'flex-end', backgroundColor: '#dc3545' }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#c82333')
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc3545')
            }
          >
            Hide Panel
          </button>

          <h2 style={{ marginTop: '1rem', marginBottom: '1rem', color: '#07304B' }}>
            Controls
          </h2>

          {/* Render common controls if allowed by controlLayout */}
          {controlLayout.common?.beam && (
            <button
              onClick={handlePlayPause}
              style={buttonStyle}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0056b3')
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#007bff')
              }
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          )}

          <ControlModules
            configs={configs}
            setConfigs={setConfigs}
            playAngle={playAngle}
            handleManualAngleChange={handleManualAngleChange}
            handleStageXChange={handleStageXChange}
            handleStageYChange={handleStageYChange}
            handleStageZChange={handleStageZChange}
            motorX={motorX}
            motorY={motorY}
            motorZ={motorZ}
            handleCenteringStageXChange={handleCenteringStageXChange}
            handleCenteringStageYChange={handleCenteringStageYChange}
            handleCenteringStageZChange={handleCenteringStageZChange}
            cameraX={cameraX}
            setCameraX={setCameraX}
            buttonStyle={buttonStyle}
            sectionStyle={sectionStyle}
            labelStyle={labelStyle}
            sliderStyle={sliderStyle}
            controlLayout={controlLayout}
            handleSampleMeshChange={handleSampleMeshChange}
            />

          <div style={sectionStyle}>
            <h3>Visibility</h3>
            {configs.map((cfg) => (
              <div key={cfg.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={cfg.visible !== false}
                    onChange={() => handleToggleVisibility(cfg.id)}
                  />
                  {cfg.type.toUpperCase()} ({cfg.id})
                </label>
              </div>
            ))}
          </div>

          {controlLayout.common?.camera && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
