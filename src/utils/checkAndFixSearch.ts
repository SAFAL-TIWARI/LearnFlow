import { supabase } from './supabaseClient';

// Function to check and fix search functionality
export async function checkAndFixSearchFunctionality() {
  console.log('Checking search functionality...');
  
  try {
    // 1. Check if the search_users function exists
    const { data: testData, error: testError } = await supabase
      .rpc('search_users', { search_query: 'test' })
      .limit(1);
      
    if (testError) {
      console.error('Error with search_users function:', testError);
      console.log('Attempting to create search_users function...');
      
      // 2. Create the search_users function
      const { error: createError } = await supabase.rpc('create_search_users_function');
      
      if (createError) {
        console.error('Error creating search_users function:', createError);
        console.log('Attempting to create function directly...');
        
        // 3. Try to create the function directly
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION search_users(search_query TEXT)
          RETURNS TABLE (
            id UUID,
            username TEXT,
            full_name TEXT,
            branch TEXT,
            year TEXT,
            profile_picture_url TEXT,
            is_public BOOLEAN,
            created_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE
          )
          LANGUAGE sql
          SECURITY DEFINER
          AS $$
            SELECT 
              id,
              username,
              full_name,
              COALESCE(branch, '') as branch,
              COALESCE(year, '') as year,
              COALESCE(profile_picture_url, '') as profile_picture_url,
              is_public,
              created_at,
              updated_at
            FROM profiles
            WHERE 
              is_public = true AND
              (
                username ILIKE '%' || search_query || '%' OR
                full_name ILIKE '%' || search_query || '%' OR
                branch ILIKE '%' || search_query || '%'
              )
            ORDER BY 
              CASE 
                WHEN full_name ILIKE search_query || '%' THEN 1
                WHEN username ILIKE search_query || '%' THEN 2
                ELSE 3
              END,
              full_name;
          $$;
        `;
        
        const { error: directCreateError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
        
        if (directCreateError) {
          console.error('Error creating function directly:', directCreateError);
          return false;
        } else {
          console.log('Successfully created search_users function directly');
        }
      } else {
        console.log('Successfully created search_users function');
      }
      
      // 4. Test the function again
      const { data: retestData, error: retestError } = await supabase
        .rpc('search_users', { search_query: 'test' })
        .limit(1);
        
      if (retestError) {
        console.error('Function still not working after creation:', retestError);
        return false;
      } else {
        console.log('Function now working properly');
        return true;
      }
    } else {
      console.log('search_users function exists and is working properly');
      return true;
    }
  } catch (error) {
    console.error('Unexpected error checking search functionality:', error);
    return false;
  }
}

// Function to check if profiles table has data
export async function checkProfilesTable() {
  console.log('Checking profiles table...');
  
  try {
    // Count profiles
    const { data: profileCount, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting profiles:', countError);
      return { exists: false, count: 0 };
    }
    
    const count = profileCount?.length || 0;
    console.log(`Found ${count} profiles in the profiles table`);
    
    // Get a sample profile
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();
      
    if (sampleError && sampleError.code !== 'PGRST116') {
      console.error('Error fetching sample profile:', sampleError);
    } else if (sampleProfile) {
      console.log('Sample profile:', sampleProfile);
    }
    
    return { exists: true, count, sampleProfile };
  } catch (error) {
    console.error('Unexpected error checking profiles table:', error);
    return { exists: false, count: 0 };
  }
}

// Function to check if the current user has a profile
export async function checkCurrentUserProfile() {
  console.log('Checking current user profile...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return { hasProfile: false };
    }
    
    console.log('Current user:', user.id);
    
    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
      return { hasProfile: false, userId: user.id };
    }
    
    if (profile) {
      console.log('User has a profile:', profile);
      return { hasProfile: true, profile, userId: user.id };
    } else {
      console.log('User does not have a profile');
      return { hasProfile: false, userId: user.id };
    }
  } catch (error) {
    console.error('Unexpected error checking user profile:', error);
    return { hasProfile: false };
  }
}

// Function to create a profile for the current user
export async function createProfileForCurrentUser() {
  console.log('Creating profile for current user...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }
    
    // Create a username from email
    const email = user.email || '';
    const userName = email.split('@')[0] || 'user';
    const username = userName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
    
    // Try to get user data from users table first
    let branch = '';
    let year = '';
    let college = '';
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('branch, year, college')
        .eq('email', email)
        .single();
        
      if (!userError && userData) {
        branch = userData.branch || '';
        year = userData.year || '';
        college = userData.college || '';
      }
    } catch (e) {
      console.log('No user data found in users table, using empty values');
    }
    
    // Create profile with all necessary fields
    const { data: profile, error: createError } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        username: username,
        full_name: user.user_metadata?.full_name || userName,
        branch: user.user_metadata?.branch || branch,
        year: user.user_metadata?.year || year,
        college: user.user_metadata?.college || college,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating profile:', createError);
      return false;
    }
    
    console.log('Successfully created profile:', profile);
    return true;
  } catch (error) {
    console.error('Unexpected error creating profile:', error);
    return false;
  }
}