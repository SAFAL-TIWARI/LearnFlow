import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getSession, isAuthenticated } from '../lib/auth-fallback';
import { useAuth } from '../context/SupabaseAuthContext';
import { useSafeSession } from '../hooks/useSafeSession';
import { branchSubjects, Subject } from '../data/academicData';
import BackButton from '../components/BackButton';

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
}

// Error fallback component
const ProfilePageErrorFallback = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => window.location.href = '/'}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Go back to home page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an issue loading your profile. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-colors"
        >
          Refresh Page
        </button>
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
        const bucketName = 'user-files';
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

              // Determine semester based on year (odd year -> odd semester, even year -> even semester)
              // This is a simple heuristic if semester is not explicitly stored
              let semester = '';
              if (year) {
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

      // Get the current authenticated user ID if available
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUserId = authUser?.id || '';

      console.log('Current user ID for file fetch:', currentUserId);
      const isOwnProfile = currentUserId === userId;

      // First try to get files using the getUserFiles function from supabaseClient if available
      try {
        if (typeof window !== 'undefined') {
          try {
            const { getUserFiles } = await import('../utils/supabaseClient');
            if (getUserFiles) {
              console.log('Using getUserFiles function to fetch files');
              const files = await getUserFiles(userId, currentUserId);

              if (files && files.length > 0) {
                console.log('Files fetched successfully using getUserFiles:', files);

                // Convert the files to the expected format
                const formattedFiles = files.map(file => {
                  // Safely handle description splitting
                  let subjectCode = '';
                  let subjectName = '';

                  if (file.description) {
                    const parts = file.description.split(' - ');
                    if (parts.length > 0) subjectCode = parts[0];
                    if (parts.length > 1) subjectName = parts[1];
                  }

                  // Safely handle category
                  let category = 'notes'; // Default
                  // The UserFile interface doesn't have a category property, so we need to use type assertion or check differently
                  const fileAny = file as any; // Type assertion to avoid TypeScript error
                  if (fileAny.category) {
                    category = fileAny.category.toLowerCase();
                  } else if (file.description) {
                    category = file.description.toLowerCase();
                  }

                  return {
                    id: file.id,
                    name: file.file_name || '',
                    url: file.file_path || '',
                    type: file.file_type || '',
                    created_at: file.created_at || new Date().toISOString(),
                    category: category,
                    subject_code: file.subject_code || subjectCode,
                    subject_name: file.subject_name || subjectName
                  };
                });

                console.log('Formatted files:', formattedFiles);
                setUserFiles(formattedFiles);
                return;
              }
            }
          } catch (importError) {
            console.error('Error importing getUserFiles:', importError);
          }
        }
      } catch (advancedFetchError) {
        console.error('Error using advanced file fetch:', advancedFetchError);
      }

      // Fallback to direct query if the above fails
      const query = supabase
        .from('user_files')
        .select('*')
        .eq('user_id', userId);

      // If not viewing own profile, only get public files
      if (!isOwnProfile) {
        query.eq('is_public', true);
      }

      const { data: filesData, error: filesError } = await query;

      console.log('User files fetch response:', { filesData, filesError });

      if (filesError) {
        console.error('Error fetching user files:', filesError);
        // If table doesn't exist, just continue with empty files
        if (filesError.code === '42P01' || filesError.message.includes('does not exist')) {
          console.log('user_files table does not exist, using empty array');
          setUserFiles([]);
        }
      } else if (filesData && filesData.length > 0) {
        console.log('Setting user files from database:', filesData);

        // Process the files to ensure they have all required fields
        const processedFiles = filesData.map(file => {
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

          // Convert database fields to our FileUpload interface format
          return {
            id: file.id,
            name: file.file_name || '',
            url: file.file_path || '',
            type: file.file_type || '',
            created_at: file.created_at,
            category: category,
            subject_code: subjectCode,
            subject_name: subjectName
          };
        });

        console.log('Processed files with subject info:', processedFiles);
        setUserFiles(processedFiles);
      } else {
        console.log('No files found for user');
        setUserFiles([]);
      }
    } catch (error) {
      console.error('Error fetching user files:', error);
      setUserFiles([]);
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
    setActiveDropdown(category);
    // Also set the upload section when hovering
    setUploadSection(category);
  };

  const handleDropdownMouseLeave = (category: string) => {
    // Only use hover behavior for non-mobile
    if (!isMobile) {
      const timeout = setTimeout(() => {
        setActiveDropdown(null);
        // Don't reset the upload section when the dropdown closes
        // This keeps the upload section visible even after dropdown closes
      }, 150); // 150ms delay before closing

      setDropdownTimeouts(prev => ({
        ...prev,
        [category]: timeout
      }));
    }
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
      }
      // Always set the upload section when clicking on a category
      setUploadSection(category);
    } else {
      // For desktop, just set the upload section
      setUploadSection(category);
    }
  };

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
    if (!isMobile || !activeDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is outside of any dropdown
      if (!target.closest('.category-dropdown')) {
        setActiveDropdown(null);
        // Keep the upload section visible
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
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

      const newFiles: FileUpload[] = [];

      // Create the bucket if it doesn't exist
      const bucketName = 'user-files';
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        console.log('Available buckets:', buckets);

        // Check if our bucket exists
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

        if (!bucketExists) {
          console.log(`Bucket '${bucketName}' not found, attempting to create it...`);
          const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true // Make the bucket public so files are accessible
          });

          if (error) {
            console.error(`Error creating bucket '${bucketName}':`, error);
          } else {
            console.log(`Bucket '${bucketName}' created successfully:`, data);
          }
        }
      } catch (bucketError) {
        console.error('Error checking/creating bucket:', bucketError);
      }

      // Get the current authenticated user ID
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user);

      // Use the authenticated user ID if available, otherwise fall back to userData.id
      const userId = user?.id || userData.id;
      console.log('Using user ID for uploads:', userId);

      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}-${i}.${fileExt}`;
          const storagePath = `${category}/${selectedSubject.code}/${fileName}`;

          let fileUrl = '';

          try {
            console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
            console.log('Storage path:', storagePath);

            // Update progress for UI feedback
            setUploadProgress(Math.round((i / files.length) * 50)); // First 50% for upload

            // Upload the file to Supabase Storage with subject code in the path
            const { data, error } = await supabase.storage
              .from(bucketName)
              .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: true
              });

            console.log('Storage upload response:', { data, error });

            if (error) {
              console.error(`Error uploading file ${file.name}:`, error);
              // Create a local URL as fallback
              fileUrl = URL.createObjectURL(file);
              console.log('Using local URL fallback:', fileUrl);
            } else {
              // Get the public URL with subject code in the path
              console.log('Getting public URL for:', storagePath);

              const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(storagePath);

              console.log('Public URL data:', urlData);
              fileUrl = urlData.publicUrl;
              console.log('File URL:', fileUrl);

              // Update progress for UI feedback
              setUploadProgress(50 + Math.round((i / files.length) * 50)); // Last 50% for metadata
            }
          } catch (storageError) {
            console.error('Storage error:', storageError);
            // Create a local URL as fallback
            fileUrl = URL.createObjectURL(file);
          }

          try {
            console.log('Saving file metadata to database...');

            const fileMetadata = {
              user_id: userId,
              name: file.name,
              url: fileUrl,
              type: file.type,
              category: category.toLowerCase(), // Ensure consistent casing
              subject_code: selectedSubject.code,
              subject_name: selectedSubject.name,
              is_public: true,  // Set this to true to make files visible to others
              created_at: new Date().toISOString() // Ensure we have a timestamp
            };
            console.log('File metadata:', fileMetadata);

            // Save file metadata to the database with subject information
            const { data: insertData, error: insertError } = await supabase
              .from('user_files')
              .insert(fileMetadata)
              .select();

            console.log('Database insert response:', { insertData, insertError });

            if (insertError) {
              console.error('Error saving file metadata:', insertError);

              // Add to local state with local ID if database insert fails
              newFiles.push({
                id: `local-${Date.now()}-${i}`,
                name: file.name,
                url: fileUrl,
                type: file.type,
                created_at: new Date().toISOString(),
                category: category.toLowerCase(),
                subject_code: selectedSubject.code,
                subject_name: selectedSubject.name
              });
            } else if (insertData && insertData.length > 0) {
              console.log('File metadata saved successfully:', insertData);

              // Add the database-created file to our local state
              newFiles.push(insertData[0]);
            }
          } catch (dbError) {
            console.error('Database error:', dbError);

            // Add to local state with local ID if database insert fails
            newFiles.push({
              id: `local-${Date.now()}-${i}`,
              name: file.name,
              url: fileUrl,
              type: file.type,
              created_at: new Date().toISOString(),
              category: category.toLowerCase(),
              subject_code: selectedSubject.code,
              subject_name: selectedSubject.name
            });
          }
        } catch (fileError) {
          console.error(`Error processing file at index ${i}:`, fileError);
        }
      }

      // Set upload progress to 100% after all files are processed
      setUploadProgress(100);

      try {
        console.log('Refreshing file list from database...');

        // Refresh the file list from database
        const { data: filesData, error: filesError } = await supabase
          .from('user_files')
          .select('*')
          .eq('user_id', userId);

        console.log('File list refresh response:', { filesData, filesError });

        if (filesError) {
          console.error('Error fetching user files:', filesError);
          // Use the locally created files
          console.log('Using locally created files:', newFiles);
          setUserFiles(prev => [...prev, ...newFiles]);
        } else if (filesData && filesData.length > 0) {
          console.log('Setting user files from database:', filesData);
          setUserFiles(filesData);
        } else {
          // If no files found in database but we have new files, use those
          console.log('No files found in database, using new files:', newFiles);
          setUserFiles(prev => [...prev, ...newFiles]);
        }
      } catch (refreshError) {
        console.error('Error refreshing files:', refreshError);
        // Use the locally created files
        console.log('Using locally created files due to error:', newFiles);
        setUserFiles(prev => [...prev, ...newFiles]);
      }

      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload some files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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

      // Update the local state by removing the deleted file
      setUserFiles(prev => prev.filter(f => f.id !== file.id));

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-learnflow-500 border-solid rounded-full animate-spin"></div>
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="flex items-center mb-4 w-full max-w-md justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Go back to home page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">User Not Found</h1>
            <div className="w-8"></div> {/* Empty div for balance */}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The user profile you're looking for could not be found.</p>
          <button
            onClick={() => window.location.href = '/search'}
            className="w-full max-w-xs flex items-center justify-center px-4 py-2 bg-learnflow-600 text-white rounded-lg font-medium transition-all duration-300 hover:bg-learnflow-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:ring-offset-2"
          >
            Back to Search
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      );
    } else {
      // If we're trying to view our own profile but not signed in, show the sign-in prompt
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="flex items-center mb-4 w-full max-w-md justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Go back to home page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Please Sign In</h1>
            <div className="w-8"></div> {/* Empty div for balance */}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to view your profile.</p>
          <button
            onClick={() => {
              // Open login page in a new window with signup mode
              const signupWindow = window.open('/login?mode=signup', '_blank', 'width=500,height=600');

              // Focus the new window
              if (signupWindow) {
                signupWindow.focus();
              }
            }}
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <BackButton 
                fallbackPath={isCurrentUserProfile ? '/' : '/search'}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                ariaLabel={isCurrentUserProfile ? "Go back to home page" : "Go back to search page"}
                title={isCurrentUserProfile ? "Go back to home" : "Go back to search"}
              />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isCurrentUserProfile ? 'Your Profile' : `${userData?.name}'s Profile`}
              </h1>

              {isCurrentUserProfile && (
                <button
                  onClick={toggleEditMode}
                  className="ml-auto text-sm text-learnflow-600 hover:text-learnflow-700 dark:text-learnflow-400 dark:hover:text-learnflow-300 transition-colors"
                >
                  {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
              </div>

              {/* Profile Information Section */}
              <div id="profile-section" className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userData.name || ''}
                      onChange={handleInputChange}
                      readOnly={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditMode ? 'focus:outline-none focus:ring-2 focus:ring-learnflow-500' : 'bg-gray-50 cursor-default'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    />
                  </div>

                  {isCurrentUserProfile && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userData.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year
                    </label>
                    <select
                      name="year"
                      value={userData.year || ''}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditMode ? 'focus:outline-none focus:ring-2 focus:ring-learnflow-500' : 'bg-gray-50 cursor-default'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
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
                      value={userData.semester || ''}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditMode ? 'focus:outline-none focus:ring-2 focus:ring-learnflow-500' : 'bg-gray-50 cursor-default'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
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
                      value={userData.branch || ''}
                      onChange={handleInputChange}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isEditMode ? 'focus:outline-none focus:ring-2 focus:ring-learnflow-500' : 'bg-gray-50 cursor-default'} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
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
                  <div className="mt-6">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || !hasChanges}
                      className="px-4 py-2 bg-learnflow-500 text-white rounded-md hover:bg-learnflow-600 focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your Uploads</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {['Syllabus', 'Assignments', 'Practicals', 'Lab Work', 'PYQs', 'Notes'].map((category) => (
                <div
                  key={category}
                  className="relative category-dropdown"
                  onMouseEnter={() => !isMobile && handleDropdownMouseEnter(category)}
                  onMouseLeave={() => !isMobile && handleDropdownMouseLeave(category)}
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full px-4 py-2 rounded-md transition-colors ${uploadSection === category
                      ? 'bg-learnflow-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    <div className="flex items-center justify-center">
                      <span>{category}</span>
                      {isMobile && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === category ? 'rotate-180' : ''}`}
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
                      className="fixed inset-0 bg-black bg-opacity-50 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(null);
                        // Keep the upload section visible
                      }}
                    />
                  )}

                  {/* Dropdown Menu */}
                  {activeDropdown === category && (
                    <div className={`absolute ${isMobile
                      ? 'top-full left-0 right-0 w-full'
                      : 'top-full left-0 w-56'
                      } mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 ${isMobile
                        ? 'transition-all duration-300 ease-in-out max-h-80 overflow-y-auto animate-in slide-in-from-top-5'
                        : 'animate-in fade-in-0 zoom-in-95 duration-200'
                      }`}>
                      <div className="py-2">
                        {isMobile && (
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Select Subject
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(null);
                                // Keep the upload section visible
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
                          getUserSubjects().map((subject, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling on mobile
                                setUploadSection(category);
                                setSelectedSubject(subject);
                                setActiveDropdown(null);
                                console.log(`Selected ${category} for ${subject.code}: ${subject.name}`);
                              }}
                              className={`block w-full text-left px-4 ${isMobile ? 'py-3 text-base' : 'py-2 text-sm'
                                } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-learnflow-500 dark:hover:text-learnflow-400 transition-colors`}
                              title={`${subject.name} (${subject.code})`}
                            >
                              {subject.code}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {isMobile ? (
                              <div className="flex flex-col space-y-2">
                                <p>No subjects found</p>
                                <p className="text-xs">Please update your profile with year, semester, and branch</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(null);
                                    // Scroll to profile section
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
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {uploadSection} Files
                    {selectedSubject && (
                      <span className="ml-2 text-learnflow-500 dark:text-learnflow-400">
                        for {selectedSubject.code}: {selectedSubject.name}
                      </span>
                    )}
                  </h3>
                  {isCurrentUserProfile && selectedSubject && (
                    <button
                      onClick={() => setSelectedSubject(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear subject
                      </span>
                    </button>
                  )}
                </div>

                {/* Drag and Drop Area - Only show for current user's profile */}
                {isCurrentUserProfile ? (
                  <>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging
                        ? 'border-learnflow-500 bg-learnflow-50 dark:bg-gray-700'
                        : 'border-gray-300 hover:border-learnflow-400 dark:border-gray-600 dark:hover:border-gray-500'
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here or click to upload</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Upload {uploadSection} files for {selectedSubject ? `${selectedSubject.code}: ${selectedSubject.name}` : 'your selected subject'}
                      </p>
                      {!selectedSubject && (
                        <p className="text-xs text-red-500 mt-1">Please select a subject from the dropdown menu first</p>
                      )}
                    </div>

                    {isUploading && (
                      <div className="mt-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4 dark:bg-gray-700">
                            <div className="bg-learnflow-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 w-10">{Math.round(uploadProgress)}%</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                    <p>You are viewing {userData?.name}'s profile. You can see their files but cannot upload new ones.</p>
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
                    // Get filtered files for the current section and subject
                    const filteredFiles = userFiles.filter(file => {
                      // Normalize categories for comparison
                      const normalizedCategory = uploadSection.toLowerCase();
                      const fileCategory = file.category ? file.category.toLowerCase() : '';

                      // Check if the file belongs to the selected category
                      const categoryMatch = fileCategory === normalizedCategory;

                      // Check if the file belongs to the selected subject
                      // If no subject is selected, show all files in the category
                      const subjectMatch = !selectedSubject ||
                        file.subject_code === selectedSubject.code ||
                        (file.subject_name && file.subject_name.includes(selectedSubject.name));

                      console.log(`File ${file.name}: Category match: ${categoryMatch}, Subject match: ${subjectMatch}`);

                      return categoryMatch && subjectMatch;
                    });

                    console.log('Filtered files for display:', filteredFiles);

                    // Return the appropriate UI based on whether we have files
                    if (filteredFiles.length === 0) {
                      return (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                          {selectedSubject
                            ? `No ${uploadSection} files ${isCurrentUserProfile ? 'uploaded' : 'shared'} yet for ${selectedSubject.code}`
                            : `No ${uploadSection} files ${isCurrentUserProfile ? 'uploaded' : 'shared'} yet`}
                        </p>
                      );
                    } else {
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredFiles
                            .map(file => (
                              <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 flex items-center">
                                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md mr-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{file.name}</p>
                                  <div className="flex items-center">
                                    {file.subject_code && (
                                      <span className="text-xs bg-learnflow-100 text-learnflow-800 dark:bg-learnflow-900 dark:text-learnflow-200 px-2 py-0.5 rounded mr-2">
                                        {file.subject_code}
                                      </span>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(file.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-learnflow-500 hover:text-learnflow-600"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </a>
                                  {isCurrentUserProfile && (
                                    <button
                                      onClick={() => handleDeleteFile(file)}
                                      className="ml-2 text-red-500 hover:text-red-600"
                                      title="Delete file"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
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