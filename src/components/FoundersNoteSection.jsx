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
            We've been lifting for years, and no matter where we trained we kept running into the same frustrations: overcrowded floors, long wait lines for the few machines everyone actually uses, awkward layouts where half the equipment sits untouched, and broken machines that stay broken. When we started talking to gym owners and managers, we realized they share the same pain as they're expected to make expensive decisions about purchasing, layout, and maintenance with almost no real visibility into what's happening on their floor. One manager said it best: "If only there was a way to measure everything going on my floor so I knew what to do." That's why we built OnSight. To give gyms the usage data they've never had, so they can run a better facility and deliver a better experience for members.
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
            {/* {<p className="text-gray-400 mb-4">Chamberlain Group</p>} */}
            <p className="bio-text">
              Angel is a fourth year at Northwestern University pursuing his B.S and M.S in mechanical engineering.  
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
            {/* {<p className="text-gray-400 mb-4">Nissan</p>} */}
            <p className="bio-text">
              Matt is a fourth year at Northwestern University pursuing his B.S and M.S in mechanical engineering. 
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