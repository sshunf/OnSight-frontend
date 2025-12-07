import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './css/App.css';
import './css/FoundersNote.css';
import './css/Waitlist.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';
import FeaturesPage from './pages/FeaturesPage';
import FoundersNotePage from './pages/FoundersNotePage';
import WaitlistPage from './pages/WaitlistPage';
import LoginScreen from './components/LoginScreen';
import GymSelectScreen from './components/GymSelectScreen';
import NightBackground from './components/NightBackground';
import Layout from './components/Layout';
import DashboardDemoPage from './pages/DashboardDemo';
import DashboardPage from './pages/Dashboard';
import ChatBotPage from './pages/ChatBotPage';
import DocumentationPage from './pages/DocumentationPage';
import FAQPage from './pages/FAQPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import BlogPage from './pages/BlogPage';
import GaragePage from './pages/GaragePage';
import AnalyticsPage from './pages/AnalyticsPage';
import TempDashboardPage from './pages/TempDashboardPage';


function App() {
  return (
    <>
      <ScrollToTop />
      <NightBackground />
      <Routes>
        {/* Routes that need header and footer */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/features" element={<Layout><FeaturesPage /></Layout>} />
        <Route path="/foundersNote" element={<Layout><FoundersNotePage /></Layout>} />
        <Route path="/dashboard-demo" element={<Layout><DashboardDemoPage /></Layout>} />
        <Route path="/waitlist" element={<Layout><WaitlistPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginScreen /></Layout>} />
        <Route path="/documentation" element={<Layout><DocumentationPage /></Layout>} />
        <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
        <Route path="/case-studies" element={<Layout><CaseStudiesPage /></Layout>} />
        <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
        <Route path="/garage" element={<Layout><GaragePage /></Layout>} />
        <Route path="/gym-select" element={<Layout><GymSelectScreen /></Layout>} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        
        {/* Routes without header and footer */}
        <Route path="/dashboard" element={<TempDashboardPage />} />
        <Route path="/dashboard-old" element={<DashboardPage />} />
        <Route path="/chatbot" element={<ChatBotPage />} />
      </Routes>
    </>
  );
}

export default App;
