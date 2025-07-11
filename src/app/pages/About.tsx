import React from 'react';
// import './App.css';
import SynopticView from 'src/components/BeamVisSynoptic';
import BeamlineContainer from '@/components/BeamVis/components/BeamlineContainer';
import { nodes, edges } from 'src/components/BeamVis/Synoptic_Config';
import {Legend} from 'src/components/BeamVis/Legend'

const App: React.FC = () => (
  <>
    <div className='main-container'>
      <div className='synoptic-panel'>
        <header className='main-header'>
          <h1>BL5.3.1</h1>
        </header>
        <Legend/>
        <SynopticView nodes={nodes} edges={edges} />
      </div>
      <div className='beamvis-panel'>
          <div className='beamvis-container'>
              <h2>BeamVis 3D</h2>
              <BeamlineContainer/>
          </div>
      </div>
    </div>
  </>
);

export default App;
