import React, { ReactNode } from 'react';
import { useScrollSmootherContext } from '../context/ScrollSmootherContext';

interface ScrollToButtonProps {
  children: ReactNode;
  target: string;
  position?: string;
  className?: string;
  onClick?: () => void;
}

const ScrollToButton: React.FC<ScrollToButtonProps> = ({
  children,
  target,
  position = 'center center',
  className = '',
  onClick
}) => {
  const { scrollTo } = useScrollSmootherContext();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(target, true, position);
    if (onClick) onClick();
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      data-scroll-to={target}
    >
      {children}
    </button>
  );
};

export default ScrollToButton;