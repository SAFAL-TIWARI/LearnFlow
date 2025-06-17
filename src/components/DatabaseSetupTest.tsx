import React, { useState } from 'react';
import { checkDatabaseFunctions, getDatabaseSetupInstructions } from '../utils/databaseSetup';

const DatabaseSetupTest: React.FC = () => {
  const [testResult, setTestResult] = useState<{
    deleteUser: boolean;
    error: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const result = await checkDatabaseFunctions();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        deleteUser: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Database Setup Test
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        This tool checks if the required database functions for user deletion are properly set up.
      </p>

      <div className="space-y-4">
        <button
          onClick={runTest}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Database Functions'}
        </button>

        {testResult && (
          <div className={`p-4 rounded-md ${
            testResult.deleteUser 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <h3 className={`font-semibold ${
              testResult.deleteUser 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {testResult.deleteUser ? '✅ Database Functions Ready' : '❌ Database Functions Not Set Up'}
            </h3>
            
            {testResult.deleteUser ? (
              <p className="text-green-700 dark:text-green-300 mt-2">
                All required database functions are properly configured. User deletion should work correctly.
              </p>
            ) : (
              <div className="text-red-700 dark:text-red-300 mt-2">
                <p>Database functions are not set up properly.</p>
                {testResult.error && (
                  <p className="text-sm mt-1 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded">
                    Error: {testResult.error}
                  </p>
                )}
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="mt-2 text-red-600 dark:text-red-400 underline hover:no-underline"
                >
                  {showInstructions ? 'Hide' : 'Show'} Setup Instructions
                </button>
              </div>
            )}
          </div>
        )}

        {showInstructions && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Setup Instructions
            </h4>
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {getDatabaseSetupInstructions()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseSetupTest;