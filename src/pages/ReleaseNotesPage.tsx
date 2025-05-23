import React from 'react';

const ReleaseNotesPage: React.FC = () => {
  const releases = [
    {
      version: '1.2.0',
      date: 'June 15, 2025',
      features: [
        'Added user profiles with customizable information',
        'Implemented file upload functionality for students',
        'Added profile picture support',
        'Integrated with Supabase for user data storage',
        'Improved authentication system'
      ]
    },
    {
      version: '1.1.0',
      date: 'May 1, 2025',
      features: [
        'Added academic resources section',
        'Improved mobile responsiveness',
        'Dark mode support',
        'Performance optimizations'
      ]
    },
    {
      version: '1.0.0',
      date: 'April 10, 2025',
      features: [
        'Initial release of LearnFlow',
        'Basic authentication with Google',
        'Student tools section',
        'Course information'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => window.location.href = '/'}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Go back to home page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Release Notes</h1>
        </div>
        
        <div className="space-y-10 mt-8">
          {releases.map((release, index) => (
            <div 
              key={release.version}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-learnflow-600 dark:text-learnflow-400">
                    Version {release.version}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {release.date}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
                    What's New
                  </h3>
                  
                  <ul className="space-y-2">
                    {release.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-start"
                      >
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotesPage;