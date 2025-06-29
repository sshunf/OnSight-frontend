import React from 'react';
import '../css/Footer.css'; // Import the CSS file
import { FaYoutube, FaXTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa6';

function Footer() {
  return (
    <footer className="footer bg-black text-white pt-16 pb-8 relative z-10">
      <div className="footer-container max-w-7xl mx-auto px-6">
        {/* Border line */}
        <div className="footer-border border-t border-gray-800 pt-8 mb-8"></div>
        
        {/* Main footer content grid */}
        <div className="footer-grid mb-16">
          
          {/* Connect Section - Social Media Icons */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white" aria-label="YouTube">
                <FaYoutube className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="X / Twitter">
                <FaXTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <FaFacebookF className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Explore Section */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><a href="/features" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="/foundersNote" className="text-gray-400 hover:text-white">Founders' Note</a></li>
              <li><a href="/waitlist" className="text-gray-400 hover:text-white">Join Waitlist</a></li>
              <li><a href="/login" className="text-gray-400 hover:text-white">Login</a></li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/documentation" className="text-gray-400 hover:text-white">Documentation</a></li>
              <li><a href="/faq" className="text-gray-400 hover:text-white">FAQ</a></li>
              <li><a href="/case-studies" className="text-gray-400 hover:text-white">Case Studies</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 mb-2">
              <a href="mailto:info@onsight-tech.com" className="hover:text-white">info@onsight-tech.com</a>
            </p>
            <p className="text-gray-400 mb-2">
              <a href="mailto:support@onsight-tech.com" className="hover:text-white">support@onsight-tech.com</a>
            </p>
            <p className="text-gray-400">Northwestern University<br />Evanston, IL</p>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="pt-8">
          <p className="text-gray-400 text-sm text-center">
            &copy; 2025 OnSight. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;