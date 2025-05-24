import React, { useState, useEffect } from 'react';
import { Users, Eye, TrendingUp, Activity } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

interface LiveAnalyticsBadgeProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

const LiveAnalyticsBadge: React.FC<LiveAnalyticsBadgeProps> = ({ 
  variant = 'compact', 
  className = '' 
}) => {
  const { liveStats, isLoading, analyticsData } = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the badge after a short delay
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  if (variant === 'compact') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]"> */}
          {/* <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Live Stats
              </span>
            </div>
            <Activity className="w-4 h-4 text-green-500" />
          </div> */}
          
          {/* <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Online:</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {isLoading ? '...' : liveStats.onlineUsers.toLocaleString()}
              </span> */}
            {/* </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Total:</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {isLoading ? '...' : liveStats.totalVisitors.toLocaleString()} */}
              {/* </span> */}
            {/* </div> */}
          {/* </div> */}
        {/* </div> */}
       </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Analytics
        </h3>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : liveStats.onlineUsers.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Online Now</div>
        </div>

        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Eye className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : liveStats.totalVisitors.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Visitors</div>
        </div>

        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : Math.round(liveStats.accuracyRate)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Accuracy</div>
        </div>

        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <Activity className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : liveStats.resourceCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Resources</div>
        </div>
      </div>

      {analyticsData && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAnalyticsBadge;
