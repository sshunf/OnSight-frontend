import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../css/LoginScreen.css';

const backendURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');
console.log(`touch proof`);
function LoginScreen() {
  const [activeScreen, setActiveScreen] = useState('login');
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 
  const [password, setPassword] = useState('');
  const [googlePassword, setGooglePassword] = useState(''); 
  
  // Valid accounts for demo
  // const validAccounts = {
  //   "TheGarage": "resident",
  //   "SPAC": "recreation"
  // };

  useEffect(() => {
    // Check authentication state on component mount
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const timestamp = parseInt(localStorage.getItem('loginTimestamp'), 10);
      const now = Date.now();
      const duration = 6 * 60 * 60 * 1000; // stay signed in for 6 hour duration before being logged out
      if (currentUser) {
        if (!timestamp || now - timestamp > duration){
          console.log("Session expired, logging out.");
          signOut(auth).then(() => {
            localStorage.removeItem('loginTimestamp');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('gymAffiliated');
            navigate('/');
          });
        } else {
          setUser(currentUser);
          const gymAffiliated = localStorage.getItem('gymAffiliated') === true;
          const gymId = localStorage.getItem('gymId');
          if (gymAffiliated && gymId) navigate('/dashboard');
          else navigate('/gym-select');
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  const checkCredentials = async (e) => {
    e.preventDefault();
    const email = e.target.username.value;
    const password = e.target.password.value;
    const displayName = '';

    try {
      const res = await fetch(`${backendURL}/auth/login-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const result = await res.json();
      if (!res.ok){
        alert(result.error || 'Login failed');
        return;
      }
      console.log(`email: ${result.user.email}`);
      setUser(result.user); // this can be a local user object
      localStorage.setItem('userEmail', result.user.email);
      localStorage.setItem('loginTimestamp', Date.now().toString());
      localStorage.setItem('gymAffiliated', result.user.gymAffiliated ? 'true' : 'false');
      localStorage.setItem('gymId', result.user.gym?.gymId || '');
      localStorage.setItem('gymName', result.user.gym?.name || '');
      if (result.user.gymAffiliated) {
        navigate('/dashboard');
      } else {
        navigate('/gym-select');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong, try again');
    }
  };

  const handleGoogleSignIn = async () => {
    console.log(`google test`);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider); 
      const user = result.user;

      console.log(`Google user:`, user);
      const idToken = await user.getIdToken();

      const res = await fetch(`${backendURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          password: googlePassword || null,
        }),
      });

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (jsonErr) {
        console.error('Failed to parse JSON:', jsonErr);
        alert('Signup failed: invalid server response');
        return;
      }

      if (!res.ok) {
        console.error('Signup failed:', data?.error || res.statusText);
        alert('Signup failed: ' + (data?.error || res.statusText));
        return;
      }

      const backendUser = data.user;
      setUser(backendUser);
      localStorage.setItem('userEmail', backendUser.email);
      localStorage.setItem('loginTimestamp', Date.now().toString());
      localStorage.setItem('gymAffiliated', backendUser.gymAffiliated ? 'true' : 'false');
      localStorage.setItem('gymId', backendUser.gym?.gymId || '');
      localStorage.setItem('gymName', backendUser.gym?.name || '');

      if (backendUser.gymAffiliated) {
        navigate('/dashboard');
      } else {
        navigate('/gym-select');
      }
    } catch (backendError) {
      console.error('Google sign-in failed:', backendError);
      alert('Google sign-in failed. See console for details.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveScreen('login');
      // Clear localStorage
      localStorage.removeItem('lastActiveScreen');
      localStorage.removeItem('gymAffiliated');
      localStorage.removeItem('loginTimestamp');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  // Fetch functions (to be implemented with your backend)
    const fetchOccupancy = async () => {
    try {
      const token = user ? await user.getIdToken() : null;
      const res = await fetch('/dataOccupancy', { 
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      // Update occupancy data in state
    } catch (err) {
      console.error("Error fetching occupancy:", err);
    }
  };

  const fetchMotionAndForce = async () => {
    try {
      const token = user ? await user.getIdToken() : null;
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const motionRes = await fetch('/dataMotion', { 
        cache: 'no-store',
        headers 
      });
      const motionData = await motionRes.json();
      
      const forceRes = await fetch('/dataForce', { 
        cache: 'no-store',
        headers 
      });
      const forceData = await forceRes.json();
    } catch (err) {
      console.error("Error fetching motion/force data:", err);
    }
  };

  if (user && activeScreen === 'login') {
    return <p>Redirecting...</p>;
  }

  return (
    <section className="login-section">
      <div className="asterisk-bg" id="asteriskContainer"></div>

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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="input-field"
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <div className="divider">
            <span>or</span>
          </div>


          <button 
            type="button" 
            className="google-login-button"
            onClick={() => { console.log('google button clicked'); handleGoogleSignIn();}}
          >
            <img src="/google-icon.svg" alt="Google" className="google-icon" />
            Sign in with Google
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