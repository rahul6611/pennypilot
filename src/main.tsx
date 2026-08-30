import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { setupServiceWorker } from './pwa/registerServiceWorker';
import './index.css';

// Initialize PWA service worker
setupServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
