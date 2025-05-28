import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchIcon from './SearchIcon';

interface SearchButtonProps {
  className?: string;
  variant?: 'default' | 'text' | 'icon';
  title?: string;
}

const SearchButton: React.FC<SearchButtonProps> = ({ 
  className = "", 
  variant = 'default',
  title = "Search for people"
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'text':
        return "text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya";
      case 'icon':
        return "p-2 text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors";
      default:
        return "flex items-center space-x-2 bg-learnflow-600 hover:bg-learnflow-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md";
    }
  };

  return (
    <Link
      to="/search"
      className={`${getButtonStyles()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
      aria-label={title}
    >
      {variant === 'default' ? (
        <>
          <SearchIcon className={`w-5 h-5 ${isHovered ? 'animate-pulse' : ''}`} />
          <span>Search</span>
        </>
      ) : variant === 'text' ? (
        <span>Search</span>
      ) : (
        <SearchIcon className={`w-5 h-5 ${isHovered ? 'animate-pulse' : ''}`} />
      )}
    </Link>
  );
};

export default SearchButton;