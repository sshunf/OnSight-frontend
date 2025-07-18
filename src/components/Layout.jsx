import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AsteriskBackground from './AsteriskBackground';

const Layout = ({ children }) => {
  const location = useLocation();

  const showBackground = location.pathname !== '/features';

  return (
    <div className="relative min-h-screen flex flex-col">
      {showBackground && <AsteriskBackground />}
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;