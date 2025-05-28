import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/SupabaseAuthContext';
import PageFadeSection from '../components/PageFadeSection';
import SEOStructuredData from '../components/SEOStructuredData';
import { ThemeProvider } from '../hooks/useTheme';
import { User } from '@supabase/supabase-js';
import { searchUsers, UserProfile as SupabaseUserProfile } from '../utils/supabaseClient';
import BackButton from '../components/BackButton';

// Interface for our component's user profile format
interface UserProfile {
  id: string;
  name: string;
  username: string;
  branch: string;
  year: string;
  college: string;
  bio: string;
  profilePicture: string;
  interests: string[];
}

// Function to convert Supabase profile to our component format
const convertSupabaseProfile = (profile: SupabaseUserProfile): UserProfile => {
  return {
    id: profile.id,
    name: profile.full_name,
    username: profile.username,
    branch: profile.branch || '',
    year: profile.year || '',
    college: profile.college || '',
    bio: profile.bio || '',
    profilePicture: profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=random`,
    interests: profile.interests || []
  };
};

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Parse query parameters when the component mounts or location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location]);

  // Perform search when the search query changes
  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    try {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      // Search users using Supabase function
      const supabaseProfiles = await searchUsers(query);
      
      // Convert Supabase profiles to our component format
      const profiles = supabaseProfiles.map(convertSupabaseProfile);
      
      setSearchResults(profiles);
    } catch (error) {
      console.error('Error searching users:', error);
      // Show error message to user
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
    
    // Update URL with search query
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('q', searchQuery);
    window.history.pushState(
      {},
      '',
      `${location.pathname}?${searchParams.toString()}`
    );
  };

  return (
    <ThemeProvider>
      <SEOStructuredData page="home" />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-8">
          <PageFadeSection animationType="fade-in" threshold={0.05}>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <BackButton className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-bodoni">
                  Search for People
                </h1>
              </div>
              
              <form onSubmit={handleSearchSubmit} className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, branch, college, or interests..."
                    className="w-full p-4 pl-12 pr-12 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:border-transparent transition-all duration-300"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-learnflow-600 hover:bg-learnflow-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Search Results */}
              <div className="space-y-6">
                {isSearching ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-learnflow-600"></div>
                  </div>
                ) : searchQuery && searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600 dark:text-gray-400">No results found for "{searchQuery}"</p>
                    <p className="mt-2 text-gray-500 dark:text-gray-500">Try a different search term or check your spelling</p>
                  </div>
                ) : (
                  searchResults.map((profile) => (
                    <div 
                      key={profile.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <img 
                            src={profile.profilePicture} 
                            alt={profile.name} 
                            className="w-24 h-24 rounded-full object-cover border-2 border-learnflow-200 dark:border-learnflow-800"
                          />
                        </div>
                        <div className="flex-grow">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{profile.name}</h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile.username}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">Branch:</span> {profile.branch}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">Year:</span> {profile.year}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">College:</span> {profile.college}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mb-3">{profile.bio}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest, index) => (
                              <span 
                                key={index}
                                className="inline-block bg-learnflow-100 dark:bg-learnflow-900/30 text-learnflow-800 dark:text-learnflow-300 text-xs px-2 py-1 rounded-full"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col justify-center">
                          <Link 
                            to={`/profile/${profile.id}`}
                            className="bg-learnflow-600 hover:bg-learnflow-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 mb-2 text-center"
                          >
                            View Profile
                          </Link>
                          <Link 
                            to={`/user-files/${profile.id}`}
                            className="bg-white dark:bg-gray-700 text-learnflow-600 dark:text-learnflow-400 border border-learnflow-600 dark:border-learnflow-400 hover:bg-learnflow-50 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors duration-300 text-center"
                          >
                            View Files
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </PageFadeSection>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Search;