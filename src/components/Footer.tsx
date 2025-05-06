
import React from 'react';
import { InstagramIcon, LinkedInIcon, GitHubIcon, YouTubeIcon } from './Icons';
import { scrollToSection } from '../utils/scrollUtils';
import ExternalLink from './ExternalLink';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h3 className="font-semibold text-xl text-learnflow-600 dark:text-learnflow-400">LearnFlow</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Education Made Simple</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 items-center">
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 items-center mb-4 md:mb-0">
              <button 
                onClick={() => scrollToSection('student-tools')} 
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
              >
                Tools
              </button>
              <button 
                onClick={() => scrollToSection('academic-resources')} 
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
              >
                Resources
              </button>
              <button 
                onClick={() => {
                  const navbar = document.querySelector('nav');
                  if (navbar) {
                    // Find the "About Us" button in the navbar and click it
                    const aboutButton = navbar.querySelector('button:nth-child(3)');
                    if (aboutButton) {
                      (aboutButton as HTMLElement).click();
                    }
                  }
                }} 
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
              >
                About Us
              </button>
            </div>
            
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/itz_safal_/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                <InstagramIcon />
              </a>
              <a href="https://www.linkedin.com/in/safal-tiwari/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <LinkedInIcon />
              </a>
              <a href="https://www.github.com/SAFAL-TIWARI/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <GitHubIcon />
              </a>
              <a href="https://www.youtube.com/@safal_editz" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <YouTubeIcon />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 LearnFlow | All rights reserved.
          </p>
          <div className="text-center">
            <ExternalLink 
              to="/privacy-policy" 
              className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </ExternalLink>
            <span className="mx-2 text-gray-600 dark:text-gray-400">|</span>
            <ExternalLink 
              to="/terms-of-service" 
              className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </ExternalLink>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
