import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  fallbackPath = '/', 
  className = "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
  ariaLabel = "Go back to previous page",
  title = "Go back"
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to specified path if no history
      navigate(fallbackPath);
    }
  };

  return (
    <button 
      onClick={handleBack}
      className={className}
      aria-label={ariaLabel}
      title={title}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 text-gray-600 dark:text-gray-300" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
    </button>
  );
};

export default BackButton;
