import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
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
import Layout from './components/Layout';
import DashboardDemoPage from './pages/DashboardDemo';
import DashboardPage from './pages/Dashboard';


function App() {
  return (
    <Router>
      <AsteriskBackground />
      <Routes>
        {/* Routes that need header and footer */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/features" element={<Layout><FeaturesPage /></Layout>} />
        <Route path="/foundersNote" element={<Layout><FoundersNotePage /></Layout>} />
        <Route path="/dashboard-demo" element={<Layout><DashboardDemoPage /></Layout>} />
        <Route path="/waitlist" element={<Layout><WaitlistPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginScreen /></Layout>} />
        
        {/* Routes without header and footer */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;