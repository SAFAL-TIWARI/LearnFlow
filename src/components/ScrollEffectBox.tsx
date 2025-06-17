import React, { ReactNode } from 'react';

interface ScrollEffectBoxProps {
  children: ReactNode;
  speed?: number | string;
  lag?: number | string;
  className?: string;
  id?: string;
}

const ScrollEffectBox: React.FC<ScrollEffectBoxProps> = ({
  children,
  speed,
  lag,
  className = '',
  id
}) => {
  const dataSpeed = speed ? `clamp(${speed})` : undefined;
  const dataLag = lag ? `clamp(${lag})` : undefined;

  return (
    <div
      id={id}
      className={className}
      data-speed={dataSpeed}
      data-lag={dataLag}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
};

export default ScrollEffectBox;