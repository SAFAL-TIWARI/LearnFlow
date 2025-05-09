import React, { useEffect } from 'react';

interface SparkConfig {
  sparkColor: string;
  sparkSize: number;
  sparkRadius: number;
  sparkCount: number;
  duration: number;
  extraScale: number;
}

const ClickSparkAnimation: React.FC = () => {
  const sparkConfig: SparkConfig = {
    sparkColor: 'white',
    sparkSize: 22,
    sparkRadius: 50,
    sparkCount: 15,
    duration: 500,
    extraScale: 1.2
  };

  useEffect(() => {
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
      createSpark(e.clientX, e.clientY);
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