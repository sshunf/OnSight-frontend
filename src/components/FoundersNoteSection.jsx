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
            We’ve all been there: you show up ready to lift and the cable machine’s “out of order,” the treadmill’s squealing, or the rower just feels… off. Then it takes forever to get a tech out, and everyone’s guessing which machines actually need attention. OnSight is our fix. We track how each machine is really used, flag unusual patterns early, and suggest a simple, usage-based maintenance schedule—so staff can get ahead of issues instead of chasing breakdowns. We’ll also call out likely failures, help you decide what to repair vs. replace, and make your next buying cycle smarter. Fewer surprises. Longer equipment life. Lower repair bills. Happier members. Maintenance, but finally organized.
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