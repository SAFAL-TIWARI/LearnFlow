import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/SupabaseAuthContext';
import { 
  checkAndFixSearchFunctionality, 
  checkProfilesTable, 
  checkCurrentUserProfile,
  createProfileForCurrentUser
} from '../utils/checkAndFixSearch';

const SearchDiagnostics: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const { user } = useAuth();

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnosticResults({});
    
    try {
      // Check search functionality
      const searchFunctionWorking = await checkAndFixSearchFunctionality();
      
      // Check profiles table
      const profilesTableInfo = await checkProfilesTable();
      
      // Check current user profile
      const userProfileInfo = await checkCurrentUserProfile();
      
      setDiagnosticResults({
        searchFunctionWorking,
        profilesTableInfo,
        userProfileInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setDiagnosticResults({ error: 'Failed to run diagnostics' });
    } finally {
      setIsRunning(false);
    }
  };
  
  const fixIssues = async () => {
    setIsRunning(true);
    
    try {
      // Fix search function if needed
      await checkAndFixSearchFunctionality();
      
      // Create profile for current user if needed
      if (diagnosticResults.userProfileInfo && !diagnosticResults.userProfileInfo.hasProfile) {
        await createProfileForCurrentUser();
      }
      
      // Run diagnostics again to verify fixes
      await runDiagnostics();
      setIsFixed(true);
    } catch (error) {
      console.error('Error fixing issues:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  if (!user) {
    return <div className="p-4 text-center">Please sign in to run search diagnostics</div>;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Search Diagnostics</h2>
      
      {isRunning ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Running diagnostics...</span>
        </div>
      ) : (
        <>
          {diagnosticResults.error ? (
            <div className="text-red-500 mb-4">{diagnosticResults.error}</div>
          ) : Object.keys(diagnosticResults).length > 0 ? (
            <div className="space-y-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <h3 className="font-semibold">Search Function:</h3>
                <div className={diagnosticResults.searchFunctionWorking ? "text-green-500" : "text-red-500"}>
                  {diagnosticResults.searchFunctionWorking ? "Working properly" : "Not working"}
                </div>
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <h3 className="font-semibold">Profiles Table:</h3>
                <div>
                  Status: {diagnosticResults.profilesTableInfo?.exists ? "Exists" : "Does not exist"}
                </div>
                <div>
                  Profile Count: {diagnosticResults.profilesTableInfo?.count || 0}
                </div>
                {diagnosticResults.profilesTableInfo?.sampleProfile && (
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer">Sample Profile</summary>
                      <pre className="text-xs mt-2 p-2 bg-gray-200 dark:bg-gray-600 overflow-auto">
                        {JSON.stringify(diagnosticResults.profilesTableInfo.sampleProfile, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <h3 className="font-semibold">Your Profile:</h3>
                <div className={diagnosticResults.userProfileInfo?.hasProfile ? "text-green-500" : "text-red-500"}>
                  {diagnosticResults.userProfileInfo?.hasProfile 
                    ? "Profile exists" 
                    : "No profile found for your account"}
                </div>
                {diagnosticResults.userProfileInfo?.profile && (
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer">Your Profile Details</summary>
                      <pre className="text-xs mt-2 p-2 bg-gray-200 dark:bg-gray-600 overflow-auto">
                        {JSON.stringify(diagnosticResults.userProfileInfo.profile, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
              
              {(!diagnosticResults.searchFunctionWorking || 
                !diagnosticResults.userProfileInfo?.hasProfile) && (
                <div className="mt-4">
                  <button
                    onClick={fixIssues}
                    disabled={isRunning || isFixed}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isFixed ? "Issues Fixed" : "Fix Issues"}
                  </button>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-4">
                Last checked: {new Date(diagnosticResults.timestamp).toLocaleString()}
              </div>
            </div>
          ) : null}
          
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Run Diagnostics Again
          </button>
        </>
      )}
    </div>
  );
};

export default SearchDiagnostics;