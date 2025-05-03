/**
 * This file checks if Tailwind CSS is properly configured
 */

export const checkTailwindConfig = () => {
  // Check if the Tailwind CSS classes are being processed
  const testElement = document.createElement('div');
  testElement.className = 'hidden';
  document.body.appendChild(testElement);
  
  // Get the computed style
  const computedStyle = window.getComputedStyle(testElement);
  const display = computedStyle.getPropertyValue('display');
  
  // Clean up
  document.body.removeChild(testElement);
  
  // If Tailwind is working, the 'hidden' class should set display to 'none'
  const isTailwindWorking = display === 'none';
  
  if (!isTailwindWorking) {
    console.error('Tailwind CSS is not working properly. Check your configuration.');
  } else {
    console.log('Tailwind CSS is working properly.');
  }
  
  return isTailwindWorking;
};

// Run the check when the DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', checkTailwindConfig);
}