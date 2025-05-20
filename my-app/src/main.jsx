import React from 'react';
import { createRoot } from 'react-dom/client'
import './css/index.css'; // Import Tailwind CSS directives
import App from './App'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)