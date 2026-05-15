//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './app/index.css';
import App from './app/App';

/* createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
) */

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
);
