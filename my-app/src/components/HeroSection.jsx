import React from 'react';

function HeroSection() {
  return (
    <section id="heroSection" className="pt-16 relative px-6 lg:px-8 py-24 lg:py-32 overflow-hidden bg-black text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight" style={{ lineHeight: 1.3 }}>
              <span className="block bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                Stop Guessing.
              </span>
              <span className="block bg-gradient-to-r from-purple-400 to-purple-400 bg-clip-text text-transparent mb-[-4px]">
                Start Knowing.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto lg:mx-0">
              Onsight provides gyms with real-time occupancy and equipment usage data to optimize resources, cut costs, and enhance member experiences.
            </p>
            <div className="mt-10 flex gap-6 justify-center lg:justify-start">
              <a
                href="#waitlistSection"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium bg-white text-black rounded hover:bg-gray-200"
              >
                Join Waitlist
              </a>
              <a
                href="#featuresSection"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium border border-white text-white rounded hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 rounded-2xl"></div>
            <img
              src="Logo Draft11.PNG"
              alt="OnSight Logo"
              className="rounded-2xl shadow-2xl relative z-10 aspect-[4/3] object-contain w-full bg-white/5 p-6"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;