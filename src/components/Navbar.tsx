
import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Dialog } from '@/components/ui/dialog';
import { disableScroll, enableScroll } from '../utils/scrollUtils';
import { Link } from 'react-router-dom';
import SmartAuthButton from './SmartAuthButton';
import ThemeToggle from './ThemeToggle/ThemeToggle';
// import NotificationButton from './NotificationButton';

// Tools data for dropdown
const toolsData = [
  { name: "CGPA Calculator", route: "/tools/cgpa-calculator" },
  { name: "Study Timer", route: "/tools/study-timer" },
  { name: "Exam Scheduler", route: "/tools/exam-scheduler" },
  { name: "Note Organizer", route: "/tools/note-organizer" },
  { name: "Attendance Tracker", route: "/tools/attendance-tracker" },
  { name: "Study Planner", route: "/tools/study-planner" },
  { name: "Performance Analytics", route: "/tools/performance-analytics" },
  { name: "Goal Tracker", route: "/tools/goal-tracker" },
  { name: "Progress Tracker", route: "/tools/progress-tracker" },
  { name: "Flashcards", route: "/tools/flashcards" },
  { name: "Quick Tools", route: "/tools/quick-tools" }
];



const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [toolsTimeout, setToolsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle dropdown hover with delay
  const handleToolsMouseEnter = () => {
    if (toolsTimeout) {
      clearTimeout(toolsTimeout);
      setToolsTimeout(null);
    }
    setToolsDropdownOpen(true);
  };

  const handleToolsMouseLeave = () => {
    const timeout = setTimeout(() => {
      setToolsDropdownOpen(false);
    }, 150); // 150ms delay before closing
    setToolsTimeout(timeout);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (toolsTimeout) clearTimeout(toolsTimeout);
    };
  }, [toolsTimeout]);



  // Handle About dialog open/close and manage scroll blocking
  useEffect(() => {
    let timeoutId: number;

    if (aboutDialogOpen) {
      // Disable scrolling when the dialog is opened from navbar
      disableScroll();

      // Auto-close About dialog after 20 seconds
      timeoutId = window.setTimeout(() => {
        setAboutDialogOpen(false);
      }, 20000);
    } else {
      // Enable scrolling when the dialog is closed
      enableScroll();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [aboutDialogOpen]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md py-5">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-3xl font-bold text-learnflow-600 dark:text-learnflow-300 mr-10 font-teko tracking-wide">
            LearnFlow
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-6">
            {/* Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleToolsMouseEnter}
              onMouseLeave={handleToolsMouseLeave}
            >
              <Link
                to="/tools"
                className="text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya"
              >
                Tools
              </Link>

              {/* Tools Dropdown Menu */}
              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="py-2">
                    {toolsData.map((tool, index) => (
                      <Link
                        key={index}
                        to={tool.route}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya"
                        onClick={() => setToolsDropdownOpen(false)}
                        title={`Go to ${tool.name}`}
                        aria-label={`Navigate to ${tool.name} tool`}
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources Link */}
            <Link
              to="/resources"
              className="text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya"
              title="Navigate to Resources page"
              aria-label="Navigate to academic resources and materials"
            >
              Resources
            </Link>
            
            {/* Search Button */}
            <Link
              to="/search"
              className="text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya"
              title="Search for people"
              aria-label="Search for people on LearnFlow"
            >
              Search
            </Link>

            {/* <NotificationButton /> */}
            <button
              onClick={() => setAboutDialogOpen(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya"
              title="Learn more about LearnFlow"
              aria-label="Open About Us dialog"
            >
              About Us
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <div 
            className="p-0"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center">
            <SmartAuthButton />
          </div>

          {/* Mobile menu button - Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 dark:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
            title={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <div className="relative w-6 h-6">
              {/* Hamburger Icon */}
              <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>

              {/* Close Icon */}
              <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-75'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen
          ? 'max-h-96 opacity-100'
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className={`bg-white dark:bg-gray-800 py-4 px-4 transform transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? 'translate-y-0 scale-100'
            : '-translate-y-4 scale-95'
        }`}>
          <div className="flex flex-col space-y-3">
            <Link
              to="/tools"
              onClick={() => setIsMenuOpen(false)}
              className={`text-left text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:scale-105 font-alegreya ${
                isMenuOpen ? 'animate-fade-in-up' : ''
              }`}
              style={{ animationDelay: '100ms' }}
              title="Navigate to Tools page"
              aria-label="Navigate to academic tools and calculators"
            >
              Tools
            </Link>

            <Link
              to="/resources"
              onClick={() => setIsMenuOpen(false)}
              className={`text-left text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:scale-105 font-alegreya ${
                isMenuOpen ? 'animate-fade-in-up' : ''
              }`}
              style={{ animationDelay: '200ms' }}
              title="Navigate to Resources page"
              aria-label="Navigate to academic resources and materials"
            >
              Resources
            </Link>
            
            <Link
              to="/search"
              onClick={() => setIsMenuOpen(false)}
              className={`text-left text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:scale-105 font-alegreya ${
                isMenuOpen ? 'animate-fade-in-up' : ''
              }`}
              style={{ animationDelay: '250ms' }}
              title="Search for people"
              aria-label="Search for people on LearnFlow"
            >
              Search
            </Link>

            <button
              onClick={() => {
                setAboutDialogOpen(true);
                setIsMenuOpen(false);
              }}
              className={`text-left text-gray-600 dark:text-gray-300 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-all duration-300 ease-in-out transform hover:translate-x-2 hover:scale-105 font-alegreya ${
                isMenuOpen ? 'animate-fade-in-up' : ''
              }`}
              style={{ animationDelay: '300ms' }}
              title="Learn more about LearnFlow"
              aria-label="Open About Us dialog"
            >
              About Us
            </button>

            <div className={`w-full mt-2 transition-all duration-300 ease-in-out transform ${
              isMenuOpen ? 'animate-fade-in-up' : ''
            }`}
            style={{ animationDelay: '400ms' }}>
              <SmartAuthButton />
            </div>
          </div>
        </div>
      </div>

      {/* About Us Dialog */}
      <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${aboutDialogOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">About LearnFlow</h2>
              <button
                onClick={() => setAboutDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Close About Us dialog"
                aria-label="Close About Us dialog"
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
                  <p>Address: SATI Campus, IT Park, Vidisha</p>
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
