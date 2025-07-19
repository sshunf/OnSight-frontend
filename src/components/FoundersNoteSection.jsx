import React from 'react';
import '../css/FoundersNote.css';

function FoundersNoteSection() {
  return (
    <>
      {/* Title Heading - Founders' Note */}
      <div className="title-container pt-32 mb-12 text-center">
        <h1 className="text-6xl font-bold page-title">Founders' Note</h1>
      </div>
      
      {/* FOUNDERS NOTE SECTION */}
      <section className="px-6 relative z-10 text-center">
        <div className="mx-auto max-w-xl text-center">
          <p className="centered-text text-lg leading-relaxed mb-6">
            We began with a simple frustration: constantly arriving at a gym only to find it packed and machines unavailable. Determined to solve this all-too-common problem, we researched existing solutions and discovered a noticeable lack of real-time occupancy data for fitness facilities.
          </p>
          <p className="centered-text text-lg leading-relaxed mb-20">
            We built OnSight to empower recreation centers by providing accurate insights on both occupancy and machine usage, enabling optimized resources, smoother operations, and more satisfied members. By leveraging on-the-ground feedback from gym managers, staff, and countless gym-goers, we refined our sensors and analytics to optimize resources, reduce overhead, and ultimately enhance the member experience. Our goal is to ensure gyms run at peak efficiency—no wasted space, no unexpected crowds, and no guesswork required.
          </p>
        </div>
      </section>

      {/* OUR TEAM SECTION */}
      <section className="px-6 relative z-10">
        <div className="our-team-text">
          <h2 className="text-6xl font-bold text-white mb-16 text-center w-full">Our Team</h2>
        </div>
        <div className="team-container">
          {/* Angel */}
          <div className="team-member">
            <div id="angel-image" className="team-image-container">
              <img src="/angel.jpg" alt="Angel Mendoza" className="team-image" aria-hidden="true" />
            </div>
            <h3 className="text-4xl font-bold mb-2">Angel Mendoza</h3>
            <div className="signature-container mb-2">
              <img src="/../angel_signature.jpg" alt="Angel Mendoza Signature" className="signature-image" />
            </div>
            <p className="text-xl font-medium mb-2">Co-Founder and CEO</p>
            <p className="text-gray-400 mb-4">Incoming at Chamberlain Group</p>
            <p className="bio-text">
              Angel is a third year at Northwestern University pursuing his B.S and M.S in mechanical engineering.  
              <span>&nbsp;</span>
              <a href="mailto:angelm.mendoza07@gmail.com" className="contact-link">Contact</a>.
            </p>
          </div>
          
          {/* Matt */}
          <div className="team-member">
            <div id="matt-image" className="team-image-container">
              <img src="/matt.jpg" alt="Matt Martinez" className="team-image" aria-hidden="true" />
            </div>
            <h3 className="text-4xl font-bold mb-2">Matt Martinez</h3>
            <div className="signature-container mb-2">
              <img src="/../matt_signature.jpg" alt="Matt Martinez Signature" className="signature-image" />
            </div>
            <p className="text-xl font-medium mb-2">Co-Founder and COO</p>
            <p className="text-gray-400 mb-4">Incoming at Nissan</p>
            <p className="bio-text">
              Matt is a third year at Northwestern University pursuing his B.S and M.S in mechanical engineering. 
              <span>&nbsp;</span> 
              <a href="mailto:mattvmz03@gmail.com" className="contact-link">Contact</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default FoundersNoteSection;