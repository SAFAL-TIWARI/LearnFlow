import React, { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

interface SparkConfig {
  sparkColor: string;
  sparkSize: number;
  sparkRadius: number;
  sparkCount: number;
  duration: number;
  extraScale: number;
  sparkColors?: string[]; // Optional array of colors for variation
  excludedSelectors?: string[]; // Optional array of selectors to exclude from animation
  sparkWidth?: number; // Width of the ray/line for starburst effect
}

const ClickSparkAnimation: React.FC = () => {
  const { theme } = useTheme();

  // Store the click handler in a ref so we can remove it when theme changes
  const clickHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  useEffect(() => {
    // Clean up previous event listener if it exists
    if (clickHandlerRef.current) {
      document.removeEventListener('click', clickHandlerRef.current);
      clickHandlerRef.current = null;
    }

    // Use blue color for light mode, white for dark mode
    const sparkColor = theme === 'light' ? '#1E90FF' : 'white'; // Using dodger blue (#1E90FF) for light mode

    // Create the spark config with the current theme color
    const sparkConfig: SparkConfig = {
      sparkColor: sparkColor,
      sparkSize: 26, // Length of the rays
      sparkRadius: 45, // Maximum distance the rays will travel
      sparkCount: 11, // Number of rays in the starburst
      duration: 400, // Animation duration in ms
      extraScale: 1.1, // Scale factor for the animation
      sparkColors: [sparkColor], // Using theme-based color
      sparkWidth: 2, // Width of the ray lines
      excludedSelectors: [
        // Hero buttons - Get Started and Explore Tools
        'button.group', // Get Started button
        'button.px-8.py-3.bg-white', // Explore Tools button
        'a:contains("Get Started")', // Get Started links
        'button:contains("Get Started")', // Get Started buttons
        'a:contains("Explore Tools")', // Explore Tools links
        'button:contains("Explore Tools")', // Explore Tools buttons
        'a[href*="get-started"]', // Get Started links by URL
        'a[href*="explore-tools"]', // Explore Tools links by URL

        // Footer buttons and social media links
        'footer button', // All footer buttons
        'footer a', // All footer links (social media)

        // Navbar buttons
        'nav button', // All navbar buttons

        // Theme Toggle - Dark/Light Mode button
        '.theme-toggle-container',
        '.theme-toggle-left',
        '.theme-toggle-right',
        '.theme-toggle-center',
        'input.slider',
        '.switch',

        // Social media links with specific URLs
        'a[href*="instagram.com"]',
        'a[href*="linkedin.com"]',
        'a[href*="github.com"]',
        'a[href*="youtube.com"]',
        'a[href*="facebook.com"]',
        'a[href*="twitter.com"]',
        '.social-media-button',
        '.social-icon',
        '[aria-label*="social"]',

        // Generic buttons
        'button.primary-button',
        'button.secondary-button',
        'button[type="submit"]',

        // Navigation elements
        'nav a',
        '.navbar a',
        '.navbar button'
      ]
    };

    // Default list of selectors for elements that should not trigger the spark animation
    const defaultExcludedSelectors = [
      // Navigation buttons
      'a[href="#get-started"]',
      'a[href="#explore-tools"]',
      'button[aria-label="Get Started"]',
      'button.get-started',
      'button.explore-tools',
      'a.get-started',
      'a.explore-tools',
      'button[data-action="get-started"]',
      'button[data-action="explore-tools"]',

      // Get Started and Explore Tools buttons by text content
      // These will be handled by our custom :contains selector logic
      'a:contains("Get Started")',
      'button:contains("Get Started")',
      'a:contains("Explore Tools")',
      'button:contains("Explore Tools")',

      // Social media buttons
      'a[href*="facebook.com"]',
      'a[href*="twitter.com"]',
      'a[href*="instagram.com"]',
      'a[href*="linkedin.com"]',
      'a[href*="github.com"]',
      'a[href*="youtube.com"]',
      '.social-media-button',
      '.social-icon',
      'button[aria-label*="social"]',
      'a[aria-label*="social"]',
      'a[aria-label*="Facebook"]',
      'a[aria-label*="Twitter"]',
      'a[aria-label*="Instagram"]',
      'a[aria-label*="LinkedIn"]',
      'a[aria-label*="GitHub"]',
      'a[aria-label*="YouTube"]',

      // Other interactive elements that shouldn't have the animation
      '.chatbot-toggle',
      '.notification-button',
      '.theme-toggle',
      '.theme-toggle-container',
      '.theme-toggle-left',
      '.theme-toggle-right',
      '.theme-toggle-center',
      'input.slider',
      '.switch',
      '.mobile-menu-button',
      'button.action-button',
      'a.action-button'
    ];

    // Combine default selectors with any provided in the config
    const excludedElementSelectors = [
      ...defaultExcludedSelectors,
      ...(sparkConfig.excludedSelectors || [])
    ];

    const createSpark = (x: number, y: number) => {
      // Always get the current theme color directly from the theme state
      // This ensures we always use the most up-to-date color based on the current theme
      const currentSparkColor = theme === 'light' ? '#1E90FF' : 'white';
      const { sparkSize, sparkRadius, sparkCount, duration, extraScale, sparkWidth = 2 } = sparkConfig;

      // Create a container for the sparks
      const sparkContainer = document.createElement('div');
      sparkContainer.style.position = 'fixed';
      sparkContainer.style.left = '0';
      sparkContainer.style.top = '0';
      sparkContainer.style.width = '100%';
      sparkContainer.style.height = '100%';
      sparkContainer.style.pointerEvents = 'none';
      sparkContainer.style.zIndex = '9999';
      document.body.appendChild(sparkContainer);

      // Create sparks in a starburst pattern (evenly distributed angles)
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');

        // Calculate angle for even distribution around the circle
        const angle = (i / sparkCount) * Math.PI * 2;

        // Set spark styles for a line/ray instead of a circle
        spark.style.position = 'absolute';
        spark.style.width = `${sparkSize}px`; // Length of the ray
        spark.style.height = `${sparkWidth}px`; // Width of the ray
        spark.style.backgroundColor = currentSparkColor; // Use the theme-based color
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.transformOrigin = '0 50%'; // Set transform origin to left center
        spark.style.transform = `translate(0, -50%) rotate(${angle}rad) scaleX(0)`; // Start with zero length
        spark.style.pointerEvents = 'none';

        // Add to container
        sparkContainer.appendChild(spark);

        // Animate the spark
        const startTime = performance.now();

        const animateSpark = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);

          // Calculate the length based on sparkRadius
          const rayLength = sparkSize * (sparkRadius / 50); // Scale the ray length based on sparkRadius

          // Scale animation (grow then fade)
          let scaleX = 0;
          if (progress < 0.5) {
            // Apply extraScale to make rays slightly longer at peak
            scaleX = easeOutQuart * 2 * extraScale * (rayLength / sparkSize); // Grow to full length with extra scale
          } else {
            scaleX = extraScale * (rayLength / sparkSize); // Maintain full length while fading
          }

          // Apply transforms - rotate to the correct angle and scale to the current length
          spark.style.transform = `translate(0, -50%) rotate(${angle}rad) scaleX(${scaleX})`;
          spark.style.opacity = progress < 0.5 ? '1' : (1 - (progress - 0.5) * 2).toString();

          if (progress < 1) {
            requestAnimationFrame(animateSpark);
          } else {
            spark.remove();

            // Remove container if all sparks are gone
            if (sparkContainer.children.length === 0) {
              sparkContainer.remove();
            }
          }
        };

        requestAnimationFrame(animateSpark);
      }
    };

    // Create a new click handler function
    const handleClick = (e: MouseEvent) => {
      // Check if the clicked element or any of its parents match the excluded selectors
      const shouldExclude = (element: Element | null): boolean => {
        if (!element) return false;

        // Check for data attribute that explicitly disables the spark animation
        if (element.hasAttribute('data-no-spark')) {
          return true;
        }

        // Check if the element matches any of the excluded selectors
        const isExcluded = excludedElementSelectors.some(selector => {
          try {
            // Handle custom :contains() pseudo-selector
            if (selector.includes(':contains(')) {
              // Extract the tag and the text to match
              const tagMatch = selector.match(/^([a-z]+):/i);
              const textMatch = selector.match(/:contains\("(.+?)"\)/);

              if (tagMatch && textMatch) {
                const tag = tagMatch[1];
                const text = textMatch[1];

                // Check if element matches the tag and contains the text
                return element.tagName.toLowerCase() === tag.toLowerCase() &&
                       element.textContent &&
                       element.textContent.includes(text);
              }
              return false;
            }

            // Standard CSS selector
            return element.matches(selector);
          } catch (error) {
            // In case of invalid selector
            console.error(`Invalid selector: ${selector}`, error);
            return false;
          }
        });

        if (isExcluded) return true;

        // Check parent elements recursively
        if (element.parentElement) {
          return shouldExclude(element.parentElement);
        }

        return false;
      };

      // Get the target element
      const target = e.target as Element;

      // Only create sparks if the clicked element is not excluded
      if (!shouldExclude(target)) {
        createSpark(e.clientX, e.clientY);
      }
    };

    // Store the handler in the ref so we can remove it later
    clickHandlerRef.current = handleClick;

    // Add click event listener to the entire document
    document.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      if (clickHandlerRef.current) {
        document.removeEventListener('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [theme]); // Add theme to dependency array so effect re-runs when theme changes

  return null; // This component doesn't render anything visible
};

export default ClickSparkAnimation;