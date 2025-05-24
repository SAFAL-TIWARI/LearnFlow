import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy, Eye } from 'lucide-react';

interface AnalyticsStatusProps {
  className?: string;
}

const AnalyticsStatus: React.FC<AnalyticsStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<{
    googleAnalytics: boolean;
    fallbackData: boolean;
    realTimeData: any;
    error?: string;
  }>({
    googleAnalytics: false,
    fallbackData: false,
    realTimeData: null
  });

  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    checkAnalyticsStatus();
  }, []);

  const checkAnalyticsStatus = async () => {
    try {
      // Check if real Google Analytics is available
      const gaResponse = await fetch('/api/analytics/google-analytics');
      const gaResult = await gaResponse.json();
      
      // Check fallback data
      const fallbackResponse = await fetch('/api/analytics/visitors');
      const fallbackResult = await fallbackResponse.json();

      setStatus({
        googleAnalytics: gaResult.success,
        fallbackData: fallbackResult.success,
        realTimeData: gaResult.success ? gaResult.data : fallbackResult.data,
        error: gaResult.success ? undefined : gaResult.message
      });
    } catch (error) {
      console.error('Error checking analytics status:', error);
      setStatus({
        googleAnalytics: false,
        fallbackData: false,
        realTimeData: null,
        error: 'Failed to check analytics status'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analytics Status
        </h3>
        <button
          onClick={() => setShowSetup(!showSetup)}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          {showSetup ? 'Hide Setup' : 'Show Setup'}
        </button>
      </div>

      {/* Status Indicators */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {status.googleAnalytics ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Real Google Analytics
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {status.googleAnalytics ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {status.fallbackData ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Fallback Data
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {status.fallbackData ? 'Working' : 'Failed'}
          </span>
        </div>
      </div>

      {/* Current Data */}
      {status.realTimeData && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Current Data {status.googleAnalytics ? '(Real GA)' : '(Simulated)'}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Active Users:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {status.realTimeData.activeUsers || status.realTimeData.online}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Total Users:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {status.realTimeData.totalUsers || status.realTimeData.total}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Page Views:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {status.realTimeData.pageViews || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Sessions:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {status.realTimeData.sessions || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status.error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {status.error}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Using simulated data as fallback
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {showSetup && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Connect Real Google Analytics
          </h4>
          
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                1. Get your GA4 Property ID (numeric):
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-between">
                <code className="text-xs">Analytics → Admin → Property Settings</code>
                <button
                  onClick={() => window.open('https://analytics.google.com/analytics/web/', '_blank')}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                2. Create Google Cloud Service Account:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-between">
                <code className="text-xs">Enable Analytics Data API</code>
                <button
                  onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                3. Add environment variables:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
                <code className="text-xs block">
                  GOOGLE_APPLICATION_CREDENTIALS=./google-analytics-key.json<br/>
                  GA_PROPERTY_ID_NUMERIC=your_numeric_id
                </code>
                <button
                  onClick={() => copyToClipboard('GOOGLE_APPLICATION_CREDENTIALS=./google-analytics-key.json\nGA_PROPERTY_ID_NUMERIC=your_numeric_id')}
                  className="text-blue-500 hover:text-blue-600 mt-1"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start">
                <Eye className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    See detailed setup guide in <code>GOOGLE_ANALYTICS_SETUP.md</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={checkAnalyticsStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default AnalyticsStatus;
