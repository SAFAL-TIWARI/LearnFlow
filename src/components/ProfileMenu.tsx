import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [userData, setUserData] = useState<{
    name?: string;
    email?: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { user, logout } = useAuth();

  // Calculate dropdown position based on button position
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 256; // w-64 = 16rem = 256px

      // Center the dropdown relative to the button
      const buttonCenter = buttonRect.left + (buttonRect.width / 2);
      const dropdownLeft = buttonCenter - (dropdownWidth / 2);

      // Ensure dropdown doesn't go off-screen
      const padding = 16;
      const maxLeft = window.innerWidth - dropdownWidth - padding;
      const finalLeft = Math.max(padding, Math.min(dropdownLeft, maxLeft));

      setDropdownPosition({
        top: buttonRect.bottom + 8, // 8px gap below button
        left: finalLeft, // Use left instead of right for better control
      });
    }
  };

  // Update position when dropdown opens, window resizes, or page scrolls
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();

      // Add event listeners for resize and scroll
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true); // true for capture phase to catch all scroll events

      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
      };
    }
  }, [isOpen]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside both dropdown and button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignIn = () => {
    // Calculate center position for the popup window
    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    // Open login page in a new window centered on screen
    const loginWindow = window.open(
      '/login?mode=signup', 
      '_blank', 
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    // Focus the new window
    if (loginWindow) {
      loginWindow.focus();
    }

    // Close the dropdown
    setIsOpen(false);
  };



  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Get user email from Supabase auth
        const userEmail = user.email || '';

        // Check if user exists in Supabase
        const { data, error } = await supabase
          .from('users')
          .select('name, email')
          .eq('email', userEmail)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user data:', error);
          return;
        }

        if (data) {
          // User exists, use their data
          setUserData(data);
          console.log('Fetched user data from Supabase:', data);
        }
      } catch (error) {
        console.error('Error in fetching user profile:', error);
      }
    };

    if (user) {
      fetchUserData();
    }

    // Listen for profile update events
    const handleProfileUpdate = () => {
      if (user) {
        fetchUserData();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user]);



  // Get user's name or email for display
  const getUserName = () => {
    if (!user) return 'G';

    // First try to get name from Supabase database
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }

    // Fallback to auth metadata
    const name = user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.given_name ||
      user.identities?.[0]?.identity_data?.full_name ||
      user.identities?.[0]?.identity_data?.name ||
      user.email?.split('@')[0] ||
      'User';

    // Get first letter of the name
    return name.charAt(0).toUpperCase();
  };

  // Generate a consistent background color based on the user's name
  const getAvatarColor = () => {
    if (!user) return 'bg-gray-500';

    // First try to get name from Supabase database
    const name = userData?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.given_name ||
      user.identities?.[0]?.identity_data?.full_name ||
      user.identities?.[0]?.identity_data?.name ||
      user.email ||
      'User';

    // Simple hash function to generate a consistent color
    const hash = name.split('').reduce((acc: number, char: string) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // List of tailwind color classes for the avatar
    const colors = [
      'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600',
      'bg-purple-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
      'bg-orange-600', 'bg-cyan-600'
    ];

    // Use the hash to pick a color
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Check if user has a custom profile picture
  const hasCustomProfilePicture = user && (
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.picture_url ||
    user.user_metadata?.profile_picture ||
    user.identities?.[0]?.identity_data?.avatar_url ||
    user.identities?.[0]?.identity_data?.picture
  );

  // Get profile picture if user is logged in and has uploaded one
  // Otherwise, use a letter avatar with the first letter of their name
  const profilePicture = hasCustomProfilePicture
    ? (user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      user.user_metadata?.picture_url ||
      user.user_metadata?.profile_picture ||
      user.identities?.[0]?.identity_data?.avatar_url ||
      user.identities?.[0]?.identity_data?.picture)
    : null; // Will use letter avatar instead

  // Log user identities for debugging
  useEffect(() => {
    if (user && user.identities) {
      console.log('User identities:', user.identities);
      console.log('Identity data:', user.identities[0]?.identity_data);
    }
  }, [user]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
        aria-label="Profile menu"
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-learnflow-500 transition-all duration-300"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor()} text-white font-semibold border-2 border-gray-200 hover:border-learnflow-500 transition-all duration-300`}>
            {getUserName()}
          </div>
        )}
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="profile-dropdown-portal fixed w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 animate-fade-in-down relative"
          style={{
            zIndex: 99,
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            position: 'fixed',
          }}
        >
          {/* Arrow pointing up to the button */}
          <div
            className="absolute -top-2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45"
            style={{
              left: '50%',
              marginLeft: '-8px', // Half of width to center
            }}
          ></div>
          {/* User info section - only shown when logged in */}
          {user && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-12 h-12 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor()} text-white font-semibold mr-3`}>
                    {getUserName()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {userData?.name ||
                      user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      user.user_metadata?.given_name ||
                      user.identities?.[0]?.identity_data?.full_name ||
                      user.identities?.[0]?.identity_data?.name ||
                      user.email?.split('@')[0] ||
                      'User'}
                  </p>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email || ''}</p> */}
                </div>
              </div>
            </div>
          )}

          {/* Menu items - shown to all users */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
            {user ? (
              <button
                className="btn-animated w-full flex items-center justify-center bg-red-600 text-white font-medium"
                onClick={async () => {
                  setIsOpen(false);
                  try {
                    await logout();
                    window.location.href = '/'; // Redirect to home page after logout
                  } catch (error) {
                    console.error('Error logging out:', error);
                  }
                }}
                title="Sign out of your account"
                aria-label="Log out from LearnFlow"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </span>
              </button>
            ) : (
              <button
                className="btn-animated w-full flex items-center justify-center bg-indigo-600 text-white font-medium"
                onClick={handleSignIn}
                title="Sign in to your account"
                aria-label="Login to LearnFlow"
              >
                <span className="flex items-center">
                  Login
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}