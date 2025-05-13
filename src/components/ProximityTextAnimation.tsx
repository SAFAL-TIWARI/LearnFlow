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
  const words = text.split(' ');

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

  const getWordStyle = (index: number) => {
    if (!mousePosition || !containerRef.current) return {};

    const wordElement = containerRef.current.children[index] as HTMLElement;
    if (!wordElement) return {};

    const wordRect = wordElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const wordCenterX = wordRect.left + wordRect.width / 2 - containerRect.left;
    const wordCenterY = wordRect.top + wordRect.height / 2 - containerRect.top;

    const deltaX = mousePosition.x - wordCenterX;
    const deltaY = mousePosition.y - wordCenterY;

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
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <span
            className="inline-block whitespace-nowrap relative"
            style={getWordStyle(index)}
          >
            {word}
          </span>
          {index < words.length - 1 && (
            <span className="inline-block whitespace-nowrap">&nbsp;</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProximityTextAnimation;