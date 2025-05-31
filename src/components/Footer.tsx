
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, LinkedInIcon, GitHubIcon, YouTubeIcon, TwitterIcon, SyllabusIcon, AssignmentIcon, LabIcon } from './Icons';
import { scrollToTop } from '../utils/scrollUtils';
import ExternalLink from './ExternalLink';
import { Dialog } from '@/components/ui/dialog';
import CookieManager from './CookieManager';

const Footer: React.FC = () => {
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  // Auto-close About dialog after 20 seconds if opened
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
    <footer className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 py-10">
      <div className="container mx-auto px-4">
        {/* Top Section with Logo and Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Column */}
          <div className="flex flex-col items-center md:items-start">
            <div 
              className="group flex items-center cursor-pointer"
              onClick={() => scrollToTop()}
              title="Back to top"
            >
              <h2 className="font-bold text-2xl text-learnflow-600 dark:text-learnflow-400 group-hover:text-learnflow-700 dark:group-hover:text-learnflow-300 transition-colors font-teko tracking-wide">
                LearnFlow
              </h2>
              <div className="ml-2 transform transition-transform group-hover:translate-y-[-4px]">
                {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg> */}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 mb-4">Empowering Education, Inspiring Growth</p>
            
            <div className="flex space-x-4 mt-2">
              <a
                href="https://www.instagram.com/itz_safal_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-all transform hover:scale-110"
                title="Follow us on Instagram"
                aria-label="Follow LearnFlow on Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/safal-tiwari/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all transform hover:scale-110"
                title="Connect with us on LinkedIn"
                aria-label="Connect with LearnFlow on LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://www.github.com/SAFAL-TIWARI/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all transform hover:scale-110"
                title="View our projects on GitHub"
                aria-label="View LearnFlow projects on GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://x.com/SAFAL_TIWARI_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300 transition-all transform hover:scale-110"
                title="Connect with us on X"
                aria-label="Connect with LearnFlow on X (Twitter)"
              >
                <TwitterIcon />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-lg">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2">
              <Link
                to="/tools"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                Tools
              </Link>
              <Link
                to="/resources"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                Resources
              </Link>
              <Link
                to="/search"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                Search
              </Link>
              <button
                onClick={() => setAboutDialogOpen(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-medium flex items-center text-left"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                About Us
              </button>
            </div>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-lg">Academic Resources</h3>
            <div className="grid grid-cols-1 gap-y-2">
              <Link
                to="/resources?type=syllabus"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <SyllabusIcon className="h-4 w-4" />
                </span>
                Syllabus
              </Link>
              <Link
                to="/resources?type=assignments"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <AssignmentIcon className="h-4 w-4" />
                </span>
                Assignments
              </Link>
              <Link
                to="/resources?type=practicals"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <LabIcon className="h-4 w-4" />
                </span>
                Practicals
              </Link>
              <Link
                to="/resources?type=pyq"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-medium flex items-center"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                Previous Year Questions
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section with Copyright and Legal */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col items-center text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              © {currentYear} LearnFlow | Transforming Education for Engineering Students
            </p>
            <div className="flex flex-col items-center">
              {/* Policy links - horizontal on desktop, vertical on mobile */}
              <div className="flex flex-col md:flex-row items-center gap-y-2 md:gap-x-4 mb-2">
                <ExternalLink
                  to="/privacy-policy"
                  className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors cursor-pointer text-sm"
                >
                  Privacy Policy
                </ExternalLink>
                <span className="hidden md:inline text-gray-400 dark:text-gray-600">|</span>
                <ExternalLink
                  to="/terms-of-service"
                  className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors cursor-pointer text-sm"
                >
                  Terms of Service
                </ExternalLink>
              </div>
              {/* Cookie manager below the policy links */}
              <CookieManager className="text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* About Us Dialog */}
      <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${aboutDialogOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 animate-fade-in shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="text-learnflow-600 dark:text-learnflow-400 mr-2">About</span> LearnFlow
              </h2>
              <button
                onClick={() => setAboutDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Close About Us dialog"
                aria-label="Close About Us dialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3 text-learnflow-600 dark:text-learnflow-400">Our Mission</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  LearnFlow is dedicated to making education accessible, organized, and enjoyable for students across all engineering disciplines. 
                  We believe in providing high-quality educational resources that help students excel in their academic journey and prepare for 
                  successful careers in technology and engineering.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-learnflow-600 dark:text-learnflow-400">About the Founder</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-learnflow-100 flex items-center justify-center text-learnflow-600 font-bold text-xl">
                    ST
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg">SAFAL TIWARI</h4>
                    <p className="text-gray-600 dark:text-gray-400">Computer Science Student & Educational Innovator</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Passionate about making learning resources accessible to all students
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-learnflow-600 dark:text-learnflow-400">Contact Us</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email: safaltiwari602@gmail.com
                  </p>
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Address: SATI Campus, IT Park, Vidisha
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Dialog>
    </footer>
  );
};

export default Footer;
