import React from 'react';
import LoginScreen from '../components/LoginScreen';
import AsteriskBackground from '../components/AsteriskBackground';

function Login() {
  return (
    <div className="login-page min-h-screen bg-black">
      <AsteriskBackground />
      <LoginScreen />
    </div>
  );
}

export default Login;