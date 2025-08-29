import React, { useEffect } from 'react';
import '../css/AsteriskBackground.css';

function AsteriskBackground() {
  useEffect(() => {
    const createAsterisks = () => {
      const container = document.createElement('div');
      container.className = 'asterisk-bg';
      
      // Calculate number of asterisks based on window size
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      // Slightly reduce density (about 15%) to make the scene less busy
      const numAsterisks = Math.floor(((windowWidth * windowHeight) / 5000) * 0.85);
      
      // Create asterisks
      for (let i = 0; i < numAsterisks; i++) {
        const asterisk = document.createElement('div');
        asterisk.className = 'asterisk';
        asterisk.textContent = '*';
        
        // Random position
        asterisk.style.left = `${Math.random() * 100}%`;
        asterisk.style.top = `${Math.random() * 100}%`;
        
        // Random size between 16px and 32px
        asterisk.style.fontSize = `${16 + Math.random() * 16}px`;
        
        container.appendChild(asterisk);
      }
      
      // Add to body
      document.body.appendChild(container);
      
      return () => {
        document.body.removeChild(container);
      };
    };

    return createAsterisks();
  }, []);

  return null;
}

export default AsteriskBackground;