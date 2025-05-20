import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './css/App.css';
import './css/FoundersNote.css';
import './css/Waitlist.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import FoundersNotePage from './pages/FoundersNotePage';
import WaitlistPage from './pages/WaitlistPage';
import LoginScreen from './components/LoginScreen';
import AsteriskBackground from './components/AsteriskBackground';

function App() {
  return (
    <Router>
      <AsteriskBackground />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/foundersNote" element={<FoundersNotePage />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;