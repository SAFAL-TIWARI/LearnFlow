import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

interface ToolCardProps {
  name: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  name,
  description,
  route,
  icon,
  comingSoon = false,
  onClick
}) => {
  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(route);
    }
  };

  return (
    <div 
      className="w-[200px] h-[260px] sm:w-[260px] sm:h-[300px] md:w-[300px] md:h-[300px] rounded-[15px] border-[3px] border-white bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl cursor-pointer"
      onClick={handleClick}
      style={{ maxWidth: '90vw' }} // Ensure it never exceeds viewport width
    >
      <div 
        className="text-white p-3 sm:p-4 flex items-center justify-between" 
        style={{ 
          background: 'linear-gradient(135deg, #064b85 0%, #0a69b9 100%)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <h3 className="text-base sm:text-lg md:text-xl font-bold truncate pr-2">{name}</h3>
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full p-1 flex-shrink-0 flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      <div className="p-3 sm:p-4 md:p-5 flex-grow flex items-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base line-clamp-5">
          {description}
        </p>
      </div>
      
      <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center border-t border-gray-200 dark:border-gray-600">
        <span className="text-blue-500 font-medium text-sm sm:text-base flex items-center">
          Launch Tool
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
        
      </div>
    </div>
  );
};

export default ToolCard;