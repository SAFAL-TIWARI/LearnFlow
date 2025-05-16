import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getSession, isAuthenticated } from '../lib/auth-fallback';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  name: string;
  email: string;
  year?: string;
  semester?: string;
  branch?: string;
  profile_picture?: string;
}

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Try to use NextAuth session first
  const { data: nextAuthSession, status } = useSession();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Check if we're using NextAuth or fallback
        let userEmail = '';
        let userName = '';
        let userId = '';
        
        if (status === 'authenticated' && nextAuthSession) {
          // Using NextAuth
          userEmail = nextAuthSession.user?.email || '';
          userName = nextAuthSession.user?.name || '';
          userId = nextAuthSession.user?.email || '';
          setUsingFallback(false);
        } else if (isAuthenticated()) {
          // Using fallback auth
          const fallbackSession = getSession();
          userEmail = fallbackSession?.user.email || '';
          userName = fallbackSession?.user.name || '';
          userId = fallbackSession?.user.email || '';
          setUsingFallback(true);
        } else {
          // Not authenticated
          setLoading(false);
          return;
        }
        
        // Check if user exists in Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user data:', error);
          throw error;
        }
        
        if (data) {
          // User exists, use their data
          setUserData(data);
        } else {
          // User doesn't exist, create a new record
          const newUser = {
            id: userId,
            name: userName,
            email: userEmail,
            created_at: new Date().toISOString(),
          };
          
          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating user:', createError);
            throw createError;
          }
          
          setUserData(createdUser);
        }
      } catch (error) {
        console.error('Error in user profile setup:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (status !== 'loading') {
      fetchUserData();
    }
  }, [nextAuthSession, status]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // If not authenticated or still loading NextAuth, return null
  if ((status === 'unauthenticated' && !isAuthenticated()) || (status === 'loading' && loading)) {
    return null;
  }
  
  const profilePicture = userData?.profile_picture || 
    nextAuthSession?.user?.image || 
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData?.name || 'User');
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
      >
        <img 
          src={profilePicture} 
          alt="Profile" 
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-learnflow-500 transition-all duration-300"
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700 animate-fade-in-down">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-12 h-12 rounded-full mr-3 object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{userData?.name || 'User'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userData?.email || ''}</p>
              </div>
            </div>
          </div>
          
          <Link 
            to="/profile" 
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </div>
          </Link>
          
          <Link 
            to="/release-notes" 
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Release Notes
            </div>
          </Link>
          
          <Link 
            to="/help" 
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help
            </div>
          </Link>
          
          <Link 
            to="/feedback" 
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Feedback
            </div>
          </Link>
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          
          <div className="px-4 py-2">
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-roboto"
              onClick={() => {
                setIsOpen(false);
                // Logout logic is handled by the parent component
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}