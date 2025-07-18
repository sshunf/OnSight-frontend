import React from 'react';
import { FaYoutube, FaXTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="text-white pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Border line moved above columns */}
        <div className="border-t border-gray-800 pt-8 mb-8"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {/* Column 1: Connect */}
          <div className="space-y-4">
            <div className="font-semibold text-white">Connect</div>
            <div className="flex space-x-4">
              <a href="https://www.youtube.com/@onsighttechnu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><FaYoutube size={24} /></a>
              <a href="https://x.com/onsighttechnu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><FaXTwitter size={24} /></a>
              <a href="https://www.facebook.com/onsighttechnu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><FaFacebookF size={24} /></a>
              <a href="https://www.instagram.com/onsighttechnu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><FaInstagram size={24} /></a>
            </div>
            <div className="pt-2">
              <img src="/image.png" alt="Inception" className="w-36" />
            </div>
            <div className="pt-2">
              <img src="/MicrosoftStartups.png" alt="Microsoft for Startups" className="w-36" />
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-4">
            <div className="font-semibold text-white">Explore</div>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
              <li><Link to="/foundersNote" className="text-gray-400 hover:text-white">Founders' Note</Link></li>
              <li><Link to="/waitlist" className="text-gray-400 hover:text-white">Join Waitlist</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-4">
            <div className="font-semibold text-white">Resources</div>
            <ul className="space-y-2">
              <li><Link to="/documentation" className="text-gray-400 hover:text-white">Documentation</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link to="/case-studies" className="text-gray-400 hover:text-white">Case Studies</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <div className="font-semibold text-white">Contact</div>
            <div className="text-gray-400 space-y-2">
              <p><a href="mailto:info@onsight-tech.com" className="hover:text-white">info@onsight-tech.com</a></p>
              <p><a href="mailto:support@onsight-tech.com" className="hover:text-white">support@onsight-tech.com</a></p>
              <p>
                <Link to="/garage" className="hover:text-white">
                  Northwestern University<br />
                  Evanston, IL
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="text-center text-gray-400 text-sm pt-8">
            &copy; 2025 OnSight. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;