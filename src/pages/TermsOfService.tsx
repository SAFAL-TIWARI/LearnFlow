import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/legal-pages.css';

const TermsOfService: React.FC = () => {
  useEffect(() => {
    // Set document title
    document.title = 'Terms of Service - LearnFlow';
    
    // Fetch the HTML content from the terms-of-service.html file
    fetch('/terms-of-service.html')
      .then(response => response.text())
      .then(html => {
        const contentDiv = document.getElementById('terms-of-service-content');
        if (contentDiv) {
          contentDiv.innerHTML = html;
        }
      })
      .catch(error => {
        console.error('Error loading terms of service:', error);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div id="terms-of-service-content" className="prose dark:prose-invert max-w-none legal-content">
          {/* Content will be loaded here */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;