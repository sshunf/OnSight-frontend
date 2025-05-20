import React, { useState } from 'react';
import '../css/LoginScreen.css';

function LoginScreen() {
  const [activeScreen, setActiveScreen] = useState('login');
  
  // Valid accounts for demo
  const validAccounts = {
    "TheGarage": "resident",
    "SPAC": "recreation"
  };

  const checkCredentials = (e) => {
    e.preventDefault();
    const user = e.target.username.value;
    const pass = e.target.password.value;
    
    if (validAccounts[user] && validAccounts[user] === pass) {
      if (user === "TheGarage") {
        setActiveScreen('occupancy');
        fetchOccupancy();
      } else if (user === "SPAC") {
        setActiveScreen('motion');
        fetchMotionAndForce();
      }
    } else {
      alert("Incorrect username or password!");
    }
  };
  
  const logout = () => {
    setActiveScreen('login');
  };

  // Fetch functions (to be implemented with your backend)
  const fetchOccupancy = async () => {
    try {
      const res = await fetch('/dataOccupancy', { cache: 'no-store' });
      const data = await res.json();
      // Update occupancy data in state
    } catch (err) {
      console.error("Error fetching occupancy:", err);
    }
  };

  const fetchMotionAndForce = async () => {
    try {
      const motionRes = await fetch('/dataMotion', { cache: 'no-store' });
      const motionData = await motionRes.json();
      // Update motion data in state
      
      const forceRes = await fetch('/dataForce', { cache: 'no-store' });
      const forceData = await forceRes.json();
      // Update force data in state
    } catch (err) {
      console.error("Error fetching motion/force data:", err);
    }
  };

  return (
    <section className="login-section">
      <div className="asterisk-bg" id="asteriskContainer"></div>

      {/* Login Screen */}
      {activeScreen === 'login' && (
        <div className="content-box">
          <h2>Login</h2>
          <p>Please enter your username and password:</p>
          <form onSubmit={checkCredentials}>
            <input 
              type="text" 
              name="username"
              placeholder="Username" 
              className="input-field"
            />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              className="input-field"
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      )}

      {/* Occupancy Screen */}
      {activeScreen === 'occupancy' && (
        <div className="content-box">
          <h2>The Residency of The Garage Live Count</h2>
          <p className="count">0</p>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      )}

      {/* Motion Screen */}
      {activeScreen === 'motion' && (
        <div className="content-box">
          <h2>SPAC Machine Usage</h2>
          <p>Total Motion Time: <span>0</span></p>
          <p>Force Time: <span>0</span></p>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </section>
  );
}

export default LoginScreen;