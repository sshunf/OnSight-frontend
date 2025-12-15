import React, { useEffect, useState } from 'react';
import { FaYoutube, FaXTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

function Footer() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSocialClick = (platformLabel) => {
    setToastMessage('Our social profiles are coming soon');
    setShowToast(true);
  };

  useEffect(() => {
    if (!showToast) return;
    const timeoutId = setTimeout(() => setShowToast(false), 2200);
    return () => clearTimeout(timeoutId);
  }, [showToast]);

  return (
    <footer className="text-white pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Border line moved above columns */}
        <div className="border-t border-gray-800 pt-8 mb-8"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-16">
          {/* Column 1: Connect */}
          <div className="space-y-4 odd:px-4 md:odd:px-0">
            <div className="font-semibold text-white">Connect</div>
            <div className="flex space-x-4">
              <button
                type="button"
                aria-disabled="true"
                title="Coming soon"
                onClick={() => handleSocialClick('YouTube')}
                className="text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
              >
                <FaYoutube size={24} />
              </button>
              <button
                type="button"
                aria-disabled="true"
                title="Coming soon"
                onClick={() => handleSocialClick('X / Twitter')}
                className="text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
              >
                <FaXTwitter size={24} />
              </button>
              <button
                type="button"
                aria-disabled="true"
                title="Coming soon"
                onClick={() => handleSocialClick('Facebook')}
                className="text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
              >
                <FaFacebookF size={24} />
              </button>
              <button
                type="button"
                aria-disabled="true"
                title="Coming soon"
                onClick={() => handleSocialClick('Instagram')}
                className="text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
              >
                <FaInstagram size={24} />
              </button>
            </div>
            <div>
              <img src="/MicrosoftStartups_border_widthBased.png" alt="Microsoft for Startups" className="w-36" />
            </div>
            <div>
              <img src="/inception.png" alt="Inception at the Garage" className="w-36" />
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-4 odd:px-4 md:odd:px-0">
            <div className="font-semibold text-white">Explore</div>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
              <li><Link to="/foundersNote" className="text-gray-400 hover:text-white">Founders' Note</Link></li>
              <li><Link to="/waitlist" className="text-gray-400 hover:text-white">Join Waitlist</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-4 odd:px-4 md:odd:px-0">
            <div className="font-semibold text-white">Resources</div>
            <ul className="space-y-2">
              <li><Link to="/documentation" className="text-gray-400 hover:text-white">Documentation</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link to="/case-studies" className="text-gray-400 hover:text-white">Case Studies</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4 odd:px-4 md:odd:px-0">
            <div className="font-semibold text-white">Contact</div>
            <div className="text-gray-400 space-y-2">
              <p><a href="mailto:accounts@onsight-tech.com" className="hover:text-white">accounts@onsight-tech.com</a></p>
              <p>
                <Link to="/garage" className="hover:text-white">
                  Northwestern University<br />
                  Evanston, IL
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © 2025 OnSight LLC. All rights reserved.
        </div>
      </div>
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-md shadow-lg border border-white/20"
        >
          {toastMessage}
        </div>
      )}
    </footer>
  );
}

export default Footer;
