import React, {useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import '../css/GymSelectScreen.css';

const backendURL = import.meta.env.VITE_BACKEND_URL;

function GymSelectScreen() {
  // const [activeScreen, setActiveScreen] = useState('gym-select');
  // const [gyms, setGyms] = useState([]);
  // const [selectedGym, setSelectedGym] = useState(null);
  const [code, setCode] = useState('');
  const[password, setPassword] = useState('');
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail')

//   useEffect(() => {
//     const fetchGyms = async () => {
//       const res = await fetch(`${backendURL}/collect-gyms`);
//       const data = await res.json();
//       setGyms(data);
//     } catch (err) {
//         console.error('Failed to fetch')
//     };
//     fetchGyms();
//   }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendURL}/auth/verify-gym`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          code
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      localStorage.setItem('gymAffiliated', 'true');
      navigate('/dashboard');
    } catch (err) {
      console.error('Gym verification error:', err);
      alert(`Verification failed: ${err.message}`);
    }
  };

  const handleBack = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('gymAffiliated'); 
        navigate('/login');
    } catch (err) {
        console.error('Failed to sign out:', err);
    }
  }

  return (
    <section className="gym-select-section">
      <div className="asterisk-bg" id="asteriskContainer"></div>
      <div className="content-box">
        <h2>Verify Gym Affiliation</h2>
        <p>Please enter gym verification code:</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="input-field"
          />
          <div className="button-container">
            <button type="submit" className="verify-button">Verify</button>
            <button type="button" className="back-button" onClick={handleBack}>Back</button>
          </div>
        </form>
      </div>
    
    </section>
  );

  return (
    <section className="content-box">
      <h2>Verify Gym Affiliation</h2>
      <form onSubmit={handleSubmit}>
        <label>Select Gym:</label>
        <select value={selectedGym} onChange={(e) => setSelectedGym(e.target.value)}>
          <option value="">-- Choose a gym --</option>
          {gyms.map(gym => (
            <option key={gym._id} value={gym.name}>{gym.name}</option>
          ))}
        </select>

        <label>Enter Verification Code:</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit">Verify</button>
          <button type="button" onClick={handleBack}>Back</button>
        </div>
      </form>
    </section>
  );
}

export default GymSelectScreen;