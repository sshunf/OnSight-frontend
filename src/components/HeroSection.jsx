import React, { useState, useEffect, useRef } from 'react';
import '../css/HeroSection.css'; // Import the CSS file

function HeroSection() {
  const [animatedWord, setAnimatedWord] = useState('Knowing');
  const words = ['Knowing', 'Streamlining', 'Saving', 'Improving'];
  const wordIndex = useRef(0);
  const isDeleting = useRef(false);

  useEffect(() => {
    // This function handles the logic for typing and deleting
    const type = () => {
      const currentWord = words[wordIndex.current];
      let newText = '';

      if (isDeleting.current) {
        // Deleting characters
        newText = currentWord.substring(0, animatedWord.length - 1);
      } else {
        // Typing characters
        newText = currentWord.substring(0, animatedWord.length + 1);
      }
      setAnimatedWord(newText);
    };

    // Increase speed: lower numbers are faster
    let typeSpeed = isDeleting.current ? 50 : 100;

    // Check if a word is fully typed or deleted
    if (!isDeleting.current && animatedWord === words[wordIndex.current]) {
      // Shorter pause at end of word
      typeSpeed = 1500;
      isDeleting.current = true;
    } else if (isDeleting.current && animatedWord === '') {
      // Move to the next word after deleting
      isDeleting.current = false;
      wordIndex.current = (wordIndex.current + 1) % words.length;
      // Shorter pause before typing new word
      typeSpeed = 300;
    }

    // Set a timeout for the next animation step
    const timeout = setTimeout(type, typeSpeed);

    // Cleanup the timeout when the component unmounts or re-renders
    return () => clearTimeout(timeout);
  }, [animatedWord]); // Re-run the effect whenever animatedWord changes

  return (
    <section id="heroSection">
      <div className="container">
        {/* LEFT SIDE: Text */}
        <div className="flex-1 text-center lg:text-left">
          <h1>
            <span>Stop Guessing.</span>
            <span style={{ display: 'inline-flex' }}>
              <span className="purple-text">Start&nbsp;</span>
              <span className="purple-text animated-text">{animatedWord}</span>
              <span className="purple-text">.</span>
            </span>
          </h1>
          <p>
            Onsight provides gyms with real-time occupancy and equipment usage data to optimize
            resources, cut costs, and enhance member experiences.
          </p>
          <div className="buttons">
            <a href="#waitlistSection">Join Waitlist</a>
            <a href="#featuresSection">Learn More</a>
          </div>
        </div>
        {/* RIGHT SIDE: OnSight Logo */}
        <div className="relative">
          <div></div>
          <img
            src="/logodraft.png"
            alt="OnSight Logo"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;