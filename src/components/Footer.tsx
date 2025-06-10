
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SyllabusIcon, AssignmentIcon, LabIcon } from './Icons';
import { scrollToTop } from '../utils/scrollUtils';
import ExternalLink from './ExternalLink';
import { Dialog } from '@/components/ui/dialog';
import CookieManager from './CookieManager';
import '../styles/socialIcons.css';

// Available social icon sizes
export type SocialIconSize = 'small' | 'medium' | 'large' | undefined;

interface FooterProps {
  socialIconSize?: SocialIconSize;
}

const Footer: React.FC<FooterProps> = ({ socialIconSize }) => {
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const [iconSize, setIconSize] = useState<SocialIconSize>(socialIconSize);

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
            
            {/* Size controls */}
            {/* <div className="flex items-center justify-center gap-2 mb-3 text-xs">
              <span className="text-gray-600 dark:text-gray-400">Icon size:</span>
              <button 
                onClick={() => setIconSize('small')}
                className={`px-2 py-1 rounded ${iconSize === 'small' ? 'bg-learnflow-100 dark:bg-learnflow-900 text-learnflow-600 dark:text-learnflow-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                Small
              </button>
              <button 
                onClick={() => setIconSize(undefined)}
                className={`px-2 py-1 rounded ${iconSize === undefined ? 'bg-learnflow-100 dark:bg-learnflow-900 text-learnflow-600 dark:text-learnflow-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                Default
              </button>
              <button 
                onClick={() => setIconSize('medium')}
                className={`px-2 py-1 rounded ${iconSize === 'medium' ? 'bg-learnflow-100 dark:bg-learnflow-900 text-learnflow-600 dark:text-learnflow-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                Medium
              </button>
              <button 
                onClick={() => setIconSize('large')}
                className={`px-2 py-1 rounded ${iconSize === 'large' ? 'bg-learnflow-100 dark:bg-learnflow-900 text-learnflow-600 dark:text-learnflow-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                Large
              </button>
            </div> */}
            
            <ul className={`social-icons-list mt-2 ${iconSize ? `size-${iconSize}` : ''}`}>
              <li className="icon-content">
                <a
                  href="https://www.linkedin.com/in/safal-tiwari/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with LearnFlow on LinkedIn"
                  data-social="linkedin"
                >
                  <div className="filled"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-linkedin"
                    viewBox="0 0 16 16"
                    xmlSpace="preserve"
                  >
                    <path
                      d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
                <div className="tooltip">LinkedIn</div>
              </li>
              <li className="icon-content">
                <a 
                  href="https://www.github.com/SAFAL-TIWARI/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View LearnFlow projects on GitHub"
                  data-social="github"
                >
                  <div className="filled"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-github"
                    viewBox="0 0 16 16"
                    xmlSpace="preserve"
                  >
                    <path
                      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
                <div className="tooltip">GitHub</div>
              </li>
              <li className="icon-content">
                <a
                  href="https://www.instagram.com/itz_safal_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow LearnFlow on Instagram"
                  data-social="instagram"
                >
                  <div className="filled"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-instagram"
                    viewBox="0 0 16 16"
                    xmlSpace="preserve"
                  >
                    <path
                      d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
                <div className="tooltip">Instagram</div>
              </li>
              <li className="icon-content">
                <a 
                  href="https://x.com/SAFAL_TIWARI_/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with LearnFlow on X (Twitter)"
                  data-social="twitter"
                >
                  <div className="filled"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-twitter"
                    viewBox="0 0 16 16"
                    xmlSpace="preserve"
                  >
                    <path
                      d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
                <div className="tooltip">Twitter</div>
              </li>
            </ul>
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
