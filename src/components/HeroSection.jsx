import React, { useState, useEffect, useRef } from 'react';
import '../css/HeroSection.css'; // Import the CSS file
import { Link } from 'react-router-dom';

function HeroSection() {
  const [animatedWord, setAnimatedWord] = useState('Knowing');
  const words = ['Knowing', 'Streamlining', 'Saving', 'Improving'];
  const wordIndex = useRef(0);
  const isDeleting = useRef(false);
  const logoParallaxRef = useRef(null);

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

  // Lightweight parallax for the logo (mobile-friendly)
  useEffect(() => {
    const element = logoParallaxRef.current;
    if (!element) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY, 200);
        const translate = offset * 0.05; // gentle parallax
        element.style.transform = `translateY(${translate}px)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="heroSection">
      <div className="container">
        {/* LEFT SIDE: Text */}
        <div className="flex-1 text-center lg:text-left text-container">
          <h1>
            <span>Stop Guessing</span>
            <span className="start-line">
              <span className="purple-text">Start</span>
              <span className="purple-text animated-text">{animatedWord}</span>
            </span>
          </h1>
          <p>
            Real-time occupancy and equipment insights to optimize resources
          </p>
          {/* Move logo above CTAs on mobile */}
          <div className="hero-logo-inline">
            <img
              src="/Copy of Logo Draft 7.5-3.png"
              alt="OnSight Logo"
              ref={logoParallaxRef}
            />
          </div>
          <div className="buttons">
            <Link to="/waitlist">Join Waitlist</Link>
            <Link to="/features">Learn More</Link>
          </div>
        </div>
        {/* RIGHT SIDE: OnSight Logo (desktop only) */}
        <div className="relative logo-container" aria-hidden="true">
          <div></div>
          <img src="/Copy of Logo Draft 7.5-3.png" alt="" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;