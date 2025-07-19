import React from 'react';

function PlaceholderContent({ title, message }) {
  return (
    <section className="pt-24 px-6 py-12 relative z-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-5xl font-bold mb-8 text-center">{title}</h2>
        
        <div className="text-center py-16">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 max-w-3xl mx-auto">
            <div className="mb-8">
              <svg className="w-16 h-16 text-purple-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-3xl font-bold text-white mb-6">Pilot Phase</h3>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {message}
            </p>
            
            <div className="space-y-6">
              <p className="text-lg text-gray-400">
                Feel free to contact us at{' '}
                <a href="mailto:info@onsight-tech.com" className="text-purple-400 hover:text-purple-300 underline">
                  info@onsight-tech.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlaceholderContent; 