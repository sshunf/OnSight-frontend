import React from 'react';
import LoginScreen from '../components/LoginScreen';
// import AsteriskBackground from '../components/AsteriskBackground';
import NightBackground from '../components/NightBackground';

function Login() {
  return (
    <div className="login-page min-h-screen bg-black">
      {/* <AsteriskBackground /> */}
      <NightBackground />
      <LoginScreen />
    </div>
  );
}

export default Login;