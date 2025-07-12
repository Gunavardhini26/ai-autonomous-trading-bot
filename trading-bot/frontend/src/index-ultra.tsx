import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import UltraFastApp from './App-ultra';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Ultra-fast rendering without StrictMode for performance
root.render(<UltraFastApp />);
