/**
 * This file checks if the CSS variables are properly defined
 */

export const checkCssVars = () => {
  // Check if the CSS variables are defined
  const cssVars = [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
    '--radius',
  ];

  // Get the computed style of the root element
  const rootStyle = getComputedStyle(document.documentElement);
  
  // Check if each variable is defined
  const undefinedVars = cssVars.filter(
    (varName) => !rootStyle.getPropertyValue(varName)
  );
  
  if (undefinedVars.length > 0) {
    console.error(
      `Missing CSS variables: ${undefinedVars.join(', ')}`
    );
    return false;
  }
  
  console.log('All CSS variables are properly defined.');
  return true;
};

// Run the check when the DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', checkCssVars);
}