import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginScreen.css';

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');
function LoginScreen() {
  const [activeScreen, setActiveScreen] = useState('login');
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  const checkCredentials = async (e) => {
    e.preventDefault();
    // Call backend to check credentials and get user
    console.log('email:', email);
    console.log('password:', password);
    // const displayName = email.split('@')[0];
    const displayName = email;
    try {
      const res = await fetch(`${backendURL}/auth/login-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || 'Login failed');
        return;
      }
      const user = result.user;
      // Save user info to localStorage
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('loginTimestamp', Date.now().toString());
      localStorage.setItem('gymAffiliated', user.gymAffiliated ? 'true' : 'false');
      localStorage.setItem('gymId', user.gym?.gymId || '');
      localStorage.setItem('gymName', user.gym?.name || '');
      localStorage.setItem('displayName', displayName);
      setUser(user);
      if (user.gymAffiliated) {
        navigate('/dashboard');
      } else {
        navigate('/gym-select');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong, try again');
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setActiveScreen('login');
    // Clear localStorage
    localStorage.removeItem('lastActiveScreen');
    localStorage.removeItem('gymAffiliated');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('gymId');
    localStorage.removeItem('gymName');
  };

  return (
    <section className="login-section">
      <div className="asterisk-bg" id="asteriskContainer"></div>

      {activeScreen === 'login' && (
        <div className="content-box">
          <h2>Login</h2>
          <p>Please enter your username and password:</p>
            <input 
              type="text" 
              name="username"
              placeholder="Username" 
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="input-field"
            />
            <button type="button" className="login-button" onClick={checkCredentials}>
              Login
            </button>
        </div>
      )}

      {/* Occupancy Screen */}
      {activeScreen === 'occupancy' && (
        <div className="content-box">
          <h2>The Residency of The Garage Live Count</h2>
          <p className="count">0</p>
          <button className="logout-button" onClick={handleLogout}>
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
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </section>
  );
}

export default LoginScreen;