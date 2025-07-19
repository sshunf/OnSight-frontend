import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../css/LoginScreen.css';

const backendURL = import.meta.env.VITE_BACKEND_URL;
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
      if (currentUser) {
        // const gymAffiliated = localStorage.getItem('gymAffiliated') === 'true';
        setUser(currentUser);
        // if (gymAffiliated) navigate('/dashboard');
        // Redirect to main dashboard if user is authenticated
        // else navigate('/gym-select');
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
        alert(error.error || 'Login failed');
        return;
      }
      console.log(`email: ${result.user.email}`);
      setUser(result.user); // this can be a local user object
      localStorage.setItem('userEmail', result.user.email);
      navigate('/gym-select'); // redirect to verification step
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong, try again');
    }
    
    // if (validAccounts[user] && validAccounts[user] === pass) {
    //   if (user === "TheGarage") {
    //     setActiveScreen('occupancy');
    //     fetchOccupancy();
    //   } else if (user === "SPAC") {
    //     setActiveScreen('motion');
    //     fetchMotionAndForce();
    //   }
    // } else {
    //   alert("Incorrect username or password!");
    // }
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

      console.log(`Google user: ${user}`);
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
      const data = await res.json();
      if (!res.ok) {
        console.error('Signup failed:', data.error || data);
        alert('Signup failed: ' + (data.error || 'Unknown error'));
        return;
      }
      setUser(user);
      localStorage.setItem('userEmail', user.email);
      console.log('Stored userEmail:', user.email);
      const gymAffiliated = localStorage.getItem('gymAffiliated') === 'true';
      if (gymAffiliated) {
        navigate('/dashboard');
      } else {
        navigate('/gym-select');
      }
    }
    catch (backendError) {
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

          <input
            type="password"
            placeholder="Enter your google password (optional)"
            value={googlePassword}
            onChange={(e) => setGooglePassword(e.target.value)}
            className="input-field"
          />
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