import { createRoot } from 'react-dom/client'
import './index.css'
import { PlayProvider } from './PlayContext'
import App from './App'
import { PVWSProvider } from './EPICS/PVWSProvider'
import { OphydProvider } from './EPICS/OphydProvider'

const BACKEND = (import.meta.env.VITE_EPICS_BACKEND || 'pvws').toLowerCase();
const EpicsProvider = BACKEND === 'ophyd' ? OphydProvider : PVWSProvider;

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <EpicsProvider>
      <PlayProvider>
        <App />
      </PlayProvider>
    </EpicsProvider>
  // </StrictMode>
)
