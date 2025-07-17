// components/ControlPanel/ControlPanel.tsx
import React, { CSSProperties, useState, useEffect } from 'react';
import ControlModules from './ControlModules';
import { ComponentConfig } from '../../types/ComponentConfig';

interface ControlPanelProps {
  onAxisHover: (axis: 'X' | 'Y' | 'Z', dirSign: 1 | -1) => void;
  onAxisUnhover: () => void;
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
  // handleSampleMeshChange: (meshType: 'cube' | 'cylinder' | 'fbx' | 'obj') => void;
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
  // handleSampleMeshChange,
  controlLayout,
  onAxisHover,
  onAxisUnhover
}) => {

  const [jogStep, setJogStep] = useState<{ X: number; Y: number; Z: number; }>({
    X: 0.1, Y: 0.1, Z: 0.1
  });
  const [pos, setPos] = useState({ X: motorX, Y: motorY, Z: motorZ });
  const [targets, setTargets] = useState({ X: 10, Y: 20, Z: 30 });

  useEffect(() => {
    setPos({ X: motorX, Y: motorY, Z: motorZ });
  }, [motorX, motorY, motorZ]);

  const jogAxis = (axis: 'X' | 'Y' | 'Z', delta: number) => {
    setPos(prev => ({ ...prev, [axis]: prev[axis] + delta }));
  };

  const moveAxis = (axis: 'X' | 'Y' | 'Z') => {
    const target = targets[axis];
    setPos(prev => ({ ...prev, [axis]: target }));
  };

  useEffect(() => {
    handleStageXChange(pos.X);
  }, [pos.X]);

  useEffect(() => {
    handleStageYChange(pos.Y);
  }, [pos.Y]);

  useEffect(() => {
    handleStageZChange(pos.Z);
  }, [pos.Z]);

  // Original inline styles
  const outerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: panelOpen ? '100%' : '0px',
    minWidth: panelOpen ? '100%' : '0px',
    maxWidth: panelOpen ? '320px' : '0px',
    overflowY: 'auto',
    borderLeft: panelOpen ? '1px solid #ccc' : 'none',
    backgroundColor: '#C1D3E3',
    transition: 'width 0.3s ease',
    boxShadow: panelOpen ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
    color: '#d3d3d3',
    flexShrink: 0,
    position: 'relative',
  };

  const panelContentStyle: CSSProperties = {
    display: panelOpen ? 'flex' : 'none',
    flexDirection: 'column',
    height: '300px',
    width: '100%',
    padding: panelOpen ? '1.5rem' : '0',
    transition: 'opacity 0.3s ease',
    opacity: panelOpen ? 1 : 0,
    overflowY: 'scroll',
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

  const sectionStyle: CSSProperties = { marginBottom: '1.5rem', color: 'black' };
  const labelStyle: CSSProperties = { marginBottom: '0.5rem', fontWeight: 'bold', color: 'black' };
  const sliderStyle: CSSProperties = { width: '100%' };

  return (
    <div style={outerStyle}>
      {/* <button
        onClick={togglePanel}
        style={{ ...buttonStyle, alignSelf: 'flex-end', backgroundColor: '#dc3545' }}
        onMouseOver={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#c82333')
        }
        onMouseOut={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc3545')
        }
      >
        { panelOpen ? 'Hide Panel' : 'Show Panel'}
      </button> */}
      {panelOpen && (
        <div style={panelContentStyle}> <span style={{ color: 'black' }}>Controls </span>
          <div style={{
            border: '1px solid #007bff',
            borderRadius: 4,
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#000'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 2fr 2fr',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              <div>Position</div><div>Jog</div><div>Set</div>
            </div>

            {(['X','Y','Z'] as const).map(axis => {
              const current = pos[axis]
              const js = jogStep[axis];

              return (
                <div key={axis} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 2fr 2fr',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  {/* Position */}
                  <div>
                    {axis}:&nbsp;
                    <input
                      type="number"
                      value={current.toFixed(2)}
                      readOnly
                      style={{ textAlign: 'center', width: '3rem', marginRight: '0.25rem'}}
                    /> mm
                  </div>

                  {/* Jog */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                    className='w-8 h-8 bg-white'
                    style={{
                    clipPath: 'polygon(0% 50%, 100% 0, 100% 100%)'
                    }}
                    onMouseEnter={() => onAxisHover(axis, -1)}
                    onMouseLeave={onAxisUnhover}
                    onClick={() => jogAxis(axis, -js)}> - </button>
                    <input
                      type="number"
                      step={0.01}
                      value={js}
                      onChange={e =>
                        setJogStep(j => ({ ...j, [axis]: parseFloat(e.target.value)}))
                      }
                      style={{ textAlign: 'center', width: '3rem', margin: '0 0.25rem', backgroundColor: 'white', border: '1px solid black' }}
                    /> mm
                    <button style={{
                    width: '2rem', height: '2rem', clipPath: 'polygon(0 0, 100% 50%, 0 100%', backgroundColor: 'white'
                    }}
                    onMouseEnter={() => onAxisHover(axis, 1)}
                    onMouseLeave={onAxisUnhover}
                    onClick={() => jogAxis(axis, +js)}> + </button>
                  </div>

                  {/* Set */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={targets[axis]}
                      onChange={e =>
                        setTargets(p => ({ ...p, [axis]: parseFloat(e.target.value) }))
                      }
                      style={{ textAlign: 'center', width: '3rem', marginRight: '0.5rem', backgroundColor:'white', border: '1px solid black' }}
                    /> mm
                    <button style={{
                    backgroundColor: 'white', paddingLeft: '5px', paddingRight: '5px'
                    }} onClick={() => moveAxis(axis)}>move</button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* ── END GRID ── */}

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
            // handleSampleMeshChange={handleSampleMeshChange}
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

          {/* {controlLayout.common?.camera && (
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
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
