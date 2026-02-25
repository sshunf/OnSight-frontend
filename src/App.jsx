import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './css/App.css';
import './css/FoundersNote.css';
import './css/Waitlist.css';
import HomePage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';
import FoundersNotePage from './pages/FoundersNotePage';
import WaitlistPage from './pages/WaitlistPage';
import LoginScreen from './components/LoginScreen';
import GymSelectScreen from './components/GymSelectScreen';
import NightBackground from './components/NightBackground';
import Layout from './components/Layout';
import DashboardDemoPage from './pages/DashboardDemo';
import DashboardPage from './pages/Dashboard';
import ChatBotPage from './pages/ChatBotPage';
import GaragePage from './pages/GaragePage';
import AnalyticsPage from './pages/AnalyticsPage';
import TempDashboardPage from './pages/TempDashboardPage';
import SchedulePage from './pages/SchedulePage';
import RoiCalculatorPage from './pages/RoiCalculatorPage';
import StatsShowcasePage from './pages/StatsShowcasePage';


function App() {
  return (
    <>
      <ScrollToTop />
      <NightBackground />
      <Routes>
        {/* Routes that need header and footer */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/foundersNote" element={<Layout><FoundersNotePage /></Layout>} />
        <Route path="/dashboard-demo" element={<Layout><DashboardDemoPage /></Layout>} />
        <Route path="/waitlist" element={<Layout><WaitlistPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginScreen /></Layout>} />
        <Route path="/garage" element={<Layout><GaragePage /></Layout>} />
        <Route path="/gym-select" element={<Layout><GymSelectScreen /></Layout>} />
        <Route path="/roi" element={<Layout><StatsShowcasePage /></Layout>} />
        <Route path="/roi-calculator" element={<Layout><RoiCalculatorPage /></Layout>} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        
        {/* Routes without header and footer */}
        <Route path="/dashboard" element={<TempDashboardPage />} />
        <Route path="/dashboard-old" element={<DashboardPage />} />
        <Route path="/chatbot" element={<ChatBotPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </>
  );
}

export default App;
