import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './AppWS';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
