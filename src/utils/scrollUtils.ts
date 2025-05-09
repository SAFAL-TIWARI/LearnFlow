
/**
 * Utility function to scroll to a specific section by ID
 */
export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    // Get the element's position relative to the viewport
    const rect = element.getBoundingClientRect();
    
    // Calculate the absolute position by adding the scroll position
    const absoluteTop = rect.top + window.scrollY;
    
    // Scroll with a smooth animation
    window.scrollTo({
      top: absoluteTop - 80, // Subtract header height or add some padding
      behavior: 'smooth'
    });
  }
};

/**
 * Utility function to scroll to the top of the page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Enhanced scroll function with callback
 * This allows executing a function after scrolling is complete
 */
export const scrollWithCallback = (
  targetPosition: number, 
  callback?: () => void, 
  duration = 1000
) => {
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  // Easing function for smooth animation
  const easeInOutQuad = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  const animateScroll = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easeInOutQuad(progress);
    
    window.scrollTo(0, startPosition + distance * easedProgress);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animateScroll);
    } else if (callback) {
      callback();
    }
  };

  requestAnimationFrame(animateScroll);
};
