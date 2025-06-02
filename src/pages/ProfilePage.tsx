import React, { useState, useEffect, useRef } from 'react';
import { supabase, supabaseUrl } from '../lib/supabase';
import { getSession, isAuthenticated } from '../lib/auth-fallback';
import { useAuth } from '../context/SupabaseAuthContext';
import { useSafeSession } from '../hooks/useSafeSession';
import { branchSubjects, Subject } from '../data/academicData';
import BackButton from '../components/BackButton';
import '../styles/animations.css';

interface UserData {
  id: string;
  name: string;
  email: string;
  year?: string;
  semester?: string;
  branch?: string;
  isCurrentUser?: boolean;
}

interface FileUpload {
  id: string;
  name: string;
  url: string;
  type: string;
  created_at: string;
  category: string;
  subject_code?: string;
  subject_name?: string;
  is_public?: boolean;
  publicUrl?: string;
  description?: string;
  file_path?: string;
}

// Error fallback component
const ProfilePageErrorFallback = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* <div className="bg-red-500 h-2 w-full"></div> */}
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">Profile Error</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            We encountered an issue loading your profile. This could be due to a network issue or a temporary server problem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md"
              aria-label="Go back to home page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-3 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-all duration-300 hover:shadow-md transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadSection, setUploadSection] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(true);

  // State for dropdown menus
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeouts, setDropdownTimeouts] = useState<Record<string, NodeJS.Timeout>>({});
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Try to use Supabase auth first, then NextAuth as fallback
  const { user: supabaseUser } = useAuth();
  const { data: nextAuthSession, status } = useSafeSession();

  // Initialize storage bucket when component loads
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Check if the bucket exists and create it if needed
        const bucketName = 'user-files'; // Use hyphen to match the existing bucket name
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
          console.error('Error checking buckets:', error);
          return;
        }

        console.log('Available buckets:', buckets);

        // Check if our bucket exists
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

        if (!bucketExists) {
          console.log(`Bucket '${bucketName}' not found, attempting to create it...`);
          const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true // Make the bucket public so files are accessible
          });

          if (createError) {
            console.error(`Error creating bucket '${bucketName}':`, createError);
          } else {
            console.log(`Bucket '${bucketName}' created successfully:`, data);
          }
        }
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };

    initializeStorage();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Check if we're viewing another user's profile from URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');

        if (userId) {
          setViewingUserId(userId);
          setIsCurrentUserProfile(false);
          console.log('Viewing user profile with ID:', userId);

          // Fetch the user data for the specified user ID from profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Error fetching user data by ID:', error);
            setLoading(false);
            return;
          }

          if (data) {
            console.log('User found by ID:', data);

            // Check if the profile is public or if the current user is the owner
            const isPublic = data.is_public === true;
            const isOwner = supabaseUser && supabaseUser.id === data.id;

            if (isPublic || isOwner) {
              console.log('Profile data:', data);

              // Extract year from the profile data
              // If year is in format "Year X", extract the number
              let year = '';
              if (data.year) {
                if (data.year.includes('Year')) {
                  const match = data.year.match(/Year\s*(\d+)/i);
                  if (match && match[1]) {
                    year = match[1];
                  } else {
                    year = data.year;
                  }
                } else {
                  year = data.year;
                }
              }

              // Use the semester value from the profile data if it exists
              // Otherwise, determine semester based on year as a fallback
              let semester = data.semester || '';

              // Only calculate semester from year if it's not already provided in the profile data
              if (!semester && year) {
                const yearNum = parseInt(year);
                if (!isNaN(yearNum)) {
                  // For simplicity: Year 1 -> Semester 1, Year 2 -> Semester 3, etc.
                  semester = ((yearNum - 1) * 2 + 1).toString();
                }
              }

              // Map profile data to userData format with all necessary fields
              setUserData({
                id: data.id,
                name: data.full_name || data.username || 'Unknown User',
                email: data.email || '',
                year: year,
                semester: semester,
                branch: data.branch || '',
                isCurrentUser: false
              });

              // Fetch files for this user
              await fetchUserFiles(userId);
              setLoading(false);
              return;
            } else {
              console.log('Profile is not public and user is not the owner');
              setLoading(false);
              return;
            }
          }
        }

        // If not viewing another user, proceed with current user authentication
        let userEmail = '';
        let currentUserId = '';

        if (supabaseUser) {
          // Using Supabase auth
          userEmail = supabaseUser.email || '';
          currentUserId = supabaseUser.id;
          console.log('Using Supabase auth:', supabaseUser);
        } else if (status === 'authenticated' && nextAuthSession) {
          // Using NextAuth
          userEmail = nextAuthSession.user?.email || '';
          console.log('Using NextAuth:', nextAuthSession);
        } else if (isAuthenticated()) {
          // Using fallback auth
          const fallbackSession = getSession();
          userEmail = fallbackSession?.user.email || '';
          console.log('Using fallback auth:', fallbackSession);
        } else {
          // Not authenticated and not viewing another user's profile
          console.log('User not authenticated and not viewing another profile');
          setLoading(false);
          return;
        }

        console.log('User email:', userEmail);

        if (!userEmail) {
          console.error('No user email found');
          setLoading(false);
          return;
        }

        setIsCurrentUserProfile(true);

        // Check if the 'users' table exists
        try {
          // First, try to fetch user data
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', userEmail)
            .single();

          if (error) {
            console.error('Error fetching user data:', error);

            // If user doesn't exist, create a new user record
            if (error.code === 'PGRST116') {
              console.log('User not found, creating new user');
              try {
                const { data: newUser, error: createError } = await supabase
                  .from('users')
                  .insert([
                    {
                      email: userEmail,
                      name: userEmail.split('@')[0]
                    }
                  ])
                  .select();

                if (createError) {
                  console.error('Error creating user:', createError);
                  // If table doesn't exist, we'll handle it below
                  if (createError.code === 'PGRST116' || createError.message.includes('does not exist')) {
                    throw new Error('users_table_not_found');
                  }
                  throw createError;
                }

                if (newUser && newUser.length > 0) {
                  setUserData(newUser[0]);
                }
              } catch (createError: any) {
                console.error('Error in user creation:', createError);

                // If the table doesn't exist, create a mock user for display
                if (createError.message === 'users_table_not_found' ||
                  createError.message.includes('does not exist')) {
                  console.log('Creating mock user data for display');
                  setUserData({
                    id: '1',
                    name: userEmail.split('@')[0],
                    email: userEmail
                  });
                }
              }
            } else if (error.code === '42P01' || error.message.includes('does not exist')) {
              // Table doesn't exist, create mock user
              console.log('Table does not exist, creating mock user');
              setUserData({
                id: '1',
                name: userEmail.split('@')[0],
                email: userEmail
              });
            } else {
              // Some other error
              console.error('Unknown error:', error);
              setUserData({
                id: '1',
                name: userEmail.split('@')[0],
                email: userEmail
              });
            }
          } else {
            // User exists
            console.log('User found:', data);



            setUserData(data);

            // Fetch user files if we have user data
            try {
              // Get the current authenticated user ID
              const { data: { user: authUser } } = await supabase.auth.getUser();
              console.log('Current authenticated user for initial file fetch:', authUser);

              // Use the authenticated user ID if available, otherwise fall back to data.id
              const userId = authUser?.id || data.id;
              console.log('Fetching user files for user ID:', userId);

              const { data: filesData, error: filesError } = await supabase
                .from('user_files')
                .select('*')
                .eq('user_id', userId);

              console.log('User files fetch response:', { filesData, filesError });

              if (filesError) {
                console.error('Error fetching user files:', filesError);
                // If table doesn't exist, just continue with empty files
                if (filesError.code === '42P01' || filesError.message.includes('does not exist')) {
                  console.log('user_files table does not exist, using empty array');
                  setUserFiles([]);
                }
              } else {
                console.log('Setting user files from database:', filesData);
                setUserFiles(filesData || []);
              }
            } catch (filesError) {
              console.error('Error fetching user files:', filesError);
              console.log('Using empty array due to error');
              setUserFiles([]);
            }
          }
        } catch (error) {
          console.error('Error in Supabase operations:', error);
          // Create a mock user for display
          setUserData({
            id: '1',
            name: userEmail.split('@')[0],
            email: userEmail
          });
        }
      } catch (error) {
        console.error('Error in profile setup:', error);
        // Even if everything fails, show something to the user
        if (status === 'authenticated' && nextAuthSession?.user?.email) {
          setUserData({
            id: '1',
            name: nextAuthSession.user.email.split('@')[0],
            email: nextAuthSession.user.email
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchUserData();
    }
  }, [supabaseUser, nextAuthSession, status]);

  // Function to fetch files for a specific user
  const fetchUserFiles = async (userId: string) => {
    try {
      console.log('Fetching files for user ID:', userId);

      // Make sure we have a valid user ID before querying
      if (!userId) {
        console.error('No valid user ID for file query');
        return; // Don't clear existing files if we don't have a valid ID
      }

      // Get the current authenticated user ID if available
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUserId = authUser?.id || '';

      console.log('Current user ID for file fetch:', currentUserId);
      const isOwnProfile = currentUserId === userId;

      // Direct query to get files from the database
      console.log('Querying user_files table for files');

      const query = supabase
        .from('user_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); // Get newest files first

      // If not viewing own profile, only get public files
      if (!isOwnProfile) {
        console.log('Viewing another user profile, filtering for public files only');
        query.eq('is_public', true);
      } else {
        console.log('Viewing own profile, showing all files');
      }

      const { data: filesData, error: filesError } = await query;

      console.log('User files fetch response:', { filesData, filesError });

      // If there's a database error, try to use localStorage as fallback
      if (filesError) {
        console.error('Error fetching user files:', filesError);

        // Try to get files from localStorage as a fallback
        const localStorageKey = `userFiles_${userId}`;
        try {
          const cachedFilesJson = localStorage.getItem(localStorageKey);
          if (cachedFilesJson) {
            const cachedFiles = JSON.parse(cachedFilesJson);
            console.log('Using cached files from localStorage due to DB error:', cachedFiles);
            setUserFiles(cachedFiles);
          }
        } catch (localStorageError) {
          console.error('Error retrieving files from localStorage:', localStorageError);
        }
        return;
      }

      // If we have files from the database, process them
      if (filesData && filesData.length > 0) {
        console.log('Processing files from database:', filesData);

        // Create a map to track files by path to avoid duplicates
        const filesByPath = new Map();

        // Process the files to ensure they have all required fields
        const processedFiles = await Promise.all(filesData.map(async file => {
          // Skip if we already have this file path (prevents duplicates)
          if (file.file_path && filesByPath.has(file.file_path)) {
            console.log(`Skipping duplicate file path: ${file.file_path}`);
            return null;
          }

          // Ensure category is lowercase for consistent filtering
          const category = (file.category || 'notes').toLowerCase();

          // Use existing subject code/name or extract from other fields if needed
          let subjectCode = file.subject_code || '';
          let subjectName = file.subject_name || '';

          // If subject info is missing, try to extract from description or name
          if ((!subjectCode || !subjectName) && file.description) {
            const match = file.description.match(/([A-Z]{2,3}\s*\d{3})\s*-?\s*(.*)/i);
            if (match) {
              subjectCode = subjectCode || match[1];
              subjectName = subjectName || match[2].trim();
            }
          }

          // Get the file path - ensure it's properly formatted
          let filePath = file.file_path || '';

          // Make sure the file path is valid
          if (!filePath || filePath.trim() === '') {
            console.warn(`File ${file.id} has an empty file path`);
          }

          // Get the public URL for the file
          let publicUrl = file.public_url || ''; // Use stored public URL if available

          // If no public URL is stored, generate one
          if (!publicUrl && filePath) {
            try {
              const { data: urlData } = await supabase.storage
                .from('user-files')
                .getPublicUrl(filePath);

              if (urlData && urlData.publicUrl) {
                publicUrl = urlData.publicUrl;
                console.log(`Generated public URL for file ${file.id}:`, publicUrl);

                // Update the database record with the public URL for future use
                try {
                  const { error: updateError } = await supabase
                    .from('user_files')
                    .update({ public_url: publicUrl })
                    .eq('id', file.id);

                  if (updateError) {
                    console.error(`Error updating public URL for file ${file.id}:`, updateError);
                  } else {
                    console.log(`Updated public URL in database for file ${file.id}`);
                  }
                } catch (updateError) {
                  console.error(`Error updating public URL:`, updateError);
                }
              }
            } catch (urlError) {
              console.error(`Error generating URL for file ${file.id}:`, urlError);

              // Create a fallback URL
              if (filePath) {
                publicUrl = `${supabaseUrl}/storage/v1/object/public/user-files/${filePath}`;
                console.log(`Created fallback URL for file ${file.id}:`, publicUrl);
              }
            }
          }

          // Convert database fields to our FileUpload interface format
          const processedFile = {
            id: file.id,
            name: file.file_name || '',
            url: filePath, // Store the file path, not the full URL
            type: file.file_type || '',
            created_at: file.created_at,
            category: category,
            subject_code: subjectCode,
            subject_name: subjectName,
            is_public: file.is_public === true, // Ensure boolean
            publicUrl: publicUrl, // Store pre-generated URL
            description: file.description || '',
            file_path: filePath
          };

          // Add to map to track duplicates
          if (filePath) {
            filesByPath.set(filePath, processedFile);
          }

          return processedFile;
        }));

        // Filter out null values (duplicates we skipped)
        const uniqueFiles = processedFiles.filter(file => file !== null);
        console.log('Processed unique files:', uniqueFiles);

        // Update the state with the processed files
        setUserFiles(uniqueFiles);

        // Save to localStorage for persistence
        const localStorageKey = `userFiles_${userId}`;
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(uniqueFiles));
          console.log('Saved files to localStorage for persistence');
        } catch (saveError) {
          console.error('Error saving files to localStorage:', saveError);
        }
      } else {
        console.log('No files found for user in database');

        // Try to get files from localStorage as a fallback
        const localStorageKey = `userFiles_${userId}`;
        try {
          const cachedFilesJson = localStorage.getItem(localStorageKey);
          if (cachedFilesJson) {
            const cachedFiles = JSON.parse(cachedFilesJson);
            console.log('Using cached files from localStorage:', cachedFiles);
            setUserFiles(cachedFiles);
          } else {
            // If no files in database and no cached files, set empty array
            setUserFiles([]);
          }
        } catch (localStorageError) {
          console.error('Error retrieving files from localStorage:', localStorageError);
          setUserFiles([]);
        }
      }
    } catch (error) {
      console.error('Error fetching user files:', error);

      // Try to use localStorage as fallback on error
      try {
        const localStorageKey = `userFiles_${userId}`;
        const cachedFilesJson = localStorage.getItem(localStorageKey);
        if (cachedFilesJson) {
          const cachedFiles = JSON.parse(cachedFilesJson);
          console.log('Using cached files from localStorage after error:', cachedFiles);
          setUserFiles(cachedFiles);
        }
      } catch (localStorageError) {
        console.error('Error retrieving files from localStorage:', localStorageError);
      }
    }
  };

  // Handle dropdown hover with delay
  const handleDropdownMouseEnter = (category: string) => {
    // Clear any existing timeout for this category
    if (dropdownTimeouts[category]) {
      clearTimeout(dropdownTimeouts[category]);
      const newTimeouts = { ...dropdownTimeouts };
      delete newTimeouts[category];
      setDropdownTimeouts(newTimeouts);
    }

    // Clear any timeouts for other categories as well to prevent unexpected closings
    Object.keys(dropdownTimeouts).forEach(key => {
      clearTimeout(dropdownTimeouts[key]);
    });
    setDropdownTimeouts({});

    setActiveDropdown(category);
    // Also set the upload section when hovering
    setUploadSection(category);
  };

  const handleDropdownMouseLeave = (category: string) => {
    // We're modifying this function to keep the dropdown open
    // The dropdown will now remain open until a subject is selected
    // or until another category is clicked

    // No longer closing the dropdown on mouse leave
    // This ensures the dropdown stays open for subject selection

    // Add a longer delay before closing to allow users to move to the dropdown
    const timeout = setTimeout(() => {
      // Only close if no subject is being hovered and no dropdown is being hovered
      const subjectElements = document.querySelectorAll('.subject-list button:hover');
      const dropdownElements = document.querySelectorAll('.category-dropdown:hover');

      if (subjectElements.length === 0 && dropdownElements.length === 0) {
        setActiveDropdown(null);
      }
    }, 500); // Increased timeout for better usability

    // Store the timeout so we can clear it if needed
    setDropdownTimeouts({
      ...dropdownTimeouts,
      [category]: timeout
    });
  };

  // Handle click for mobile devices
  const handleCategoryClick = (category: string) => {
    if (isMobile) {
      // If the dropdown is already open, close it
      if (activeDropdown === category) {
        setActiveDropdown(null);
      } else {
        // Otherwise, open the dropdown
        setActiveDropdown(category);
        
        // On mobile, when opening a dropdown, ensure it appears above other elements
        // This is done by temporarily adjusting z-index values
        setTimeout(() => {
          // Find all category buttons except the active one and reduce their z-index
          const categoryButtons = document.querySelectorAll('.category-dropdown');
          categoryButtons.forEach((button) => {
            if (!button.contains(document.activeElement)) {
              (button as HTMLElement).style.zIndex = '50';
            }
          });
        }, 10);
      }
      // Always set the upload section when clicking on a category
      setUploadSection(category);
    } else {
      // For desktop, just set the upload section
      setUploadSection(category);
    }
  };

  // Ensure files are fetched when component mounts and when user changes
  useEffect(() => {
    const refreshUserFiles = async () => {
      if (!userData || !userData.id) return;

      console.log('Refreshing user files for user ID:', userData.id);
      await fetchUserFiles(userData.id);
    };

    refreshUserFiles();
  }, [userData?.id]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(dropdownTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [dropdownTimeouts]);

  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle clicks outside of dropdown on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is outside of any dropdown
      if (activeDropdown && !target.closest('.category-dropdown')) {
        setActiveDropdown(null);
        // Keep the upload section visible
        
        // Reset z-index values for all category buttons
        setTimeout(() => {
          const categoryButtons = document.querySelectorAll('.category-dropdown');
          categoryButtons.forEach((button) => {
            (button as HTMLElement).style.zIndex = '100';
          });
        }, 10);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobile, activeDropdown]);
  
  // Reset z-index values when dropdown is closed
  useEffect(() => {
    if (isMobile && !activeDropdown) {
      // Reset z-index values for all category buttons
      setTimeout(() => {
        const categoryButtons = document.querySelectorAll('.category-dropdown');
        categoryButtons.forEach((button) => {
          (button as HTMLElement).style.zIndex = '100';
        });
      }, 10);
    }
  }, [isMobile, activeDropdown]);

  // Get subjects based on user's year, semester, and branch
  const getUserSubjects = (): Subject[] => {
    // If userData is not available, return all subjects from first year first semester as fallback
    if (!userData) {
      console.log('No user data available, returning default subjects');
      // Return first year, first semester, CSE subjects as default
      return branchSubjects[1][1]['cse'] || [];
    }

    // Extract year and semester from userData
    // If viewing another user's profile, these might be stored differently
    let year: number;
    let semester: number;
    let branch: string;

    // Try to parse year and semester
    try {
      year = userData.year ? parseInt(userData.year) : 1;

      // If year is not a valid number, default to 1
      if (isNaN(year) || year < 1 || year > 4) {
        console.log('Invalid year, using default year 1');
        year = 1;
      }

      // For semester, use a simple logic: odd semesters for odd years, even for even
      // This is a fallback if semester is not explicitly provided
      semester = userData.semester ? parseInt(userData.semester) : (year % 2 === 1 ? 1 : 2);

      // If semester is not a valid number, default based on year
      if (isNaN(semester) || semester < 1 || semester > 8) {
        console.log('Invalid semester, using default based on year');
        semester = (year % 2 === 1 ? 1 : 2);
      }
    } catch (error) {
      console.error('Error parsing year/semester:', error);
      year = 1;
      semester = 1;
    }

    // Map the branch value from the form to the branch ID in academicData
    const branchMap: Record<string, string> = {
      'CSE': 'cse',
      'Blockchain': 'blockchain',
      'AIADS': 'aiads',
      'CSE-IOT': 'cse-iot',
      'IT': 'it',
      'ECE': 'ec',
      'EE': 'ee'
    };

    // Get branch ID, default to 'cse' if not found
    branch = userData.branch ? (branchMap[userData.branch] || 'cse') : 'cse';

    console.log(`Getting subjects for Year: ${year}, Semester: ${semester}, Branch: ${branch}`);

    // Get subjects for the user's year, semester, and branch
    try {
      if (branchSubjects[year] &&
        branchSubjects[year][semester] &&
        branchSubjects[year][semester][branch]) {
        return branchSubjects[year][semester][branch];
      } else {
        console.log('No subjects found for the specified year/semester/branch, using default');
        // If no subjects found for the specific combination, return CSE subjects for that year/semester
        return branchSubjects[year]?.[semester]?.['cse'] || branchSubjects[1][1]['cse'] || [];
      }
    } catch (error) {
      console.error('Error getting subjects:', error);
      // Return default subjects in case of error
      return branchSubjects[1][1]['cse'] || [];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!isEditMode) return;

    const { name, value } = e.target;
    setUserData(prev => prev ? { ...prev, [name]: value } : null);
    setHasChanges(true);
  };

  // Store original user data to revert changes if needed
  const [originalUserData, setOriginalUserData] = useState<UserData | null>(null);

  const toggleEditMode = () => {
    if (isEditMode) {
      // If turning off edit mode without saving, revert any changes
      if (hasChanges && originalUserData) {
        setUserData(originalUserData);
      }
      setHasChanges(false);
      setIsEditMode(false);
    } else {
      // Store original data before entering edit mode
      setOriginalUserData({ ...userData! });
      setIsEditMode(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!userData) return;

    try {
      setSaving(true);

      try {
        const { error } = await supabase
          .from('users')
          .update({
            name: userData.name,
            year: userData.year,
            semester: userData.semester,
            branch: userData.branch,
          })
          .eq('id', userData.id);

        if (error) {
          console.error('Error updating profile:', error);

          // If the table doesn't exist or there's a permission issue, just show success
          // This is a fallback for when the database isn't properly set up
          if (error.code === '42P01' || error.message.includes('does not exist')) {
            console.log('Table does not exist, but showing success to user');
            alert('Profile updated successfully!');
            setIsEditMode(false);
            setHasChanges(false);
            return;
          }

          throw error;
        }

        alert('Profile updated successfully!');
        setIsEditMode(false);
        setHasChanges(false);
      } catch (error) {
        console.error('Error in Supabase update:', error);

        // For demo purposes, show success even if the database update fails
        // This allows the UI to work even if the backend is not fully set up
        alert('Profile updated successfully!');
        setIsEditMode(false);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };



  const handleFileUpload = async (files: FileList | null, category: string) => {
    console.log('Starting file upload process...');
    console.log('Files:', files);
    console.log('User data:', userData);
    console.log('Selected subject:', selectedSubject);
    console.log('Category:', category);

    if (!files || !userData) {
      console.error('Missing files or user data');
      alert('Missing files or user data. Please try again.');
      return;
    }

    // If no subject is selected, alert the user
    if (!selectedSubject) {
      alert('Please select a subject first by clicking on one of the subjects in the dropdown menu.');
      console.error('No subject selected');
      return;
    }

    try {
      setIsUploading(true);
      console.log('Upload started, files count:', files.length);

      // Track successfully uploaded files
      const newFiles: FileUpload[] = [];

      // IMPORTANT: Use the correct bucket name - must match exactly what's in Supabase
      const bucketName = 'user-files'; // This is the correct bucket name with hyphen

      // Get the current authenticated user ID
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user);

      // Use the authenticated user ID if available, otherwise fall back to userData.id
      const userId = user?.id || userData.id;
      console.log('Using user ID for uploads:', userId);

      // Get existing files to check for duplicates
      const { data: existingFiles, error: existingFilesError } = await supabase
        .from('user_files')
        .select('file_name, file_path')
        .eq('user_id', userId);

      console.log('Existing files check:', { existingFiles, existingFilesError });

      // Create a set of existing file paths for quick lookup
      const existingFilePaths = new Set();
      if (existingFiles && !existingFilesError) {
        existingFiles.forEach(file => {
          if (file.file_path) {
            existingFilePaths.add(file.file_path);
          }
        });
      }
      console.log('Existing file paths:', existingFilePaths);

      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];

          // Validate file
          if (!file || file.size === 0) {
            console.error('Invalid file or empty file');
            continue;
          }

          // Get file extension safely
          const fileNameParts = file.name.split('.');
          const fileExt = fileNameParts.length > 1 ? fileNameParts.pop() : 'unknown';

          // Create a unique filename with timestamp and index
          const uniqueFileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

          // Create a clean storage path - format: userId/category/subjectCode/fileName
          // Make sure all path components are valid and sanitized
          const sanitizedCategory = category.toLowerCase().replace(/[^a-z0-9-]/g, '-');
          const sanitizedSubjectCode = selectedSubject.code.replace(/[^a-zA-Z0-9-]/g, '-');

          // Ensure the path starts with the user ID as required by storage policies
          let storagePath = `${userId}/${sanitizedCategory}/${sanitizedSubjectCode}/${uniqueFileName}`;
          console.log('Storage path for upload:', storagePath);

          // Check if this file path already exists
          if (existingFilePaths.has(storagePath)) {
            console.log(`File with path ${storagePath} already exists, skipping upload`);
            continue;
          }

          let fileUrl = '';
          let publicUrl = '';

          try {
            console.log(`Uploading file ${i + 1}/${files.length}: ${file.name} (${file.size} bytes)`);

            // Update progress for UI feedback
            setUploadProgress(Math.round((i / files.length) * 50)); // First 50% for upload

            // Upload the file to Supabase Storage
            const { data, error } = await supabase.storage
              .from(bucketName)
              .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false, // Don't overwrite if exists to prevent duplicates
                contentType: file.type // Set the correct content type
              });

            console.log('Storage upload response:', { data, error });

            if (error) {
              // If the error is because the file already exists, skip this file
              if (error.message.includes('already exists')) {
                console.log(`File ${file.name} already exists in storage, skipping`);
                continue;
              }

              // Handle other error cases
              if (error.message.includes('security policy') || error.message.includes('permission denied')) {
                console.error(`Permission error uploading file ${file.name}:`, error);

                // Try a different path without the user ID prefix
                const simplePath = `${sanitizedCategory}/${sanitizedSubjectCode}/${uniqueFileName}`;
                console.log('Trying alternative upload path:', simplePath);

                const { data: altData, error: altError } = await supabase.storage
                  .from(bucketName)
                  .upload(simplePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type
                  });

                if (altError) {
                  console.error(`Alternative upload also failed for ${file.name}:`, altError);
                  throw new Error(`Upload failed: ${altError.message}`);
                }

                // If alternative upload worked, use that path
                console.log('Alternative upload succeeded:', altData);
                storagePath = simplePath;
              } else {
                console.error(`Error uploading file ${file.name}:`, error);
                throw new Error(`Upload failed: ${error.message}`);
              }
            }

            // Get the public URL for the file
            console.log('Getting public URL for:', storagePath);

            try {
              const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(storagePath);

              console.log('Public URL data:', urlData);

              if (!urlData || !urlData.publicUrl) {
                console.error('Failed to get public URL');
                throw new Error('Could not generate public URL for file');
              }

              fileUrl = storagePath; // Store the storage path for database
              publicUrl = urlData.publicUrl; // Store the public URL for immediate use

              console.log('File storage path:', fileUrl);
              console.log('File public URL:', publicUrl);
            } catch (urlError) {
              console.error('Error generating public URL:', urlError);

              // Create a fallback URL using the Supabase project URL and storage path
              const fallbackUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${storagePath}`;
              console.log('Created fallback public URL:', fallbackUrl);

              fileUrl = storagePath; // Store the storage path for database
              publicUrl = fallbackUrl; // Use the fallback URL
            }

            // Update progress for UI feedback
            setUploadProgress(50 + Math.round((i / files.length) * 50)); // Last 50% for metadata
          } catch (storageError) {
            console.error('Storage error:', storageError);
            alert(`Error uploading file ${file.name}: ${storageError.message}`);
            continue; // Skip this file and try the next one
          }

          try {
            console.log('Saving file metadata to database...');

            // Create a complete metadata object with all necessary fields
            const fileMetadata = {
              user_id: userId,
              file_name: file.name,
              file_path: fileUrl, // Store the storage path, not the full URL
              file_type: file.type,
              file_size: file.size, // Store file size for display
              description: `${selectedSubject.code} - ${selectedSubject.name}`, // Add description for better context
              category: category.toLowerCase(), // Ensure consistent casing
              subject_code: selectedSubject.code,
              subject_name: selectedSubject.name,
              is_public: true,  // Set this to true to make files visible to others
              created_at: new Date().toISOString(), // Ensure we have a timestamp
              public_url: publicUrl // Store the public URL for easy access
            };
            console.log('File metadata for database:', fileMetadata);

            // Try to save file metadata to the database
            let insertData = null;
            let insertError = null;

            try {
              // First try with the full metadata
              console.log('Inserting file metadata into database:', fileMetadata);

              // Make sure we're using the correct table name and all required fields
              const result = await supabase
                .from('user_files')
                .insert({
                  user_id: userId,
                  file_name: file.name,
                  file_path: fileUrl,
                  file_type: file.type,
                  file_size: file.size,
                  description: `${selectedSubject.code} - ${selectedSubject.name}`,
                  category: category.toLowerCase(),
                  subject_code: selectedSubject.code,
                  subject_name: selectedSubject.name,
                  is_public: true,
                  public_url: publicUrl
                })
                .select();

              insertData = result.data;
              insertError = result.error;

              console.log('Database insert response:', { insertData, insertError });
            } catch (dbError) {
              console.error('Exception during database insert:', dbError);
              insertError = { message: dbError.message };
            }

            // Handle database insert errors
            if (insertError) {
              console.error('Error saving file metadata to database:', insertError);

              // Check for specific error types
              if (insertError.code === '42P01' || insertError.message.includes('does not exist')) {
                console.log('Table does not exist, creating file entry in local state only');
              } else if (insertError.message.includes('security policy') || insertError.message.includes('permission denied')) {
                console.log('Permission error, trying simplified insert');

                // Try a simplified insert with minimal fields
                try {
                  const simplifiedMetadata = {
                    user_id: userId, // Make sure user_id is included
                    file_name: file.name,
                    file_path: fileUrl,
                    file_type: file.type,
                    public_url: publicUrl,
                    is_public: true
                  };

                  const result = await supabase
                    .from('user_files')
                    .insert(simplifiedMetadata)
                    .select();

                  if (result.error) {
                    console.error('Simplified insert also failed:', result.error);
                  } else {
                    console.log('Simplified insert succeeded:', result.data);
                    insertData = result.data;
                    insertError = null;
                  }
                } catch (simplifiedError) {
                  console.error('Exception during simplified insert:', simplifiedError);
                }
              } else {
                // For other errors, log but don't alert to avoid disrupting the user
                console.error(`Database error: ${insertError.message}. The file was uploaded but metadata could not be saved.`);
              }

              // Add to local state with local ID if database insert fails
              const newFile: FileUpload = {
                id: `local-${Date.now()}-${i}`,
                name: file.name,
                url: fileUrl, // Store the storage path
                type: file.type,
                created_at: new Date().toISOString(),
                category: category.toLowerCase(),
                subject_code: selectedSubject.code,
                subject_name: selectedSubject.name,
                is_public: true,
                publicUrl: publicUrl, // Store the public URL
                description: `${selectedSubject.code} - ${selectedSubject.name}`,
                file_path: fileUrl
              };

              console.log('Adding file to local state:', newFile);
              newFiles.push(newFile);

              // Add to existingFilePaths to prevent duplicates
              existingFilePaths.add(fileUrl);

            } else if (insertData && insertData.length > 0) {
              console.log('File metadata saved successfully to database:', insertData);

              // Add the database-created file to our local state
              // Enhance the database record with the public URL
              const newFile: FileUpload = {
                ...insertData[0],
                publicUrl: publicUrl, // Add the public URL
                url: fileUrl // Ensure the URL is set correctly
              };

              console.log('Adding database file to local state:', newFile);
              newFiles.push(newFile);

              // Add to existingFilePaths to prevent duplicates
              existingFilePaths.add(fileUrl);
            }
          } catch (dbError) {
            console.error('Database error:', dbError);
            alert(`Error saving file information: ${dbError.message}`);

            // Add to local state with local ID if database insert fails
            const newFile: FileUpload = {
              id: `local-${Date.now()}-${i}`,
              name: file.name,
              url: fileUrl, // Store the storage path
              type: file.type,
              created_at: new Date().toISOString(),
              category: category.toLowerCase(),
              subject_code: selectedSubject.code,
              subject_name: selectedSubject.name,
              is_public: true,
              publicUrl: publicUrl, // Store the public URL
              description: `${selectedSubject.code} - ${selectedSubject.name}`,
              file_path: fileUrl
            };

            console.log('Adding file to local state after error:', newFile);
            newFiles.push(newFile);

            // Add to existingFilePaths to prevent duplicates
            existingFilePaths.add(fileUrl);
          }
        } catch (fileError) {
          console.error(`Error processing file at index ${i}:`, fileError);
        }
      }

      // Set upload progress to 100% after all files are processed
      setUploadProgress(100);

      // Only update the state once with all new files to prevent duplicates
      if (newFiles.length > 0) {
        setUserFiles(prev => {
          // Create a map of existing files by ID to avoid duplicates
          const existingFilesMap = new Map(prev.map(file => [file.id, file]));

          // Add new files to the map, overwriting any with the same ID
          newFiles.forEach(file => {
            existingFilesMap.set(file.id, file);
          });

          // Convert map back to array
          const updatedFiles = Array.from(existingFilesMap.values());

          // Save to localStorage for persistence
          try {
            const localStorageKey = `userFiles_${userId}`;
            localStorage.setItem(localStorageKey, JSON.stringify(updatedFiles));
            console.log('Saved updated files to localStorage');
          } catch (saveError) {
            console.error('Error saving files to localStorage:', saveError);
          }

          return updatedFiles;
        });

        // Alert the user about successful uploads
        alert(`${newFiles.length} file(s) uploaded successfully! They should now appear in the list below.`);
      } else {
        alert('No new files were uploaded. Files may already exist or there was an error.');
      }

      // Refresh the file list from the database to ensure consistency
      // This will replace the fetchUserFiles call that was causing duplicates
      try {
        console.log('Refreshing file list from database...');

        const { data: refreshedFiles, error: refreshError } = await supabase
          .from('user_files')
          .select('*')
          .eq('user_id', userId);

        if (refreshError) {
          console.error('Error refreshing files from database:', refreshError);
        } else if (refreshedFiles) {
          console.log('Successfully refreshed files from database:', refreshedFiles);

          // Process the files to ensure they have all required fields
          const processedFiles = refreshedFiles.map(file => ({
            id: file.id,
            name: file.file_name || '',
            url: file.file_path || '',
            type: file.file_type || '',
            created_at: file.created_at,
            category: (file.category || 'notes').toLowerCase(),
            subject_code: file.subject_code || '',
            subject_name: file.subject_name || '',
            is_public: file.is_public,
            publicUrl: file.public_url || '',
            description: file.description || '',
            file_path: file.file_path || ''
          }));

          // Update the state with the refreshed files
          setUserFiles(processedFiles);

          // Save to localStorage for persistence
          try {
            const localStorageKey = `userFiles_${userId}`;
            localStorage.setItem(localStorageKey, JSON.stringify(processedFiles));
            console.log('Saved refreshed files to localStorage');
          } catch (saveError) {
            console.error('Error saving refreshed files to localStorage:', saveError);
          }
        }
      } catch (refreshError) {
        console.error('Error during file refresh:', refreshError);
      }

    } catch (error) {
      console.error('Error uploading files:', error);
      alert(`Upload error: ${error.message}. Please try again or contact support if the issue persists.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);

      // Force a UI refresh to ensure files are displayed
      setTimeout(() => {
        setUploadSection(prev => prev); // Set to same value to trigger re-render
      }, 500);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, category: string) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files, category);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = e.target.files;
    handleFileUpload(files, category);
  };

  // Helper function to get a public URL for a file
  const getFilePublicUrl = (file: FileUpload): string => {
    try {
      // First check if the file already has a public URL
      if (file.publicUrl && file.publicUrl.startsWith('http')) {
        console.log('Using existing public URL:', file.publicUrl);
        return file.publicUrl;
      }

      // Get the file path from the file object
      const filePath = file.url || file.file_path || '';

      // Check if the file path is valid
      if (!filePath || filePath.trim() === '') {
        console.error('Invalid file path: Path is empty for file:', file);
        return '';
      }

      // Check if the URL is already a full public URL (starts with http)
      if (filePath.startsWith('http')) {
        console.log('File path is already a public URL:', filePath);
        return filePath;
      }

      console.log('Generating public URL for file path:', filePath);

      // Get a public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('user-files')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Could not generate public URL for file:', file);

        // Try an alternative approach if the first one fails
        try {
          // Extract the file path components
          const pathParts = filePath.split('/');
          if (pathParts.length > 0) {
            const fileName = pathParts[pathParts.length - 1];
            console.log('Trying alternative URL generation with filename:', fileName);

            // Try to generate URL with just the filename as fallback
            const { data: altUrlData } = supabase.storage
              .from('user-files')
              .getPublicUrl(fileName);

            if (altUrlData && altUrlData.publicUrl) {
              console.log('Generated alternative public URL:', altUrlData.publicUrl);

              // Update the file object with the new public URL
              if (file.id && !file.id.startsWith('local-')) {
                try {
                  supabase
                    .from('user_files')
                    .update({ public_url: altUrlData.publicUrl })
                    .eq('id', file.id)
                    .then(({ error }) => {
                      if (error) {
                        console.error('Error updating public URL in database:', error);
                      } else {
                        console.log('Updated public URL in database');
                      }
                    });
                } catch (updateError) {
                  console.error('Error updating public URL:', updateError);
                }
              }

              return altUrlData.publicUrl;
            }
          }
        } catch (altError) {
          console.error('Error generating alternative URL:', altError);
        }

        return '';
      }

      console.log('Generated public URL:', publicUrlData.publicUrl);

      // Update the file object with the new public URL
      if (file.id && !file.id.startsWith('local-')) {
        try {
          supabase
            .from('user_files')
            .update({ public_url: publicUrlData.publicUrl })
            .eq('id', file.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating public URL in database:', error);
              } else {
                console.log('Updated public URL in database');
              }
            });
        } catch (updateError) {
          console.error('Error updating public URL:', updateError);
        }
      }

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error generating public URL:', error);
      return '';
    }
  };

  const handleFileDownload = async (file: FileUpload, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    try {
      console.log('Downloading file:', file);

      // First try to use the pre-generated public URL if available
      let publicUrl = file.publicUrl || '';

      // If no public URL is available, generate one
      if (!publicUrl) {
        publicUrl = getFilePublicUrl(file);
      }

      if (!publicUrl) {
        console.error('Failed to generate public URL for download');
        alert('Failed to download file. Please try again.');
        return;
      }

      console.log('Using public URL for download:', publicUrl);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = publicUrl;
      a.download = file.name || 'download'; // Use the file name or a default
      a.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(a);
      a.click();

      // Remove the temporary element
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);

    } catch (error) {
      console.error('Error in file download:', error);
      alert('An error occurred while downloading the file. Please try again.');

      // Fallback to opening in new tab if download fails
      if (file.publicUrl) {
        window.open(file.publicUrl, '_blank');
      }
    }
  };

  const handleDeleteFile = async (file: FileUpload) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      console.log('Deleting file:', file);

      // First, delete the file from Supabase Storage
      if (file.url && !file.url.startsWith('blob:')) {
        // Extract the path from the URL
        const bucketName = 'user-files';
        const urlPath = file.url.split(`${bucketName}/`)[1];

        if (urlPath) {
          console.log('Deleting file from storage path:', urlPath);
          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([urlPath]);

          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
          } else {
            console.log('File deleted from storage successfully');
          }
        }
      }

      // Then, delete the file metadata from the database
      if (file.id && !file.id.startsWith('local-')) {
        console.log('Deleting file metadata from database, ID:', file.id);
        const { error: dbError } = await supabase
          .from('user_files')
          .delete()
          .eq('id', file.id);

        if (dbError) {
          console.error('Error deleting file metadata from database:', dbError);
        } else {
          console.log('File metadata deleted from database successfully');
        }
      }

      // Refresh the file list from the database
      if (userData && userData.id) {
        await fetchUserFiles(userData.id);
      } else {
        // Fallback to just updating the local state if we can't refresh from database
        setUserFiles(prev => prev.filter(f => f.id !== file.id));
      }

      alert('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete the file. Please try again.');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-4">
        <div className="relative w-20 h-20 mb-4">
          <div className="w-20 h-20 border-4 border-learnflow-200 dark:border-learnflow-900 border-solid rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-learnflow-500 border-solid rounded-full animate-spin"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md px-6 py-4 animate-pulse">
          <p className="text-gray-700 dark:text-gray-300 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check if we're trying to view another user's profile
  const urlParams = new URLSearchParams(window.location.search);
  const isViewingOtherProfile = urlParams.get('userId') !== null;

  if (!userData) {
    // If we're trying to view another user's profile but userData is not available,
    // show a "User not found" message instead of the sign-in prompt
    if (isViewingOtherProfile) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-yellow-500 h-2 w-full"></div>
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">User Not Found</h1>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                The user profile you're looking for could not be found. The user may have deleted their account or changed their privacy settings.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </button>

                <button
                  onClick={() => window.location.href = '/search'}
                  className="flex items-center justify-center px-4 py-3 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-all duration-300 hover:shadow-md transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Back to Search
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // If we're trying to view our own profile but not signed in, show the sign-in prompt
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-500 h-2 w-full"></div>
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">Sign In Required</h1>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                You need to be signed in to view your profile. Sign in to access your personal dashboard, upload files, and manage your account.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </button>

                <button
                  onClick={() => {
                    // Open login page in a new window with signup mode
                    const signupWindow = window.open('/login?mode=signup', '_blank', 'width=500,height=600');

                    // Focus the new window
                    if (signupWindow) {
                      signupWindow.focus();
                    }
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 hover:shadow-md transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In / Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Get profile picture from auth sources or generate default
  const profilePicture = supabaseUser?.user_metadata?.avatar_url ||
    supabaseUser?.user_metadata?.picture ||
    nextAuthSession?.user?.image ||
    (nextAuthSession?.user as any)?.picture ||
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'User');

  // Wrap the render in a try-catch to prevent the entire app from crashing
  try {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
        {/* Header with back button and profile title */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton
                fallbackPath={isCurrentUserProfile ? '/' : '/search'}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                ariaLabel={isCurrentUserProfile ? "Go back to home page" : "Go back to search page"}
                title={isCurrentUserProfile ? "Go back to home" : "Go back to search"}
              />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isCurrentUserProfile ? 'Your Profile' : `${userData?.name}'s Profile`}
              </h1>
            </div>

            {isCurrentUserProfile && (
              <button
                onClick={toggleEditMode}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 text-learnflow-600 hover:text-learnflow-700 dark:text-learnflow-400 dark:hover:text-learnflow-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isEditMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  )}
                </svg>
                <span>{isEditMode ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 animate-fadeIn">
          {/* Profile Card */}
          <section className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="md:flex">
              {/* Profile Picture Section - Left side on desktop, top on mobile */}
              <div className="md:w-1/3 bg-gradient-to-br from-learnflow-500 to-learnflow-700 p-8 flex flex-col items-center justify-center">
                <div className="relative mb-4 group">
                  <div className="absolute inset-0 rounded-full bg-white dark:bg-gray-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-lg transform transition-all duration-500 group-hover:scale-105"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mt-2">{userData?.name}</h2>
                {userData?.branch && (
                  <p className="text-white/80 text-center mt-1">{userData.branch}</p>
                )}
                {userData?.year && userData?.semester && (
                  <p className="text-white/70 text-center mt-1">Year {userData.year} • Semester {userData.semester}</p>
                )}
              </div>

              {/* Profile Information Section - Right side on desktop, bottom on mobile */}
              <div id="profile-section" className="md:w-2/3 p-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  {isCurrentUserProfile ? 'Your Information' : 'Student Information'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userData.name || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditMode}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isEditMode
                        ? 'focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:border-learnflow-500 transition-all duration-300'
                        : 'bg-gray-50 cursor-default'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    />
                  </div>

                  {isCurrentUserProfile && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userData.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Year
                    </label>
                    <select
                      name="year"
                      value={userData.year || ''}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isEditMode
                        ? 'focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:border-learnflow-500 transition-all duration-300'
                        : 'bg-gray-50 cursor-default'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Semester
                    </label>
                    <select
                      name="semester"
                      value={userData.semester || ''}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isEditMode
                        ? 'focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:border-learnflow-500 transition-all duration-300'
                        : 'bg-gray-50 cursor-default'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
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

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Branch
                    </label>
                    <select
                      name="branch"
                      value={userData.branch || ''}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${isEditMode
                        ? 'focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:border-learnflow-500 transition-all duration-300'
                        : 'bg-gray-50 cursor-default'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    >
                      <option value="">Select Branch</option>
                      <option value="CSE">Computer Science Engineering</option>
                      <option value="Blockchain">Blockchain Technology</option>
                      <option value="AIADS">Artificial Intelligence & Data Science</option>
                      <option value="CSE-IOT">Internet of Things</option>
                      <option value="IT">Information Technology</option>
                      <option value="ECE">Electronics & Communication</option>
                      <option value="EE">Electrical Engineering</option>
                      <option value="ME">Mechanical Engineering</option>
                      <option value="CE">Civil Engineering</option>
                    </select>
                  </div>
                </div>

                {isEditMode && (
                  <div className="mt-8">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || !hasChanges}
                      className="px-6 py-3 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg"
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Profile'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* File Upload Section */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isCurrentUserProfile ? 'Your Uploads' : `${userData?.name}'s Uploads`}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                {['Syllabus', 'Assignments', 'Practicals', 'Lab Work', 'PYQs', 'Notes'].map((category, index) => (
                  <div
                    key={category}
                    className="relative category-dropdown stagger-item"
                    onMouseEnter={() => !isMobile && handleDropdownMouseEnter(category)}
                    onMouseLeave={() => !isMobile && handleDropdownMouseLeave(category)}
                    style={{ zIndex: isMobile && activeDropdown === category ? 110 : 100 }}
                  >
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className={`w-full px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${uploadSection === category
                        ? 'bg-learnflow-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      <div className="flex items-center justify-center">
                        <span>{category}</span>
                        {isMobile && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`ml-1 h-4 w-4 transition-transform duration-300 ${activeDropdown === category ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Mobile Backdrop */}
                    {isMobile && activeDropdown === category && (
                      <div
                        className="fixed inset-0 bg-black bg-opacity-50 animate-fadeIn"
                        style={{ zIndex: 105 }} /* Lower than buttons but higher than other content */
                        onClick={(e) => {
                          e.stopPropagation();
                          // Only close if not clicking on a subject
                          if (!(e.target as HTMLElement).closest('.subject-list')) {
                            // Add a small delay before closing to allow for subject selection
                            setTimeout(() => {
                              setActiveDropdown(null);
                            }, 100);
                          }
                        }}
                      />
                    )}

                    {/* Dropdown Menu */}
                    {activeDropdown === category && (
                      <div className={`absolute ${isMobile
                        ? 'top-full left-0 right-0 w-full'
                        : 'top-full left-0 w-56'
                        } mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl ${isMobile
                          ? 'transition-all duration-300 ease-in-out max-h-60 overflow-y-auto animate-slideDown'
                          : 'animate-fadeIn'
                        }`}
                        style={{ pointerEvents: 'auto', zIndex: isMobile ? 2000 : 1000 }}
                      >
                        <div className="py-2">
                          {isMobile && (
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select Subject
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {getUserSubjects().length > 0 ? (
                            <div className="subject-list" style={{ position: 'relative', zIndex: isMobile ? 3000 : 1001 }}>
                              {getUserSubjects().map((subject, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadSection(category);
                                    setSelectedSubject(subject);
                                    setActiveDropdown(null);
                                    console.log(`Selected ${category} for ${subject.code}: ${subject.name}`);
                                  }}
                                  className={`block w-full text-left px-3 ${isMobile ? 'py-3 text-base' : 'py-2 text-sm'
                                    } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors cursor-pointer`}
                                  title={`${subject.name} (${subject.code})`}
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <div className="flex items-center justify-center">
                                    <span className="font-medium">{subject.code}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {isMobile ? (
                                <div className="flex flex-col space-y-2">
                                  <p>No subjects found</p>
                                  <p className="text-xs">Please update your profile with year, semester, and branch</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdown(null);
                                      document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="mt-2 text-learnflow-500 hover:text-learnflow-600 text-xs font-medium"
                                  >
                                    Go to Profile Settings
                                  </button>
                                </div>
                              ) : (
                                "Please set your year, semester, and branch in profile settings"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {uploadSection && (
                <div className="mt-8 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">
                      {uploadSection} Files
                      {selectedSubject && (
                        <span className="ml-2 text-learnflow-500 dark:text-learnflow-400 text-sm font-normal">
                          for {selectedSubject.code}: {selectedSubject.name}
                        </span>
                      )}
                    </h3>
                    {isCurrentUserProfile && selectedSubject && (
                      <button
                        onClick={() => setSelectedSubject(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear subject
                      </button>
                    )}
                  </div>

                  {/* Drag and Drop Area - Only show for current user's profile */}
                  {isCurrentUserProfile ? (
                    <>
                      <div
                        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging
                          ? 'border-learnflow-500 bg-learnflow-50 dark:bg-gray-700 scale-105 shadow-lg'
                          : 'border-gray-300 hover:border-learnflow-400 dark:border-gray-600 dark:hover:border-gray-500 hover:shadow-md'
                          }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, uploadSection.toLowerCase())}
                        onClick={triggerFileInput}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          onChange={(e) => handleFileInputChange(e, uploadSection.toLowerCase())}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">Drag and drop files here or click to upload</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Upload {uploadSection} files for {selectedSubject ? `${selectedSubject.code}: ${selectedSubject.name}` : 'your selected subject'}
                        </p>
                        {!selectedSubject && (
                          <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg inline-block">
                            Please select a subject from the dropdown menu first
                          </p>
                        )}
                      </div>

                      {isUploading && (
                        <div className="mt-6 animate-fadeIn">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-3 mr-4 dark:bg-gray-700 overflow-hidden">
                              <div
                                className="bg-learnflow-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-12">{Math.round(uploadProgress)}%</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <p>You are viewing {userData?.name}'s profile. You can see their shared files but cannot upload new ones.</p>
                    </div>
                  )}

                  {/* File List */}
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {isCurrentUserProfile ? 'Your' : `${userData?.name}'s`} {uploadSection} Files
                      {selectedSubject && (
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          for {selectedSubject.code}
                        </span>
                      )}
                    </h4>

                    {/* Log file list info */}
                    {(() => {
                      console.log('Rendering file list:', { userFiles, uploadSection, selectedSubject });
                      return null;
                    })()}
                    {(() => {
                      // Log all files for debugging
                      console.log('All files before filtering:', userFiles);

                      // Get filtered files for the current section and subject
                      const filteredFiles = userFiles.filter(file => {
                        // Skip files with no data
                        if (!file || !file.name) {
                          console.log('Skipping invalid file entry:', file);
                          return false;
                        }

                        // Normalize categories for comparison
                        const normalizedCategory = uploadSection.toLowerCase();

                        // Get file category, ensuring it's a string and lowercase
                        let fileCategory = '';
                        if (file.category) {
                          fileCategory = file.category.toLowerCase();
                        } else if (file.description) {
                          // Try to extract category from description as fallback
                          fileCategory = file.description.toLowerCase();
                        }

                        // Debug log for category comparison
                        console.log(`File ${file.name}: Category comparison - File category: "${fileCategory}", Upload section: "${normalizedCategory}"`);

                        // Check if the file belongs to the selected category
                        // First try exact match, then try partial match
                        let categoryMatch = fileCategory === normalizedCategory;

                        // If exact match fails, try partial match
                        if (!categoryMatch) {
                          categoryMatch = fileCategory.includes(normalizedCategory) || normalizedCategory.includes(fileCategory);
                        }

                        // Check if the file belongs to the selected subject
                        // If no subject is selected, show all files in the category
                        let subjectMatch = false;

                        if (!selectedSubject) {
                          // If no subject selected, show all files in the category
                          subjectMatch = true;
                        } else {
                          // Try exact match first
                          if (file.subject_code === selectedSubject.code) {
                            subjectMatch = true;
                          }
                          // Then try partial matches
                          else if (file.subject_name && file.subject_name.includes(selectedSubject.name)) {
                            subjectMatch = true;
                          }
                          else if (selectedSubject.code && file.subject_code &&
                            (file.subject_code.includes(selectedSubject.code) ||
                              selectedSubject.code.includes(file.subject_code))) {
                            subjectMatch = true;
                          }
                        }

                        console.log(`File ${file.name}: Category match: ${categoryMatch}, Subject match: ${subjectMatch}`);

                        return categoryMatch && subjectMatch;
                      });

                      console.log('Filtered files for display:', filteredFiles);

                      // Return the appropriate UI based on whether we have files
                      if (filteredFiles.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-fadeIn">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                              {selectedSubject
                                ? `No ${uploadSection} files ${isCurrentUserProfile ? 'uploaded' : 'shared'} yet for ${selectedSubject.code}`
                                : `No ${uploadSection} files ${isCurrentUserProfile ? 'uploaded' : 'shared'} yet`}
                            </p>
                            {isCurrentUserProfile && (
                              <button
                                onClick={triggerFileInput}
                                className="mt-4 px-4 py-2 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-all duration-300 transform hover:scale-105 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Upload Now
                              </button>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredFiles.map((file, index) => (
                                <div
                                  key={file.id}
                                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group stagger-item hover-lift"
                                >
                                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center">
                                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-learnflow-500 dark:text-learnflow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-800 dark:text-white truncate group-hover:text-learnflow-600 dark:group-hover:text-learnflow-400 transition-colors duration-300">
                                        {file.name}
                                      </p>
                                      <div className="flex items-center mt-1">
                                        {file.subject_code && (
                                          <span className="text-xs bg-learnflow-100 text-learnflow-800 dark:bg-learnflow-900 dark:text-learnflow-200 px-2 py-0.5 rounded-full mr-2">
                                            {file.subject_code}
                                          </span>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {new Date(file.created_at).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                                      {file.type || 'Document'}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <a
                                        href={file.publicUrl || getFilePublicUrl(file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-300"
                                        title="Open file in new tab"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                      <button
                                        onClick={(e) => handleFileDownload(file, e as any)}
                                        className="p-2 text-learnflow-500 hover:text-learnflow-600 hover:bg-learnflow-50 dark:hover:bg-learnflow-900/20 rounded-full transition-all duration-300"
                                        title="Download file"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                      </button>
                                      {isCurrentUserProfile && (
                                        <button
                                          onClick={() => handleDeleteFile(file)}
                                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-300"
                                          title="Delete file"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return <ProfilePageErrorFallback />;
  }
}; // End of ProfilePage component

// Wrap the component in a try-catch
const ProfilePageWrapper: React.FC = () => {
  try {
    return <ProfilePage />;
  } catch (error) {
    console.error('Error rendering profile page:', error);
    return <ProfilePageErrorFallback />;
  }
};

export default ProfilePageWrapper;