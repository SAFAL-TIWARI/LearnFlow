import React, { useEffect, useRef, useState } from 'react';

interface PageFadeSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  animationType?: 'fade-up' | 'fade-down' | 'fade-in';
  delay?: number; // Delay in milliseconds
  threshold?: number; // Visibility threshold (0-1)
}

const PageFadeSection: React.FC<PageFadeSectionProps> = ({ 
  children, 
  id, 
  className = "",
  animationType = 'fade-up',
  delay = 0,
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the section is visible according to threshold, trigger the animation
        if (entry.isIntersecting) {
          // Add a small delay if specified
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          
          // Once it's visible, we don't need to observe anymore
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: threshold // Trigger when element is visible by this percentage
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [delay, threshold]);

  // Determine which animation class to use
  const getAnimationClass = () => {
    if (isVisible) {
      return 'opacity-100 translate-y-0';
    }
    
    switch (animationType) {
      case 'fade-up':
        return 'opacity-0 translate-y-16';
      case 'fade-down':
        return 'opacity-0 -translate-y-16';
      case 'fade-in':
        return 'opacity-0';
      default:
        return 'opacity-0 translate-y-16';
    }
  };

  return (
    <div
      id={id}
      ref={sectionRef}
      className={`transition-all duration-1000 ease-out will-change-transform will-change-opacity ${
        getAnimationClass()
      } ${className}`}
      style={{ 
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default PageFadeSection;