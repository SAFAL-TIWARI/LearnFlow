import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle touch scrolling in iframes
 * This helps fix issues with Google Drive document previews
 */
export const useIframeTouchScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    
    if (!container || !overlay) return;
    
    // Get the iframe element
    const iframe = container.querySelector('iframe');
    if (!iframe) return;
    
    // Variables to track touch movement
    let startY = 0;
    let currentY = 0;
    let isScrolling = false;
    let scrollDirection = 0; // 0: undetermined, 1: vertical, 2: horizontal
    let lastScrollTop = 0;
    
    // Function to detect if we're on a mobile device
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    // Only apply these fixes on mobile devices
    if (!isMobileDevice()) return;
    
    // Handle touch start
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return; // Only handle single touch
      
      startY = e.touches[0].clientY;
      currentY = startY;
      isScrolling = true;
      scrollDirection = 0;
      lastScrollTop = container.scrollTop;
      
      // Add active class to overlay to capture events
      overlay.classList.add('active');
    };
    
    // Handle touch move
    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling || e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      currentY = touch.clientY;
      const deltaY = startY - currentY;
      
      // Determine scroll direction if not already determined
      if (scrollDirection === 0) {
        // Store initial touch position for horizontal comparison
        const initialTouchX = e.touches[0].clientX;
        const deltaX = Math.abs(touch.clientX - initialTouchX);
        const deltaYAbs = Math.abs(deltaY);
        
        // If vertical movement is greater, set direction to vertical
        if (deltaYAbs > deltaX && deltaYAbs > 10) {
          scrollDirection = 1;
        }
      }
      
      // If vertical scrolling
      if (scrollDirection === 1) {
        // Scroll the iframe container
        container.scrollTop += deltaY;
        
        // If we actually scrolled, prevent default
        if (container.scrollTop !== lastScrollTop) {
          e.preventDefault();
          e.stopPropagation();
          lastScrollTop = container.scrollTop;
        }
        
        startY = currentY;
      }
    };
    
    // Handle touch end
    const handleTouchEnd = () => {
      isScrolling = false;
      scrollDirection = 0;
      
      // Remove active class from overlay
      overlay.classList.remove('active');
    };
    
    // Add event listeners to the overlay
    overlay.addEventListener('touchstart', handleTouchStart, { passive: false });
    overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
    overlay.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
    
    // Also try to modify the iframe directly when it loads
    iframe.addEventListener('load', () => {
      try {
        // Try to access iframe content (may fail due to same-origin policy)
        if (iframe.contentWindow && iframe.contentDocument) {
          // Add CSS to make content scrollable
          const style = document.createElement('style');
          style.textContent = `
            html, body {
              -webkit-overflow-scrolling: touch !important;
              overflow: auto !important;
              touch-action: pan-y pinch-zoom !important;
              height: 100% !important;
            }
          `;
          iframe.contentDocument.head.appendChild(style);
        }
      } catch (error) {
        // Silently fail - this is expected due to cross-origin restrictions
        console.log("Could not modify iframe content due to same-origin policy");
      }
    });
    
    // Clean up event listeners
    return () => {
      overlay.removeEventListener('touchstart', handleTouchStart);
      overlay.removeEventListener('touchmove', handleTouchMove);
      overlay.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);
  
  return { containerRef, overlayRef };
};