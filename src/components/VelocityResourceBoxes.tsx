import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface VelocityResourceBoxesProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultVelocity?: number;
  className?: string;
  children: React.ReactNode;
  mobileBoxWidth?: string;
  mobileWordsPerLine?: number;
}

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function VelocityResourceBoxes({
  defaultVelocity = 30,
  children,
  className,
  mobileBoxWidth = "220px",
  mobileWordsPerLine = 4,
  ...props
}: VelocityResourceBoxesProps) {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });
  const [repetitions, setRepetitions] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const directionFactor = React.useRef<number>(-1);

  // Calculate responsive velocity based on screen size
  const getResponsiveVelocity = () => {
    if (screenWidth <= 480) {
      // Extra small screens (mobile) - faster animation
      return defaultVelocity * 1.8;
    } else if (screenWidth <= 640) {
      // Small screens - slightly faster
      return defaultVelocity * 1.5;
    } else if (screenWidth <= 768) {
      // Medium screens - slightly faster
      return defaultVelocity * 1.2;
    } else {
      // Large screens and above - default speed
      return defaultVelocity;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.offsetWidth;
        const newRepetitions = Math.ceil(containerWidth / contentWidth) + 2;
        setRepetitions(newRepetitions);
      }
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [children]);

  useAnimationFrame((t, delta) => {
    // Always move in the same direction to complete full cycles
    const responsiveVelocity = getResponsiveVelocity();
    let moveBy = directionFactor.current * responsiveVelocity * (delta / 1000);

    // Only adjust speed based on scroll velocity, not direction
    const velocityMultiplier = Math.abs(velocityFactor.get());
    moveBy += directionFactor.current * moveBy * velocityMultiplier;
    
    baseX.set(baseX.get() + moveBy);
  });

  // Calculate responsive wrap range based on screen size
  const getWrapRange = () => {
    if (screenWidth <= 480) {
      return -530; // Adjusted range for smaller mobile boxes
    } else if (screenWidth <= 640) {
      return -200; // Medium range for small screens
    } else {
      return -185; // Default range for larger screens
    }
  };

  const x = useTransform(baseX, (v) => `${wrap(getWrapRange(), 0, v)}%`);

  // Helper function to format text with line breaks based on word count
  const formatTextWithLineBreaks = (text: string, wordsPerLine: number): React.ReactNode => {
    const words = text.split(' ');
    const lines: string[] = [];
    
    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }
    
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Helper function to recursively modify text content in React elements
  const modifyElementText = (element: React.ReactElement, wordsPerLine: number): React.ReactElement => {
    // Check if this element has a className that indicates it's a description
    const className = element.props.className || '';
    const isDescription = className.includes('text-gray-600') || 
                         className.includes('dark:text-gray-300') ||
                         className.includes('description') ||
                         element.type === 'p';

    if (isDescription && typeof element.props.children === 'string') {
      // This is a description element with text content, format it
      return React.cloneElement(element, {
        ...element.props,
        children: formatTextWithLineBreaks(element.props.children, wordsPerLine)
      });
    }

    // If element has children, recursively process them
    if (element.props.children) {
      const modifiedChildren = React.Children.map(element.props.children, (child) => {
        if (React.isValidElement(child)) {
          return modifyElementText(child, wordsPerLine);
        }
        return child;
      });

      return React.cloneElement(element, {
        ...element.props,
        children: modifiedChildren
      });
    }

    return element;
  };

  // Function to modify children for mobile
  const getModifiedChildren = () => {
    if (screenWidth <= 480) {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Clone the child and modify its className to use mobile-specific width
          const currentClassName = child.props.className || '';
          const mobileClassName = currentClassName.replace(
            /min-w-\[\d+px\]/g, 
            `min-w-[${mobileBoxWidth}]`
          );
          
          // Apply text formatting for descriptions
          const childWithFormattedText = modifyElementText(child, mobileWordsPerLine);
          
          return React.cloneElement(childWithFormattedText, {
            ...childWithFormattedText.props,
            className: mobileClassName,
            style: {
              ...childWithFormattedText.props.style,
              minWidth: mobileBoxWidth,
            }
          });
        }
        return child;
      });
    }
    return children;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden",
        className,
      )}
      {...props}
    >
      <motion.div 
        className="flex" 
        style={{ x }}
      >
        {Array.from({ length: repetitions }).map((_, i) => (
          <div key={i} ref={i === 0 ? contentRef : null} className="flex flex-shrink-0">
            {getModifiedChildren()}
          </div>
        ))}
      </motion.div>
    </div>
  );
}