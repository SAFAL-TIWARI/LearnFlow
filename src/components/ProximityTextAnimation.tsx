import React, { useEffect, useRef, useState } from 'react';

interface ProximityTextAnimationProps {
  text: string;
  className?: string;
  sensitivity?: number;
  maxDistance?: number;
}

const ProximityTextAnimation: React.FC<ProximityTextAnimationProps> = ({
  text,
  className = "",
  sensitivity = 0.15,
  maxDistance = 100
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const characters = text.split('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleMouseLeave = () => {
      setMousePosition(null);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const getCharacterStyle = (index: number) => {
    if (!mousePosition || !containerRef.current) return {};

    const charElement = containerRef.current.children[index] as HTMLElement;
    if (!charElement) return {};

    const charRect = charElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const charCenterX = charRect.left + charRect.width / 2 - containerRect.left;
    const charCenterY = charRect.top + charRect.height / 2 - containerRect.top;
    
    const deltaX = mousePosition.x - charCenterX;
    const deltaY = mousePosition.y - charCenterY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) return {};
    
    const force = (maxDistance - distance) / maxDistance;
    
    // Move away from cursor
    const moveX = -deltaX * force * sensitivity;
    const moveY = -deltaY * force * sensitivity;
    
    return {
      transform: `translate(${moveX}px, ${moveY}px)`,
      transition: 'transform 0.15s ease-out',
    };
  };

  return (
    <div ref={containerRef} className={`inline-block relative ${className}`}>
      {characters.map((char, index) => (
        <span
          key={index}
          className="inline-block relative"
          style={getCharacterStyle(index)}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

export default ProximityTextAnimation;