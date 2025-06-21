import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../styles/notfound.css";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Load Parallax library and initialize
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/parallax/3.1.0/parallax.min.js';
    script.onload = () => {
      if (sceneRef.current && (window as any).Parallax) {
        new (window as any).Parallax(sceneRef.current);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src*="parallax"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [location.pathname]);

  // Handle escape key to close mobile menu and about dialog
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (aboutDialogOpen) {
          setAboutDialogOpen(false);
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen, aboutDialogOpen]);

  const handleGoHome = () => {
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('About clicked');
    setAboutDialogOpen(true);
    closeMobileMenu();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Link clicked');
    closeMobileMenu();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Close mobile menu when clicking outside of nav
    if (isMobileMenuOpen && !(e.target as Element).closest('.notfound-nav')) {
      closeMobileMenu();
    }
  };

  return (
    <div className="notfound-container" onClick={handleContainerClick}>
      {/* About section with social links */}
      {/* <div className="about">
        <a className="bg_links social portfolio" href="https://www.learnflow.com" target="_blank" rel="noopener noreferrer">
          <span className="icon"></span>
        </a>
        <a className="bg_links project page" href="#" target="_blank" rel="noopener noreferrer">
          <span className="icon"></span>
        </a>
        <a className="bg_links help page" href="https://learn-flow-seven.vercel.app/help" target="_blank" rel="noopener noreferrer">
          <span className="icon"></span>
        </a>
        <div className="bg_links logo"></div>
      </div> */}

      {/* Navigation */}
      <nav>
        <div className="notfound-nav" onClick={(e) => e.stopPropagation()}>
          <p className="website_name" onClick={handleGoHome}>LearnFlow</p>
          <div className={`menu_links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
            <button
              className="link"
              onClick={handleAboutClick}
            >
              about
            </button>
            <Link
              to="/tools"
              className="link"
              onClick={handleLinkClick}
            >
              tools
            </Link>
            <Link
              to="/help"
              className="link"
              onClick={handleLinkClick}
            >
              contact us
            </Link>
          </div>
          <div className="menu_icon" onClick={toggleMobileMenu}>
            <span className={`icon ${isMobileMenuOpen ? 'menu-open' : ''}`}></span>
          </div>
        </div>
      </nav>

      {/* Main content wrapper */}
      <section className="wrapper">
        <div className="container">
          {/* Parallax scene */}
          <div id="scene" className="scene" data-hover-only="false" ref={sceneRef}>
            {/* Background circle */}
            <div className="circle" data-depth="1.2"></div>

            {/* Animated pieces - Layer 1 */}
            <div className="one" data-depth="0.9">
              <div className="content">
                <span className="piece"></span>
                <span className="piece"></span>
                <span className="piece"></span>
              </div>
            </div>

            {/* Animated pieces - Layer 2 */}
            <div className="two" data-depth="0.60">
              <div className="content">
                <span className="piece"></span>
                <span className="piece"></span>
                <span className="piece"></span>
              </div>
            </div>

            {/* Animated pieces - Layer 3 */}
            <div className="three" data-depth="0.40">
              <div className="content">
                <span className="piece"></span>
                <span className="piece"></span>
                <span className="piece"></span>
              </div>
            </div>

            {/* 404 Text with parallax effect */}
            <p className="p404" data-depth="0.50">404</p>
            <p className="p404" data-depth="0.10">404</p>
          </div>

          {/* Text and button section */}
          <div className="text">
            <article>
              <p>Uh oh! Looks like you got lost. <br />Go back to the homepage if you dare!</p>
              <button onClick={handleGoHome}>i dare!</button>
            </article>
          </div>
        </div>
      </section>

      {/* About Us Dialog */}
      {aboutDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                <h3 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-400">Our Mission</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  LearnFlow is dedicated to making education accessible, organized, and enjoyable for students across all engineering disciplines. We believe in providing high-quality educational resources that help students excel in their academic journey.
                </p>
              </section>
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-400">About Owner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      ST
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">SAFAL TIWARI</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Computer Science Student</p>
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-400">Contact Us</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>Email: safaltiwari602@gmail.com</p>
                  <p>Address: SATI Campus, IT Park, Vidisha</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotFound;
