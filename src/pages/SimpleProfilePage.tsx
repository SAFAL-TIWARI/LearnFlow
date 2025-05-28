import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/SupabaseAuthContext';
import { useSession } from 'next-auth/react';
import { getSession, isAuthenticated } from '../lib/auth-fallback';

const SimpleProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    profilePicture: string;
    year: string;
    semester: string;
    branch: string;
  }>({
    name: '',
    email: '',
    profilePicture: '',
    year: '',
    semester: '',
    branch: ''
  });

  // Try to use Supabase auth first
  const { user } = useAuth();
  
  // Try to use NextAuth session as fallback
  const { data: nextAuthSession, status } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Check which auth method we're using
        let userName = '';
        let userEmail = '';
        let userPicture = '';
        
        if (user) {
          // Using Supabase auth
          userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
          userEmail = user.email || '';
          userPicture = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
          console.log('Using Supabase auth:', user);
        } else if (status === 'authenticated' && nextAuthSession) {
          // Using NextAuth
          userName = nextAuthSession.user?.name || nextAuthSession.user?.email?.split('@')[0] || 'User';
          userEmail = nextAuthSession.user?.email || '';
          userPicture = nextAuthSession.user?.image || (nextAuthSession.user as any)?.picture || '';
          console.log('Using NextAuth:', nextAuthSession);
        } else if (isAuthenticated()) {
          // Using fallback auth
          const fallbackSession = getSession();
          userName = fallbackSession?.user.name || fallbackSession?.user.email.split('@')[0] || 'User';
          userEmail = fallbackSession?.user.email || '';
          userPicture = fallbackSession?.user.image || '';
          console.log('Using fallback auth:', fallbackSession);
        }
        
        // Set user data
        setUserData({
          name: userName,
          email: userEmail,
          profilePicture: userPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`,
          year: localStorage.getItem(`profile_year_${userEmail}`) || '',
          semester: localStorage.getItem(`profile_semester_${userEmail}`) || '',
          branch: localStorage.getItem(`profile_branch_${userEmail}`) || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, nextAuthSession, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // Save to localStorage for now
    localStorage.setItem(`profile_year_${userData.email}`, userData.year);
    localStorage.setItem(`profile_semester_${userData.email}`, userData.semester);
    localStorage.setItem(`profile_branch_${userData.email}`, userData.branch);
    
    alert('Profile updated successfully!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-learnflow-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData.email) {
    // Function to open login window in a new tab
    const handleSignUp = () => {
      // Open login page in a new window with signup mode
      const signupWindow = window.open('/login?mode=signup', '_blank', 'width=500,height=600');
      
      // Focus the new window
      if (signupWindow) {
        signupWindow.focus();
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to view your profile.</p>
        <button
          onClick={handleSignUp}
          className="w-full max-w-xs flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium transition-all duration-300 hover:bg-indigo-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Sign Up
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Your Profile</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img 
                  src={userData.profilePicture} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`;
                  }}
                />
              </div>
            </div>
            
            {/* Profile Information Section */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <select
                    name="year"
                    value={userData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={userData.semester}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={userData.branch}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="ECE">Electronics & Communication</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="CE">Civil Engineering</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-learnflow-500 text-white rounded-md hover:bg-learnflow-600 focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:ring-offset-2 transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleProfilePage;