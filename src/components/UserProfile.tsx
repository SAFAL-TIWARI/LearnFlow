import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/SupabaseAuthContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  year?: string;
  semester?: string;
  branch?: string;
}

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use Supabase auth context
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get user email from Supabase auth
        const userEmail = user.email || user.identities?.[0]?.identity_data?.email || '';
        const userName = user.user_metadata?.full_name || user.identities?.[0]?.identity_data?.full_name || user.email?.split('@')[0] || 'User';
        const userId = user.id;

        // Check if user exists in Supabase users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user data:', error);
          throw error;
        }


        // Check if user profile exists in profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        }

        // If profile doesn't exist, create one
        if (!profileData) {
          console.log('Creating user profile in profiles table');
          const username = userName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
          
          // Get user data from users table if it exists
          let branch = '';
          let year = '';
          let college = '';
          
          if (data) {
            branch = data.branch || '';
            year = data.year || '';
            college = data.college || '';
          }
          
          const newProfile = {
            id: userId,
            username: username,
            full_name: userName,
            branch: branch,
            year: year,
            college: college,
            is_public: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert([newProfile]);

          if (createProfileError) {
            console.error('Error creating user profile:', createProfileError);
          } else {
            console.log('Successfully created user profile in profiles table');
          }
        }

        if (data) {
          // User exists, use their data
          setUserData(data);
        } else {
          // User doesn't exist in users table yet
          // This might happen if the auth context hasn't finished creating the user
          // Let's wait a bit and try again, or use fallback data
          console.log('User not found in users table, using fallback data');
          
          // Use fallback data temporarily
          const fallbackUser = {
            id: userId,
            name: userName,
            email: userEmail,
          };
          
          setUserData(fallbackUser);
          
          // Try to refetch after a short delay to see if auth context created the user
          setTimeout(async () => {
            try {
              const { data: retryData } = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail)
                .single();
              
              if (retryData) {
                console.log('Found user data on retry:', retryData);
                setUserData(retryData);
              }
            } catch (error) {
              console.log('User still not found on retry, keeping fallback data');
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error in user profile setup:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Listen for user data updates
  useEffect(() => {
    const handleUserDataUpdate = () => {
      console.log('User data update event received, refetching data');
      if (user) {
        const fetchUserData = async () => {
          try {
            const userEmail = user.email || user.identities?.[0]?.identity_data?.email || '';
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('email', userEmail)
              .single();
            
            if (data) {
              console.log('Refetched user data:', data);
              setUserData(data);
            }
          } catch (error) {
            console.error('Error refetching user data:', error);
          }
        };
        
        fetchUserData();
      }
    };

    window.addEventListener('user-data-updated', handleUserDataUpdate);
    
    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdate);
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Listen for profile update events
    const handleProfileUpdate = (event: Event) => {
      if (user) {
        // Refetch user data when profile is updated
        const fetchUserData = async () => {
          try {
            const userEmail = user.email || '';
            
            // Fetch updated user data from Supabase
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('email', userEmail)
              .single();

            if (error) {
              console.error('Error fetching updated user data:', error);
              return;
            }

            if (data) {
              setUserData(data);
            }
          } catch (error) {
            console.error('Error refreshing user profile:', error);
          }
        };

        fetchUserData();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user]);

  // If not authenticated or still loading, return null
  if (!user || loading) {
    return null;
  }

  // Use the name from Supabase database if available, otherwise fallback to auth metadata
  const userName = userData?.name || user.user_metadata?.full_name || user.identities?.[0]?.identity_data?.full_name || user.email?.split('@')[0] || 'User';
  
  const profilePicture = user.user_metadata?.avatar_url ||
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName);

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
                <p className="font-semibold text-gray-800 dark:text-gray-200">{userName}</p>
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
            to="/notices"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notices
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
              className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-ogg"
              onClick={async () => {
                setIsOpen(false);
                try {
                  await logout();
                  window.location.href = '/'; // Redirect to home page after logout
                } catch (error) {
                  console.error('Error logging out:', error);
                }
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