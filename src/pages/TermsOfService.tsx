import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/legal-pages.css';

const TermsOfService: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set document title
    document.title = 'Terms of Service - LearnFlow';
    
    // Fetch the HTML content from the terms-of-service.html file
    fetch('/terms-of-service.html')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load terms of service (${response.status})`);
        }
        return response.text();
      })
      .then(html => {
        const contentDiv = document.getElementById('terms-of-service-content');
        if (contentDiv) {
          contentDiv.innerHTML = html;
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error loading terms of service:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div id="terms-of-service-content" className="prose dark:prose-invert max-w-none legal-content">
          {loading && (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Terms of Service</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;