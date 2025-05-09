import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { scrollToTop } from '../utils/scrollUtils';
import './GoToTopButton.css';

const GoToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check scroll position and update visibility
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px from the top
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    
    // Clean up event listener
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className={`go-to-top-container ${isVisible ? 'visible' : ''}`}>
      <button 
        className="go-to-top-button"
        onClick={scrollToTop}
        aria-label="Go to top"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <ArrowUp size={24} />
        <span className={`tooltip ${showTooltip ? 'visible' : ''}`}>Go to top</span>
      </button>
    </div>
  );
};

export default GoToTopButton;