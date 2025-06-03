import React, { useState, useEffect, useRef } from 'react';
import { supabase, supabaseUrl } from '../lib/supabase';
import { getSession, isAuthenticated } from '../lib/auth-fallback';
import { useAuth } from '../context/SupabaseAuthContext';
import { useSafeSession } from '../hooks/useSafeSession';
import { branchSubjects, Subject } from '../data/academicData';
import BackButton from '../components/BackButton';
import '../styles/animations.css';
import { ProfilePageErrorFallback } from './ProfilePageWrapper';

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

const OwnerProfilePage: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadSection, setUploadSection] = useState<string | null>(null);
    const [userFiles, setUserFiles] = useState<FileUpload[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

                // For owner profile, proceed with current user authentication
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
                    // Not authenticated
                    console.log('User not authenticated');
                    setLoading(false);
                    return;
                }

                console.log('User email:', userEmail);

                if (!userEmail) {
                    console.error('No user email found');
                    setLoading(false);
                    return;
                }

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
                            // Get the current authenticated user
                            const { data: authData, error: authError } = await supabase.auth.getUser();

                            if (authError) {
                                console.error('Error getting authenticated user:', authError);
                            } else if (authData && authData.user) {
                                console.log('Authenticated user:', authData.user);

                                // Fetch user files
                                await fetchUserFiles(authData.user.id);
                            }
                        } catch (fileError) {
                            console.error('Error fetching user files:', fileError);
                        }
                    }
                } catch (error) {
                    console.error('Error in user data fetch:', error);
                    setUserData({
                        id: '1',
                        name: userEmail.split('@')[0],
                        email: userEmail
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error('Error in fetchUserData:', error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [supabaseUser, nextAuthSession, status]);

    // Fetch user files
    const fetchUserFiles = async (userId: string) => {
        try {
            console.log('Fetching files for user ID:', userId);

            // First try to get files from user_files table
            const { data, error } = await supabase
                .from('user_files')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching user files:', error);
                return;
            }

            console.log('User files:', data);

            if (data && data.length > 0) {
                // Process the files to add public URLs
                const processedFiles = data.map((file: any) => {
                    // Create a public URL for the file
                    let publicUrl = '';

                    if (file.file_path) {
                        // If we have a file_path, use it to construct the URL
                        const bucketName = 'user-files';
                        publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${file.file_path}`;
                    } else {
                        // Otherwise, construct from bucket and filename
                        const bucketName = 'user-files';
                        const filePath = `${userId}/${file.name}`;
                        publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
                    }

                    return {
                        ...file,
                        publicUrl
                    };
                });

                setUserFiles(processedFiles);
            } else {
                // If no files found in user_files table, try to get from storage directly
                try {
                    const bucketName = 'user-files';
                    const { data: storageData, error: storageError } = await supabase.storage
                        .from(bucketName)
                        .list(userId);

                    if (storageError) {
                        console.error('Error listing files from storage:', storageError);
                        return;
                    }

                    if (storageData && storageData.length > 0) {
                        console.log('Files found in storage:', storageData);

                        // Convert storage files to our FileUpload format
                        const storageFiles = storageData.map((file: any) => {
                            const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${userId}/${file.name}`;

                            return {
                                id: file.id || Math.random().toString(36).substring(2),
                                name: file.name,
                                url: publicUrl,
                                publicUrl: publicUrl,
                                type: file.metadata?.mimetype || 'application/octet-stream',
                                created_at: file.created_at || new Date().toISOString(),
                                category: 'notes', // Default category
                                file_path: `${bucketName}/${userId}/${file.name}`
                            };
                        });

                        setUserFiles(storageFiles);
                    } else {
                        console.log('No files found for user');
                        setUserFiles([]);
                    }
                } catch (storageError) {
                    console.error('Error accessing storage:', storageError);
                }
            }
        } catch (error) {
            console.error('Error in fetchUserFiles:', error);
        }
    };

    // Handle file upload
    const handleFileUpload = async (files: FileList | null, category: string) => {
        if (!files || files.length === 0 || !userData) {
            console.error('No files selected or user data missing');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const userId = supabaseUser?.id;

            if (!userId) {
                console.error('User ID not available');
                setIsUploading(false);
                return;
            }

            const bucketName = 'user-files';
            const totalFiles = files.length;
            let uploadedFiles = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Create organized file path based on category and subject
                let filePath = '';

                if (category && selectedSubject) {
                    // Format: [category]/[subjectCode]/[userId]_[filename]
                    filePath = `${category}/${selectedSubject.code}/${userId}_${file.name}`;
                } else {
                    // Default path if no category or subject is selected
                    filePath = `${userId}/${file.name}`;
                }

                // Upload file to storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    continue;
                }

                console.log('File uploaded successfully:', uploadData);

                // Get public URL for the file
                const { data: publicUrlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);

                const publicUrl = publicUrlData?.publicUrl || '';

                // Save file metadata to user_files table
                try {
                    const { data: fileData, error: fileError } = await supabase
                        .from('user_files')
                        .insert([
                            {
                                user_id: userId,
                                name: file.name,
                                file_name: file.name,
                                type: file.type,
                                file_type: file.type,
                                category: category,
                                url: publicUrl,
                                file_path: filePath,
                                subject_code: selectedSubject?.code || null,
                                subject_name: selectedSubject?.name || null,
                                material_type: category,
                                is_public: true // Default to public
                            }
                        ]);

                    if (fileError) {
                        console.error('Error saving file metadata:', fileError);
                    }
                } catch (metadataError) {
                    console.error('Error in metadata save:', metadataError);
                }

                uploadedFiles++;
                setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100));
            }

            // Refresh the file list
            await fetchUserFiles(userId);

            // Reset upload state
            setIsUploading(false);
            setUploadProgress(0);

            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error in file upload:', error);
            setIsUploading(false);
        }
    };

    // Handle drag and drop
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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files, category);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
        handleFileUpload(e.target.files, category);
    };

    // Handle dropdown menu
    const handleDropdownHover = (dropdownId: string) => {
        // Clear any existing timeout for this dropdown
        if (dropdownTimeouts[dropdownId]) {
            clearTimeout(dropdownTimeouts[dropdownId]);
        }

        setActiveDropdown(dropdownId);
    };

    const handleDropdownLeave = (dropdownId: string) => {
        // Set a timeout to close the dropdown
        const timeout = setTimeout(() => {
            setActiveDropdown(null);
        }, 300);

        // Store the timeout ID
        setDropdownTimeouts({
            ...dropdownTimeouts,
            [dropdownId]: timeout
        });
    };

    // Handle edit mode
    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
        setHasChanges(false);
    };

    // Handle user data changes
    const handleUserDataChange = (field: keyof UserData, value: string) => {
        if (userData) {
            setUserData({
                ...userData,
                [field]: value
            });
            setHasChanges(true);
        }
    };

    // Save user data changes
    const saveUserData = async () => {
        if (!userData || !hasChanges) return;

        setSaving(true);

        try {
            // Update user data in the database
            const { data, error } = await supabase
                .from('users')
                .update({
                    name: userData.name,
                    year: userData.year,
                    semester: userData.semester,
                    branch: userData.branch
                })
                .eq('id', userData.id);

            if (error) {
                console.error('Error updating user data:', error);
            } else {
                console.log('User data updated successfully');
                setIsEditMode(false);
                setHasChanges(false);
            }
        } catch (error) {
            console.error('Error in saveUserData:', error);
        } finally {
            setSaving(false);
        }
    };

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize(); // Check on initial load
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            // Clear all dropdown timeouts
            Object.values(dropdownTimeouts).forEach(timeout => {
                clearTimeout(timeout);
            });
        };
    }, [dropdownTimeouts]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-learnflow-500 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return <ProfilePageErrorFallback />;
    }

    // Get subjects for the selected branch
    let subjects: Subject[] = [];
    if (userData?.year && userData?.semester && userData?.branch) {
        const yearNum = parseInt(userData.year, 10);
        const semesterNum = parseInt(userData.semester, 10);
        const branchId = userData.branch.toLowerCase();

        if (!isNaN(yearNum) && !isNaN(semesterNum) &&
            branchSubjects[yearNum] &&
            branchSubjects[yearNum][semesterNum] &&
            branchSubjects[yearNum][semesterNum][branchId]) {
            // Access the subjects for this specific branch, year, and semester
            subjects = branchSubjects[yearNum][semesterNum][branchId];
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 animate-fadeIn">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div className="flex items-center mb-4 md:mb-0">
                        <BackButton
                            fallbackPath="/"
                            className="mr-4"
                            ariaLabel="Go back to home page"
                            title="Go back to home"
                        />
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            Your Profile
                        </h1>
                    </div>

                    <div className="flex space-x-4">
                        {isEditMode ? (
                            <>
                                <button
                                    onClick={toggleEditMode}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveUserData}
                                    className="px-4 py-2 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-all duration-300 flex items-center"
                                    disabled={!hasChanges || saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={toggleEditMode}
                                className="px-4 py-2 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-all duration-300 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* User Information Section - Two Column Layout */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Your Information
                        </h2>

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Left Column - Profile Photo and Basic Info */}
                            <div className="w-full md:w-1/3">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                                    <div className="p-6 flex flex-col items-center">
                                        <div className="mb-4">
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-learnflow-200 dark:border-learnflow-800">
                                                <div className="w-full h-full bg-learnflow-500 dark:bg-learnflow-700 flex items-center justify-center text-white font-semibold text-2xl">
                                                    {userData.name ? (
                                                        // Get initials: first letter of first name and first letter of last name
                                                        userData.name.split(' ').map(part => part.charAt(0).toUpperCase()).slice(0, 2).join('')
                                                    ) : (
                                                        // Fallback to first letter if no name or no space in name
                                                        userData.email.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{userData.name}</h2>
                                            <p className="text-gray-600 dark:text-gray-400 mb-3">{userData.email}</p>

                                            <div className="flex flex-col gap-y-2 mb-3">
                                                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium mr-1">Year:</span>
                                                    <span className={!userData.year ? 'text-gray-400 italic' : ''}>
                                                        {userData.year ? `${userData.year}` : 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium mr-1">Semester:</span>
                                                    <span className={!userData.semester ? 'text-gray-400 italic' : ''}>
                                                        {userData.semester ? `${userData.semester}` : 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium mr-1">Branch:</span>
                                                    <span className={!userData.branch ? 'text-gray-400 italic' : ''}>
                                                        {userData.branch ? (
                                                            userData.branch === 'CSE' ? 'Computer Science Engineering' :
                                                                userData.branch === 'BLOCKCHAIN' ? 'Blockchain Technology' :
                                                                    userData.branch === 'AI&DS' ? 'Artificial Intelligence & Data Science' :
                                                                        userData.branch === 'AI&ML' ? 'Artificial Intelligence & Machine Learning' :
                                                                            userData.branch === 'CSE-IOT' ? 'Internet of Things' :
                                                                                userData.branch === 'IT' ? 'Information Technology' :
                                                                                    userData.branch === 'ECE' ? 'Electronics & Communication' :
                                                                                        userData.branch === 'EE' ? 'Electrical Engineering' :
                                                                                            userData.branch === 'ME' ? 'Mechanical Engineering' :
                                                                                                userData.branch === 'CE' ? 'Civil Engineering' :
                                                                                                    userData.branch
                                                        ) : 'Not specified'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Editable Information */}
                            <div className="w-full md:w-2/3 mt-6 md:mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                value={userData.name}
                                                onChange={(e) => handleUserDataChange('name', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-learnflow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            />
                                        ) : (
                                            <p className="text-gray-800 dark:text-white">{userData.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                                        <p className="text-gray-800 dark:text-white">{userData.email}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Year</label>
                                        {isEditMode ? (
                                            <select
                                                value={userData.year || ''}
                                                onChange={(e) => handleUserDataChange('year', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-learnflow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1">Year 1</option>
                                                <option value="2">Year 2</option>
                                                <option value="3">Year 3</option>
                                                <option value="4">Year 4</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-800 dark:text-white">{userData.year ? `Year ${userData.year}` : 'Not specified'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Semester</label>
                                        {isEditMode ? (
                                            <select
                                                value={userData.semester || ''}
                                                onChange={(e) => handleUserDataChange('semester', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-learnflow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="">Select Semester</option>
                                                <option value="1">Semester 1</option>
                                                <option value="2">Semester 2</option>
                                                <option value="3">Semester 3</option>
                                                <option value="4">Semester 4</option>
                                                <option value="5">Semester 5</option>
                                                <option value="6">Semester 6</option>
                                                <option value="7">Semester 7</option>
                                                <option value="8">Semester 8</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-800 dark:text-white">{userData.semester ? `Semester ${userData.semester}` : 'Not specified'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Branch</label>
                                        {isEditMode ? (
                                            <select
                                                value={userData.branch || ''}
                                                onChange={(e) => handleUserDataChange('branch', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-learnflow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="">Select Branch</option>
                                                <option value="CSE">Computer Science Engineering</option>
                                                <option value="BLOCKCHAIN">Blockchain Technology</option>
                                                <option value="AI&DS">Artificial Intelligence And DS</option>
                                                <option value="AI&ML">Artificial Intelligence And ML</option>
                                                <option value="IT">Information Technology</option>
                                                <option value="CSE-IOT">Internet of Things</option>
                                                <option value="ECE">Electronics & Communication</option>
                                                <option value="EE">Electrical Engineering</option>
                                                <option value="ME">Mechanical Engineering</option>
                                                <option value="CE">Civil Engineering</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-800 dark:text-white">
                                                {userData.branch ? (
                                                    userData.branch === 'CSE' ? 'Computer Science Engineering' :
                                                        userData.branch === 'BLOCKCHAIN' ? 'Blockchain Technology' :
                                                            userData.branch === 'AI&DS' ? 'Artificial Intelligence & Data Science' :
                                                                userData.branch === 'AI&ML' ? 'Artificial Intelligence & Machine Learning' :
                                                                    userData.branch === 'CSE-IOT' ? 'Internet of Things' :
                                                                        userData.branch === 'IT' ? 'Information Technology' :
                                                                            userData.branch === 'ECE' ? 'Electronics & Communication' :
                                                                                userData.branch === 'EE' ? 'Electrical Engineering' :
                                                                                    userData.branch === 'ME' ? 'Mechanical Engineering' :
                                                                                        userData.branch === 'CE' ? 'Civil Engineering' :
                                                                                            userData.branch
                                                ) : 'Not specified'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Uploads Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
                            <div className="p-6">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Your Uploads
                                </h2>

                                {/* Subject List Section */}
                                {/* {subjects.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Your Subjects</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {subjects.map((subject) => (
                                                <div 
                                                    key={subject.code}
                                                    className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600"
                                                >
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-learnflow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                        <div>
                                                            <p className="font-medium text-gray-800 dark:text-white">{subject.code}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{subject.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )} */}

                                {/* Upload Categories */}
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                                    {['syllabus', 'assignments', 'practicals', 'lab-work','PYQs', 'notes'].map((category) => (
                                        <div
                                            key={category}
                                            className={`p-2 border-2 rounded-xl cursor-pointer transition-all duration-300 ${uploadSection === category
                                                ? 'border-learnflow-500 bg-learnflow-50 dark:bg-learnflow-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-learnflow-300 dark:hover:border-learnflow-700'
                                                }`}
                                            onClick={() => setUploadSection(category)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-medium capitalize text-gray-800 dark:text-white">
                                                    {category.replace('-', ' ')}
                                                </span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`h-5 w-5 transition-transform duration-300 ${uploadSection === category ? 'text-learnflow-500 rotate-180' : 'text-gray-400'
                                                        }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Subject Selection */}
                                {uploadSection && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select Subject</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-learnflow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                value={selectedSubject ? JSON.stringify(selectedSubject) : ''}
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        setSelectedSubject(JSON.parse(e.target.value));
                                                    } else {
                                                        setSelectedSubject(null);
                                                    }
                                                }}
                                            >
                                                <option value="">All Subjects</option>
                                                {subjects.map((subject) => (
                                                    <option key={subject.code} value={JSON.stringify(subject)}>
                                                        {subject.code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* File Upload Area */}
                                {uploadSection && selectedSubject && (
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all duration-300 ${isDragging
                                            ? 'border-learnflow-500 bg-learnflow-50 dark:bg-learnflow-900/20'
                                            : 'border-gray-300 dark:border-gray-700 hover:border-learnflow-300 dark:hover:border-learnflow-700'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, uploadSection)}
                                    >
                                        {isUploading ? (
                                            <div className="text-center">
                                                <div className="inline-block mb-4">
                                                    <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-learnflow-500 animate-spin"></div>
                                                    <div className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">{uploadProgress}%</div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400">Uploading your files...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                                <p className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                                                    Drag and drop your {uploadSection} files here
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                    or click to browse from your device
                                                </p>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    multiple
                                                    onChange={(e) => handleFileInputChange(e, uploadSection)}
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-4 py-2 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-all duration-300"
                                                >
                                                    Browse Files
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Files Display */}
                                {uploadSection && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Your {uploadSection} Files
                                        </h3>

                                        {userFiles.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {userFiles
                                                    .filter(file =>
                                                        file.category === uploadSection &&
                                                        (!selectedSubject || file.subject_code === selectedSubject.code)
                                                    )
                                                    .map((file) => (
                                                        <div
                                                            key={file.id}
                                                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                                                        >
                                                            <div className="p-4">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-learnflow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <div>
                                                                            <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate" title={file.name}>
                                                                                {file.name}
                                                                            </h4>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {new Date(file.created_at).toLocaleDateString()}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="relative"
                                                                        onMouseEnter={() => handleDropdownHover(`file-${file.id}`)}
                                                                        onMouseLeave={() => handleDropdownLeave(`file-${file.id}`)}
                                                                    >
                                                                        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                                            </svg>
                                                                        </button>
                                                                        {activeDropdown === `file-${file.id}` && (
                                                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                                                                <a
                                                                                    href={file.publicUrl || file.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
                                                                                >
                                                                                    View File
                                                                                </a>
                                                                                <a
                                                                                    href={file.publicUrl || file.url}
                                                                                    download={file.name}
                                                                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                                >
                                                                                    Download
                                                                                </a>
                                                                                <button
                                                                                    onClick={async () => {
                                                                                        try {
                                                                                            // Delete from storage
                                                                                            if (file.file_path) {
                                                                                                const pathParts = file.file_path.split('/');
                                                                                                const bucketName = pathParts[0];
                                                                                                const filePath = pathParts.slice(1).join('/');

                                                                                                await supabase.storage
                                                                                                    .from(bucketName)
                                                                                                    .remove([filePath]);
                                                                                            }

                                                                                            // Delete from database
                                                                                            await supabase
                                                                                                .from('user_files')
                                                                                                .delete()
                                                                                                .eq('id', file.id);

                                                                                            // Refresh file list
                                                                                            if (supabaseUser) {
                                                                                                await fetchUserFiles(supabaseUser.id);
                                                                                            }
                                                                                        } catch (error) {
                                                                                            console.error('Error deleting file:', error);
                                                                                        }
                                                                                    }}
                                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {selectedSubject
                                                        ? `No ${uploadSection} files uploaded yet for ${selectedSubject.code}`
                                                        : `No ${uploadSection} files uploaded yet`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerProfilePage;






