import React, { useEffect, useRef, useState } from 'react';

interface FadeInElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number; // Distance to travel in pixels
  duration?: number; // Animation duration in milliseconds
  threshold?: number; // Visibility threshold (0-1)
}

const FadeInElement: React.FC<FadeInElementProps> = ({
  children,
  className = "",
  delay = 0,
  direction = 'up',
  distance = 20,
  duration = 600,
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: threshold
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, threshold]);

  // Calculate initial transform based on direction
  const getInitialTransform = () => {
    switch (direction) {
      case 'up': return `translateY(${distance}px)`;
      case 'down': return `translateY(-${distance}px)`;
      case 'left': return `translateX(${distance}px)`;
      case 'right': return `translateX(-${distance}px)`;
      case 'none': return 'none';
      default: return `translateY(${distance}px)`;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0, 0)' : getInitialTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
};

export default FadeInElement;