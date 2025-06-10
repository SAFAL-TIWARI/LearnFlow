import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
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
  year: string;
  semester: string; // Changed from optional to required
  branch: string;
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
    year: profile.year || 'Not specified',
    semester: profile.semester || 'Not specified',
    branch: profile.branch || 'Not specified',
    bio: '', // Bio is not needed in search results
    profilePicture: profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=random`,
    interests: [] // Interests are not needed in search results
  };
};

// Search history item type
interface SearchHistoryItem {
  id: string;
  name: string;
  username: string;
  timestamp: number;
}

// Functions to manage search history
const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    const historyString = localStorage.getItem('learnflow_search_history');
    return historyString ? JSON.parse(historyString) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

const saveToSearchHistory = (profile: UserProfile) => {
  try {
    const history = getSearchHistory();
    
    // Check if this profile is already in history
    const existingIndex = history.findIndex(item => item.id === profile.id);
    
    // Create a history item with current timestamp
    const historyItem: SearchHistoryItem = {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      timestamp: Date.now()
    };
    
    // If exists, remove it (will be added to the front later)
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    
    // Add to the beginning of the array
    history.unshift(historyItem);
    
    // Keep only the latest 10 items
    const trimmedHistory = history.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('learnflow_search_history', JSON.stringify(trimmedHistory));
    
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

const removeFromSearchHistory = (itemId: string, timestamp: number) => {
  try {
    const history = getSearchHistory();
    
    // Remove the item with matching id and timestamp
    const updatedHistory = history.filter(
      item => !(item.id === itemId && item.timestamp === timestamp)
    );
    
    // Save back to localStorage
    localStorage.setItem('learnflow_search_history', JSON.stringify(updatedHistory));
    
    return updatedHistory;
  } catch (error) {
    console.error('Error removing from search history:', error);
    return getSearchHistory(); // Return original on error
  }
};

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse query parameters and load search history when the component mounts
  useEffect(() => {
    // Load search history from localStorage
    setSearchHistory(getSearchHistory());
    
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location]);
  
  // Effect to measure dropdown height when visible
  useEffect(() => {
    if (isInputFocused && searchHistory.length > 0 && dropdownRef.current) {
      const height = dropdownRef.current.getBoundingClientRect().height;
      setDropdownHeight(height + 10); // Add a little extra space
    } else {
      setDropdownHeight(0);
    }
  }, [isInputFocused, searchHistory.length]);

  // Handle navigation to a profile and save to history
  const handleProfileClick = (profile: UserProfile) => {
    // Save this profile to search history
    saveToSearchHistory(profile);
    
    // Update the search history state
    setSearchHistory(getSearchHistory());
  };

  // Debounce function to delay search until user stops typing
  const debounce = (func: Function, delay: number) => {
    return (...args: any[]) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set a new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

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

  // Create a debounced version of the search function (300ms delay)
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      performSearch(query);
      
      // Update URL with search query
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('q', query);
      window.history.pushState(
        {},
        '',
        `${location.pathname}?${searchParams.toString()}`
      );
    }, 300),
    [location.pathname]
  );

  // Handle input change with debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // Trigger debounced search when input changes
    if (newQuery.trim().length > 0) { // Search from the first character
      debouncedSearch(newQuery);
    } else if (newQuery.trim().length === 0) {
      // Clear results if search is empty
      setSearchResults([]);
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
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => {
                      // Longer delay to allow for clicks on history items
                      setTimeout(() => setIsInputFocused(false), 300);
                    }}
                    placeholder="Search by name, branch, semester, etc..."
                    className="w-full p-4 pl-12 pr-12 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:border-transparent transition-all duration-300"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {isSearching ? (
                    <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-learnflow-600 rounded-full"></div>
                    </div>
                  ) : null}
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-learnflow-600 hover:bg-learnflow-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    Search
                  </button>
                  
                  {/* Search History Dropdown - with ref for height measurement */}
                  {isInputFocused && searchHistory.length > 0 && (
                    <div 
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                      <div className="flex justify-between items-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <span>Recent Searches</span>
                      </div>
                      <ul>
                        {searchHistory.map((item) => (
                          <li 
                            key={`${item.id}-${item.timestamp}`}
                            className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                          >
                            <div 
                              className="flex-grow flex items-center cursor-pointer"
                              onClick={() => {
                                // Set search query to the name
                                setSearchQuery(item.name);
                                // Perform search
                                performSearch(item.name);
                                // Update URL
                                const searchParams = new URLSearchParams(location.search);
                                searchParams.set('q', item.name);
                                window.history.pushState(
                                  {},
                                  '',
                                  `${location.pathname}?${searchParams.toString()}`
                                );
                                // Hide dropdown
                                setIsInputFocused(false);
                              }}
                            >
                              <div className="mr-3 text-gray-400 dark:text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                                {/* <div className="text-xs text-gray-500 dark:text-gray-400">@{item.username}</div> */}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent click
                                const updatedHistory = removeFromSearchHistory(item.id, item.timestamp);
                                setSearchHistory(updatedHistory);
                                // Keep focus on the input to prevent dropdown from closing
                                if (inputRef.current) {
                                  inputRef.current.focus();
                                }
                              }}
                              aria-label="Remove from history"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-2">
                  Results will appear as you type. Type at least 2 characters to start searching.
                </p> */}
              </form>

              {/* Search Results - Add margin-top using measured dropdown height */}
              <div 
                style={{ 
                  marginTop: dropdownHeight > 0 ? `${dropdownHeight}px` : undefined 
                }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
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
                      to={`/profile/${profile.id}`}
                      onClick={() => handleProfileClick(profile)}
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
                              <span className="font-medium mr-1">Year:</span> 
                              <span className={profile.year === 'Not specified' ? 'text-gray-400 italic' : ''}>
                                {profile.year}
                              </span>
                            </div>
                            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">Semester:</span> 
                              <span className={profile.semester === 'Not specified' ? 'text-gray-400 italic' : ''}>
                                {profile.semester}
                              </span>
                            </div>
                            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">Branch:</span> 
                              <span className={profile.branch === 'Not specified' ? 'text-gray-400 italic' : ''}>
                                {profile.branch}
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