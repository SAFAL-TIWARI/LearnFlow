import React from 'react';
import { Link } from 'react-router-dom';

const AuthErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Error</h1>
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-700 dark:text-red-400">
              There was an error with the authentication process. This could be due to:
            </p>
            <ul className="list-disc list-inside mt-2 text-red-700 dark:text-red-400 text-left">
              <li>Missing or incorrect OAuth credentials</li>
              <li>Server configuration issues</li>
              <li>Temporary service disruption</li>
            </ul>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please try again later or contact the administrator if the problem persists.
          </p>
          <div className="flex flex-col space-y-3">
            <Link 
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home Page
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorPage;