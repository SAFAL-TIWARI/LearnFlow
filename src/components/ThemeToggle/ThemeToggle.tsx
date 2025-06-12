import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  theme: string;
  toggleTheme: () => void;
  position?: 'left' | 'center' | 'right' | string;
  horizontalOffset?: string;
  verticalOffset?: string;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  theme, 
  toggleTheme, 
  position = 'center',
  horizontalOffset = '40px',
  verticalOffset = '6px',
  className = ''
}) => {
  // Determine position class based on predefined positions
  let positionClass = '';
  if (position === 'left') {
    positionClass = 'theme-toggle-left';
  } else if (position === 'right') {
    positionClass = 'theme-toggle-right';
  } else if (position === 'center') {
    positionClass = 'theme-toggle-center';
  }

  // Create custom style for custom positioning
  const customStyle = {
    '--toggle-horizontal-offset': horizontalOffset,
    '--toggle-vertical-offset': verticalOffset,
  } as React.CSSProperties;

  return (
    <div 
      className={`theme-toggle-container ${positionClass} ${className}`}
      style={customStyle}
    >
      <label>
        <input 
          className="slider" 
          type="checkbox" 
          checked={theme === 'dark'} 
          onChange={toggleTheme}
        />
        <div className="switch">
          <div className="suns"></div>
          <div className="moons">
            <div className="star star-1"></div>
            <div className="star star-2"></div>
            <div className="star star-3"></div>
            <div className="star star-4"></div>
            <div className="star star-5"></div>
            <div className="first-moon"></div>
          </div>
          <div className="sand"></div>
          <div className="bb8">
            <div className="antennas">
              <div className="antenna short"></div>
              <div className="antenna long"></div>
            </div>
            <div className="head">
              <div className="stripe one"></div>
              <div className="stripe two"></div>
              <div className="eyes">
                <div className="eye one"></div>
                <div className="eye two"></div>
              </div>
              <div className="stripe detail">
                <div className="detail zero"></div>
                <div className="detail zero"></div>
                <div className="detail one"></div>
                <div className="detail two"></div>
                <div className="detail three"></div>
                <div className="detail four"></div>
                <div className="detail five"></div>
                <div className="detail five"></div>
              </div>
              <div className="stripe three"></div>
            </div>
            <div className="ball">
              <div className="lines one"></div>
              <div className="lines two"></div>
              <div className="ring one"></div>
              <div className="ring two"></div>
              <div className="ring three"></div>
            </div>
            <div className="shadow"></div>
          </div>
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;