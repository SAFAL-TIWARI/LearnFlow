import React, { useEffect } from 'react';

interface SparkConfig {
  sparkColor: string;
  sparkSize: number;
  sparkRadius: number;
  sparkCount: number;
  duration: number;
  extraScale: number;
  sparkColors?: string[]; // Optional array of colors for variation
  excludedSelectors?: string[]; // Optional array of selectors to exclude from animation
}

const ClickSparkAnimation: React.FC = () => {
  const sparkConfig: SparkConfig = {
    sparkColor: 'white',
    sparkSize: 22,
    sparkRadius: 50,
    sparkCount: 12, // Set to the requested count
    duration: 500,
    extraScale: 1.2,
    sparkColors: ['white'], // Using only white as specified
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

  useEffect(() => {
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
      const { sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale } = sparkConfig;
      
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
      
      // Create sparks
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        
        // Set spark styles
        spark.style.position = 'absolute';
        spark.style.width = `${sparkSize}px`;
        spark.style.height = `${sparkSize}px`;
        spark.style.backgroundColor = sparkColor;
        spark.style.borderRadius = '50%';
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.transform = 'translate(-50%, -50%)';
        spark.style.pointerEvents = 'none';
        
        // Add to container
        sparkContainer.appendChild(spark);
        
        // Calculate random angle and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * sparkRadius;
        
        // Calculate end position
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        // Animate the spark
        const startTime = performance.now();
        
        const animateSpark = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          
          // Calculate current position
          const currentX = x + (endX - x) * easeOutQuart;
          const currentY = y + (endY - y) * easeOutQuart;
          
          // Scale animation (grow then shrink)
          let scale = 1;
          if (progress < 0.5) {
            scale = 1 + (extraScale - 1) * (progress * 2); // Grow
          } else {
            scale = extraScale - (extraScale - 0) * ((progress - 0.5) * 2); // Shrink
          }
          
          // Apply transforms
          spark.style.transform = `translate(-50%, -50%) translate(${currentX - x}px, ${currentY - y}px) scale(${scale})`;
          spark.style.opacity = (1 - progress).toString();
          
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
    
    // Add click event listener to the entire document
    document.addEventListener('click', handleClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
  
  return null; // This component doesn't render anything visible
};

export default ClickSparkAnimation;