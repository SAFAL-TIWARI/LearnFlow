import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

interface UseScrollSmootherOptions {
  smooth?: number;
  effects?: boolean;
  normalizeScroll?: boolean;
  ignoreMobileResize?: boolean;
  onUpdate?: (self: any) => void;
  onRefresh?: (self: any) => void;
}

export const useScrollSmoother = (options: UseScrollSmootherOptions = {}) => {
  const smootherRef = useRef<any>(null);
  const isInitialized = useRef(false);

  const defaultOptions = {
    smooth: 1.5,
    effects: true,
    normalizeScroll: true,
    ignoreMobileResize: true,
    ...options
  };

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;

    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Wait for DOM to be ready
    const initScrollSmoother = () => {
      try {
        // Kill any existing ScrollSmoother instance
        if (smootherRef.current) {
          smootherRef.current.kill();
        }

        // Create ScrollSmoother instance
        smootherRef.current = ScrollSmoother.create({
          wrapper: '#smooth-wrapper',
          content: '#smooth-content',
          ...defaultOptions
        });

        isInitialized.current = true;

        // Add scroll-to functionality for buttons
        const addScrollToButtons = () => {
          const scrollToButtons = document.querySelectorAll('[data-scroll-to]');
          scrollToButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              const target = button.getAttribute('data-scroll-to');
              if (target && smootherRef.current) {
                smootherRef.current.scrollTo(target, true, 'center center');
              }
            });
          });
        };

        // Add scroll-to functionality after a short delay
        setTimeout(addScrollToButtons, 100);

      } catch (error) {
        console.warn('ScrollSmoother initialization failed:', error);
      }
    };

    // Initialize immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initScrollSmoother);
    } else {
      initScrollSmoother();
    }

    // Cleanup function
    return () => {
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
      isInitialized.current = false;
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Refresh ScrollSmoother when needed
  const refresh = () => {
    if (smootherRef.current) {
      smootherRef.current.refresh();
    }
  };

  // Scroll to element
  const scrollTo = (target: string | Element, smooth: boolean = true, position: string = 'top top') => {
    if (smootherRef.current) {
      smootherRef.current.scrollTo(target, smooth, position);
    }
  };

  return {
    smoother: smootherRef.current,
    refresh,
    scrollTo,
    isInitialized: isInitialized.current
  };
};