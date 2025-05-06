import React from 'react';

interface ExternalLinkProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ to, className, children }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open(to, '_blank', 'noopener,noreferrer');
  };

  return (
    <a 
      href={to}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
};

export default ExternalLink;