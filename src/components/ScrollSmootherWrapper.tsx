import React, { ReactNode } from 'react';

interface ScrollSmootherWrapperProps {
  children: ReactNode;
  className?: string;
}

const ScrollSmootherWrapper: React.FC<ScrollSmootherWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div id="smooth-wrapper" className={`${className}`}>
      <div id="smooth-content" className="overflow-visible w-full">
        {children}
      </div>
    </div>
  );
};

export default ScrollSmootherWrapper;