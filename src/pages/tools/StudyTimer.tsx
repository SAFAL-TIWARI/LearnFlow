
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StudyTimer = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mr-4"
        >
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Study Timer</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Track Your Study Sessions</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This Pomodoro timer helps you maximize productivity with focused study sessions and short breaks.
        </p>
        
        {/* Timer interface will be implemented here */}
        <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl">Study Timer coming soon</p>
          <p className="text-gray-500 mt-2">Full implementation in progress</p>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
