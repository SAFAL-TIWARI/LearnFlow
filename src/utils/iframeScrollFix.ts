/**
 * Utility to fix scrolling issues with Google Drive document previews
 * This script is injected into the page to handle touch events on iframes
 */

// Function to apply the fix when the page loads
export function applyIframeScrollFix() {
  // Only run on mobile devices
  if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return;
  }

  // Function to handle iframe touch events
  const handleIframeTouch = () => {
    // Find all iframes that might be Google Drive previews
    const iframes = document.querySelectorAll('iframe[src*="drive.google.com"]');
    
    iframes.forEach(iframe => {
      // Create a wrapper if it doesn't exist
      let wrapper = iframe.parentElement;
      if (!wrapper?.classList.contains('iframe-container')) {
        // Create a new wrapper
        wrapper = document.createElement('div');
        wrapper.className = 'iframe-container';
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'auto';
        wrapper.style['-webkit-overflow-scrolling' as any] = 'touch';
        wrapper.style.height = iframe.style.height || '600px';
        
        // Insert wrapper before iframe
        iframe.parentNode?.insertBefore(wrapper, iframe);
        
        // Move iframe into wrapper
        wrapper.appendChild(iframe);
      }
      
      // Create overlay if it doesn't exist
      if (!wrapper.querySelector('.touch-scroll-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'touch-scroll-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.zIndex = '10';
        overlay.style.touchAction = 'pan-y';
        
        // Add overlay to wrapper
        wrapper.insertBefore(overlay, iframe);
        
        // Variables to track touch movement
        let startY = 0;
        let isScrolling = false;
        let lastScrollTop = 0;
        
        // Handle touch events
        overlay.addEventListener('touchstart', (e) => {
          if (e.touches.length !== 1) return;
          startY = e.touches[0].clientY;
          isScrolling = true;
          lastScrollTop = wrapper.scrollTop;
          overlay.style.pointerEvents = 'auto';
        }, { passive: false });
        
        overlay.addEventListener('touchmove', (e) => {
          if (!isScrolling || e.touches.length !== 1) return;
          
          const currentY = e.touches[0].clientY;
          const deltaY = startY - currentY;
          
          wrapper.scrollTop += deltaY;
          
          if (wrapper.scrollTop !== lastScrollTop) {
            e.preventDefault();
            lastScrollTop = wrapper.scrollTop;
          }
          
          startY = currentY;
        }, { passive: false });
        
        overlay.addEventListener('touchend', () => {
          isScrolling = false;
          overlay.style.pointerEvents = 'none';
        });
      }
    });
  };
  
  // Apply the fix when the page loads
  if (document.readyState === 'complete') {
    handleIframeTouch();
  } else {
    window.addEventListener('load', handleIframeTouch);
  }
  
  // Also apply the fix when new iframes might be added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        handleIframeTouch();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}