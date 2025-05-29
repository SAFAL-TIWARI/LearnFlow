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
  bio: string;
  profilePicture: string;
  interests?: string[]; // Made optional since we're not displaying interests
}

// Function to convert Supabase profile to our component format
const convertSupabaseProfile = (profile: SupabaseUserProfile): UserProfile => {
  // Ensure all fields have default values if they're missing
  return {
    id: profile.id,
    name: profile.full_name || 'Unknown User',
    username: profile.username || 'user',
    branch: profile.branch || 'Not specified',
    year: profile.year || 'Not specified',
    bio: '', // Bio is not needed in search results
    profilePicture: profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=random`,
    interests: [] // Interests are not needed in search results
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

      console.log('Starting search for query:', query);

      // Search users using Supabase function
      const supabaseProfiles = await searchUsers(query);
      
      console.log('Raw search results:', supabaseProfiles);
      
      if (!supabaseProfiles || supabaseProfiles.length === 0) {
        console.log('No profiles found for query:', query);
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      // Filter out profiles that are not public
      const publicProfiles = supabaseProfiles.filter(profile => {
        const isPublic = profile.is_public === true;
        if (!isPublic) {
          console.log('Filtering out non-public profile:', profile.id);
        }
        return isPublic;
      });
      
      if (publicProfiles.length === 0) {
        console.log('No public profiles found for query:', query);
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      // Convert Supabase profiles to our component format
      const profiles = publicProfiles.map(profile => {
        console.log('Converting profile:', profile);
        return convertSupabaseProfile(profile);
      });
      
      console.log('Converted profiles:', profiles);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isSearching ? (
                  <div className="col-span-full flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-learnflow-600"></div>
                  </div>
                ) : searchQuery && searchResults.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-xl text-gray-600 dark:text-gray-400">No results found for "{searchQuery}"</p>
                    <p className="mt-2 text-gray-500 dark:text-gray-500">Try a different search term or check your spelling</p>
                  </div>
                ) : (
                  searchResults.map((profile) => (
                    <Link 
                      key={profile.id}
                      to={`/profile?userId=${profile.id}`}
                      className="block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                    >
                      <div className="p-6 flex flex-col items-center">
                        <div className="mb-4">
                          <img 
                            src={profile.profilePicture} 
                            alt={profile.name} 
                            className="w-24 h-24 rounded-full object-cover border-2 border-learnflow-200 dark:border-learnflow-800"
                          />
                        </div>
                        <div className="text-center">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{profile.name}</h2>
                          
                          <div className="flex flex-col gap-y-2 mb-3">
                            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">Branch:</span> 
                              <span className={profile.branch === 'Not specified' ? 'text-gray-400 italic' : ''}>
                                {profile.branch}
                              </span>
                            </div>
                            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">Year:</span> 
                              <span className={profile.year === 'Not specified' ? 'text-gray-400 italic' : ''}>
                                {profile.year}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
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