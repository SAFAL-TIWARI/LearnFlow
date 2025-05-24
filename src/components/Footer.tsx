
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, LinkedInIcon, GitHubIcon, YouTubeIcon } from './Icons';
import { scrollToTop } from '../utils/scrollUtils';
import ExternalLink from './ExternalLink';
import { Dialog } from '@/components/ui/dialog';

const Footer: React.FC = () => {
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

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
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h3
              className="font-semibold text-xl text-learnflow-600 dark:text-learnflow-400 cursor-pointer hover:text-learnflow-700 dark:hover:text-learnflow-300 transition-colors font-teko tracking-wide"
              onClick={() => {
                // window.location.reload();
                scrollToTop();
              }}
              title="Refresh page and go to top"
            >
              LearnFlow
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Education Made Simple</p>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 items-center">
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 items-center mb-4 md:mb-0">
              <Link
                to="/tools"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya"
              >
                Tools
              </Link>
              <Link
                to="/resources"
                className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya"
              >
                Resources
              </Link>
              {/* <button */}
              {/* onClick={() => setAboutDialogOpen(true)} */}
              {/* className="text-gray-600 dark:text-gray-400 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors font-alegreya" */}
              {/* > */}
                {/* About Us */}
              {/* </button> */}
            </div>

            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/itz_safal_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                title="Follow us on Instagram"
                aria-label="Follow LearnFlow on Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/safal-tiwari/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Connect with us on LinkedIn"
                aria-label="Connect with LearnFlow on LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://www.github.com/SAFAL-TIWARI/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="View our projects on GitHub"
                aria-label="View LearnFlow projects on GitHub"
              >
                <GitHubIcon />
              </a>
              {/* <a
                href="https://www.youtube.com/@safal_editz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Subscribe to our YouTube channel"
                aria-label="Subscribe to LearnFlow on YouTube"
              >
                <YouTubeIcon />
              </a> */}
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
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2 text-learnflow-600 dark:text-learnflow-400">Contact Us</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>Email: safaltiwari602@gmail.com</p>
                  <p>Address: SATI Campus, IT Park, Vidisha - 464001</p>
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
