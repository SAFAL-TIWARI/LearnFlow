import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getSession, isAuthenticated } from '../lib/auth-fallback';
import { useSession } from '../lib/auth-fallback';

const FeedbackPage: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Try to use NextAuth session first
  const { data: nextAuthSession, status } = useSession();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      setError('Please enter your feedback before submitting.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get user information from either NextAuth or fallback
      let userEmail = '';
      let userName = '';
      
      if (status === 'authenticated' && nextAuthSession) {
        // Using NextAuth
        userEmail = nextAuthSession.user?.email || '';
        userName = nextAuthSession.user?.name || '';
      } else if (isAuthenticated()) {
        // Using fallback auth
        const fallbackSession = getSession();
        userEmail = fallbackSession?.user.email || '';
        userName = fallbackSession?.user.name || '';
      } else {
        // Not authenticated - use anonymous
        userEmail = 'anonymous@user.com';
        userName = 'Anonymous User';
      }
      
      // Submit feedback to Supabase
      const { error: submitError } = await supabase
        .from('feedback')
        .insert([
          {
            type: feedbackType,
            content: feedbackText,
            rating: rating,
            user_email: userEmail,
            user_name: userName,
          },
        ]);
        
      if (submitError) {
        console.error('Error submitting feedback:', submitError);
        throw submitError;
      }
      
      // Reset form and show success message
      setFeedbackText('');
      setRating(null);
      setIsSubmitted(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error in feedback submission:', error);
      setError('Failed to submit feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Feedback</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We value your feedback! Please let us know how we can improve LearnFlow to better serve your educational needs.
            </p>
            
            {isSubmitted ? (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 dark:text-green-300">Thank you for your feedback! We appreciate your input.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feedback Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['suggestion', 'bug', 'praise'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFeedbackType(type)}
                        className={`px-4 py-2 rounded-md capitalize transition-colors ${
                          feedbackType === type
                            ? 'bg-learnflow-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback"
                    rows={5}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Please share your thoughts, ideas, or report issues..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    required
                  />
                </div>
                
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How would you rate your experience with LearnFlow?
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`h-8 w-8 ${
                            rating && star <= rating
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-learnflow-500 text-white rounded-md hover:bg-learnflow-600 focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;