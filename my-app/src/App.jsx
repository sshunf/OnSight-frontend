// filepath: /Users/Shun/Coding/OnSight-frontend/my-app/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './css/App.css';
import './css/FoundersNote.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import FoundersNotePage from './pages/FoundersNotePage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/foundersNote" element={<FoundersNotePage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;