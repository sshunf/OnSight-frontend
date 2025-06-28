import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router';
import '../css/LoginScreen.css';

function LoginScreen() {
  const [activeScreen, setActiveScreen] = useState('login');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  
  // Valid accounts for demo
  const validAccounts = {
    "TheGarage": "resident",
    "SPAC": "recreation"
  };

  useEffect(() => {
    // Check authentication state on component mount
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Redirect to main dashboard if user is authenticated
        navigate('/dashboard');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

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

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      try {
        const response = await fetch('http://localhost:3000/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Backend server error');
        }
      } catch (backendError) {
        console.warn('Backend connection failed:', backendError);
      }

      setUser(user);
      // Redirect to dashboard after successful login
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      alert('Failed to sign in with Google. Please try again.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveScreen('login');
      // Clear localStorage
      localStorage.removeItem('lastActiveScreen');
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

  if (user) {
    return null;
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
              placeholder="Password" 
              className="input-field"
            />
            <button type="submit" className="login-button">
              Login
            </button>
            
            <div className="divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              className="google-login-button"
              onClick={handleGoogleSignIn}
            >
              <img src="/google-icon.svg" alt="Google" className="google-icon" />
              Sign in with Google
            </button>
          </form>
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
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </section>
  );
}

export default LoginScreen;