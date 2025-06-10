import React from 'react';
import './LoadingAnimation.css';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ size = 'medium' }) => {
  const sizeClass = {
    small: 'loading-hand-small',
    medium: 'loading-hand-medium',
    large: 'loading-hand-large',
  }[size];

  return (
    <div className={`loading-hand ${sizeClass}`}>
      <div className="hand">
        <div className="finger"></div>
        <div className="finger"></div>
        <div className="finger"></div>
        <div className="finger"></div>
        <div className="palm"></div>
        <div className="thumb"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;