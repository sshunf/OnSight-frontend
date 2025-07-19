import React from 'react';

function GaragePage() {
  return (
    <div className="pt-24 px-6 py-12 relative z-10">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-5xl font-bold mb-4">Our Story</h2>
        <h3 className="text-3xl text-purple-400 mb-8">The Garage at Northwestern</h3>
        
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          OnSight was born and created at The Garage, Northwestern's premiere entrepreneurialship hub for students.
        </p>

        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <iframe
            src="https://maps.google.com/maps?q=The%20Garage%20at%20Northwestern%20University&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="The Garage at Northwestern University"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default GaragePage; 