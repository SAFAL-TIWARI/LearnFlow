import React from 'react';
import BackButton from '../components/BackButton';

const ReleaseNotesPage: React.FC = () => {
  const releases = [
    {
      version: '1.0.5',
      date: 'June 30, 2025',
      features: [
        'Added interactive monkey animation on login page with cursor tracking and password visibility reactions',
        'Enhanced CGPA calculator with year-based structure and multiple university formulas including SATI official formula',
        'Added comprehensive accessibility features with aria-labels and tooltips for all interactive elements',
        'Improved social media buttons in footer with visible names/tooltips on hover for better user experience'
      ]
    },
    {
      version: '1.0.4',
      date: 'June 25, 2024',
      features: [
        'Implemented click spark animation with customizable parameters (26px size, 45px radius, 11 sparks, 500ms duration)',
        'Added blue spark animation in light mode while maintaining current colors in dark mode',
        'Enhanced back button navigation to use browser history instead of always going to home page',
        'Integrated SATI college branding throughout the application with college name display',
        'Added bounce animation to GoToTop button and other interactive UI elements for better visual feedback'
      ]
    },
    {
      version: '1.0.3',
      date: 'June 20, 2024',
      features: [
        'Enhanced authentication system with automatic window closure after Google sign-in',
        'Implemented Supabase storage buckets alongside manual file management within free tier limitations',
        'Added proper font integration: Bodoni for "Learning Made Simple", Isidora for hero description, Teko for "LearnFlow" branding',
        'Improved CGPA calculator with working formulas, automatic calculation from subject marks, and CGPA to percentage converter',
        'Enhanced tools pages with proper semester-based SGPA calculation and cumulative CGPA averaging'
      ]
    },
    {
      version: '1.0.2',
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
      version: '1.0.1',
      date: 'May 10, 2025',
      features: [
        'Added academic resources section',
        'Improved mobile responsiveness',
        'Dark mode support',
        'Performance optimizations'
      ]
    },
    {
      version: '1.0.0',
      date: 'May 09, 2025',
      features: [
        'Initial release of LearnFlow',
        'Basic authentication with Email',
        'Student tools section',
        'Course information'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <BackButton className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
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