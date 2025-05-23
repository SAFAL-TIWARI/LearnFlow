
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
 * Utility function to disable page scrolling
 */
export const disableScroll = () => {
  // Store current scroll position
  const scrollY = window.scrollY;
  
  // Add styles to body to prevent scrolling
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.style.overflowY = 'scroll';
  
  // Store the scroll position as a data attribute
  document.body.dataset.scrollY = scrollY.toString();
};

/**
 * Utility function to enable page scrolling
 */
export const enableScroll = () => {
  // Get the scroll position from the data attribute
  const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
  
  // Remove the styles that prevent scrolling
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflowY = '';
  
  // Scroll back to the original position
  window.scrollTo(0, scrollY);
  
  // Remove the data attribute
  delete document.body.dataset.scrollY;
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
