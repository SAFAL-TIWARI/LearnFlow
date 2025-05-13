
import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Dialog } from '@/components/ui/dialog';
import { scrollToSection } from '../utils/scrollUtils';
import SmartAuthButton from './SmartAuthButton';
import NotificationButton from './NotificationButton';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto-close About dialog after 10 seconds if it was automatically opened
  useEffect(() => {
    let timeoutId: number;
    if (aboutDialogOpen) {
      timeoutId = window.setTimeout(() => {
        setAboutDialogOpen(false);
      }, 20000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [aboutDialogOpen]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-learnflow-600 dark:text-learnflow-300 mr-8">
            LearnFlow
          </a>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-6">
            <button 
              onClick={() => scrollToSection('student-tools')}
              className="text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
            >
              Tools
            </button>
            <button 
              onClick={() => scrollToSection('academic-resources')}
              className="text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
            >
              Resources
            </button>
            {/* <NotificationButton /> */}
            <button 
              onClick={() => setAboutDialogOpen(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
            >
              About Us
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2">
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Auth Button */}
          <div className="hidden md:flex items-center">
            <SmartAuthButton />
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden text-gray-700 dark:text-gray-200"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 py-4 px-4">
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => {
                scrollToSection('student-tools');
                setIsMenuOpen(false);
              }}
              className="text-left text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
            >
              Tools
            </button>
            <button 
              onClick={() => {
                scrollToSection('academic-resources');
                setIsMenuOpen(false);
              }}
              className="text-left text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
            >
              Resources
            </button>
            <div onClick={() => setIsMenuOpen(true)}>
              {/* <NotificationButton /> */}
            </div>
            <button 
              onClick={() => {
                setAboutDialogOpen(true);
                setIsMenuOpen(false);
              }}
              className="text-left text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors"
            >
              About Us
            </button>
            <div className="w-full mt-2">
              <SmartAuthButton />
            </div>
          </div>
        </div>
      )}

      {/* About Us Dialog */}
      <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${aboutDialogOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">About LearnFlow</h2>
              <button 
                onClick={() => setAboutDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-learnflow-600 dark:text-learnflow-400">Our Mission</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  LearnFlow is dedicated to making education accessible, organized, and enjoyable for students across all engineering disciplines. We believe in providing high-quality educational resources that help students excel in their academic journey.
                </p>
              </section>
              
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-learnflow-600 dark:text-learnflow-400">About Owner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-learnflow-100 flex items-center justify-center text-learnflow-600 font-bold">
                     Stu
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">SAFAL TIWARI</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Computer Science Student</p>
                    </div>
                  </div>
                  {/* <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-learnflow-100 flex items-center justify-center text-learnflow-600 font-bold">
                      
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100"></h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400"></p>
                    </div>
                  </div> */}
                </div>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold mb-2 text-learnflow-600 dark:text-learnflow-400">Contact Us</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>Email: safaltiwari602@gmail.com</p>
                  {/* <p>Phone: +91 6260584403</p> */}
                  <p>Address: SATI Campus, IT Park, Vidisha - 464001</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Dialog>


    </nav>
  );
};

export default Navbar;
