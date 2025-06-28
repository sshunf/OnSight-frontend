import React from 'react';
import '../css/Footer.css'; // Import the CSS file
import { FaYoutube, FaXTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa6';

function Footer() {
  return (
    <footer className="footer bg-black text-white pt-16 pb-8">
      <div className="footer-container max-w-7xl mx-auto px-6">
        {/* Border line moved above columns */}
        <div className="footer-border border-t border-gray-800 pt-8 mb-8"></div>
        <div className="footer-grid grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Social Media Icons */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-left">Connect</h3>
            {/* Force horizontal row with Tailwind and inline style as fallback */}
            <div
              className="flex flex-row space-x-4 mb-6 justify-start items-center"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
            >
              <a href="#" className="text-gray-400 hover:text-white" aria-label="YouTube">
                <FaYoutube size={26} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="X / Twitter">
                <FaXTwitter size={26} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <FaFacebookF size={26} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <FaInstagram size={26} />
              </a>
            </div>
          </div>
          {/* Explore Links */}
          <div className="md:col-span-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-left">Explore</h3>
            <ul className="space-y-2 pl-0 ml-0 list-none">
              <li><a href="/features" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="/foundersNote" className="text-gray-400 hover:text-white">Founders' Note</a></li>
              <li><a href="/waitlist" className="text-gray-400 hover:text-white">Join Waitlist</a></li>
              <li><a href="/login" className="text-gray-400 hover:text-white">Login</a></li>
            </ul>
          </div>
          {/* Resources */}
          <div className="md:col-span-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-left">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Case Studies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>
          {/* Contact */}
          <div className="md:col-span-1 flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-left">Contact</h3>
            <p className="text-gray-400 mb-2">
              <a href="mailto:info@onsight-tech.com" className="hover:text-white">info@onsight-tech.com</a>
            </p>
            <p className="text-gray-400 mb-2">
              <a href="mailto:support@onsight-tech.com" className="hover:text-white">support@onsight-tech.com</a>
            </p>
            <p className="text-gray-400">Northwestern University<br/>Evanston, IL</p>
          </div>
        </div>
        {/* Bottom copyright section - border removed from here */}
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