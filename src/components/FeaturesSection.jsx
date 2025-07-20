import React, { useState, useRef, useEffect } from 'react';

function FeaturesSection() {
  const videoRef = useRef(null);
  const [isOccupancyHighlighted, setIsOccupancyHighlighted] = useState(false);
  const [isMachineUsageHighlighted, setIsMachineUsageHighlighted] = useState(false);
  const [isLivePerformanceHighlighted, setIsLivePerformanceHighlighted] = useState(false);
  const [isAIInsightsHighlighted, setIsAIInsightsHighlighted] = useState(false);


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      setIsOccupancyHighlighted(currentTime >= 10 && currentTime <= 14.9);
      setIsMachineUsageHighlighted(currentTime >= 15 && currentTime <= 21.9);
      setIsLivePerformanceHighlighted(currentTime >= 22 && currentTime <= 30.9);
      setIsAIInsightsHighlighted(currentTime >= 31 && currentTime <= 58);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const features = [
    {
      title: 'Real-Time Occupancy',
      description: 'Track door entries/exits for live occupancy data.',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
    {
      title: 'Machine Usage',
      description: 'Monitor equipment usage patterns and track usage time.',
      iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      title: 'Live Performance',
      description: 'Receive real-time updates & act quickly.',
      iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      title: 'AI-Powered Insights',
      description: 'Comprehensive dashboards to spot usage patterns, optimize scheduling, and deliver data-driven recommendations.',
      iconPath: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
  ];

  return (
    <section id="featuresSection" className="relative py-24 px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Empowering Gyms with Smart Insights
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Our sensor solutions provide the data you need to optimize your facility.
          </p>
        </div>
        <div className="mb-12">
          <video
            ref={videoRef}
            className="w-full max-w-6xl mx-auto rounded-lg" 
            src="/DemoVideoNew1.mp4" 
            autoPlay 
            muted 
            playsInline
            controls
          />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-gray-900/80 border border-gray-700 rounded-lg p-6 backdrop-blur-lg transition-all duration-300 ${
                (index === 0 && isOccupancyHighlighted) || (index === 1 && isMachineUsageHighlighted) || (index === 2 && isLivePerformanceHighlighted) || (index === 3 && isAIInsightsHighlighted)
                  ? 'shadow-lg shadow-purple-400/50 border-purple-400 scale-105'
                  : ''
              }`}
            >
              <svg className="h-12 w-12 mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.iconPath} />
              </svg>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;