/**
 * Script to initialize Supabase resources for the free plan
 * 
 * This script is optimized for Supabase's free tier, using a single bucket
 * with a well-organized folder structure to maximize the available resources.
 * 
 * Usage:
 * ```
 * node src/scripts/initSupabaseFree.js
 * ```
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import Supabase client
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Single bucket name for free plan
const STORAGE_BUCKET = 'resources';

// Database table name
const USER_FILES_TABLE = 'user_files';

/**
 * Creates the storage bucket if it doesn't exist
 */
async function createStorageBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return { error: listError };
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (bucketExists) {
      console.log(`Bucket '${STORAGE_BUCKET}' already exists.`);
      return { data: { bucketName: STORAGE_BUCKET, exists: true }, error: null };
    }
    
    // Create bucket
    const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024 // 10MB limit to conserve space
    });
    
    if (error) {
      console.error(`Error creating bucket '${STORAGE_BUCKET}':`, error);
      return { error };
    }
    
    console.log(`Created bucket: '${STORAGE_BUCKET}'`);
    return { data: { bucketName: STORAGE_BUCKET, exists: false }, error: null };
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    return { error };
  }
}

/**
 * Creates the folder structure in the bucket
 */
async function createFolderStructure() {
  try {
    const folders = [
      'academic',
      'profile-pictures',
      'user-files'
    ];
    
    // Create main folders
    for (const folder of folders) {
      try {
        // Create an empty file to represent the folder
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${folder}/.keep`, new Uint8Array(0), {
            contentType: 'text/plain',
            upsert: false
          });
        
        if (error && error.message !== 'The resource already exists') {
          console.error(`Error creating folder '${folder}':`, error);
        } else {
          console.log(`Created folder: '${folder}'`);
        }
      } catch (folderError) {
        // Ignore if folder already exists
        console.log(`Folder '${folder}' may already exist:`, folderError);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating folder structure:', error);
    return { success: false, error };
  }
}

/**
 * Checks if a table exists in the database
 */
async function tableExists(tableName) {
  try {
    // Query the information_schema to check if the table exists
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Error in tableExists for ${tableName}:`, error);
    return false;
  }
}

/**
 * Creates the user_files table if it doesn't exist
 */
async function createUserFilesTable() {
  try {
    // Check if the table already exists
    const exists = await tableExists(USER_FILES_TABLE);
    
    if (exists) {
      console.log(`Table '${USER_FILES_TABLE}' already exists.`);
      return true;
    }
    
    // Create the user_files table directly with SQL
    const { error } = await supabase.rpc('create_user_files_table_direct');
    
    if (error) {
      console.error(`Error creating table '${USER_FILES_TABLE}':`, error);
      
      // Try alternative approach with SQL query
      console.log('Trying alternative approach...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${USER_FILES_TABLE} (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS user_files_user_id_idx ON ${USER_FILES_TABLE} (user_id);
        CREATE INDEX IF NOT EXISTS user_files_category_idx ON ${USER_FILES_TABLE} (category);
      `;
      
      const { error: sqlError } = await supabase.rpc('run_sql', { sql: createTableSQL });
      
      if (sqlError) {
        console.error('Error creating table with SQL:', sqlError);
        console.log('You may need to create the table manually in the Supabase dashboard.');
        return false;
      }
    }
    
    console.log(`Created table: '${USER_FILES_TABLE}'`);
    return true;
  } catch (error) {
    console.error(`Error in createUserFilesTable:`, error);
    console.log('You may need to create the table manually in the Supabase dashboard.');
    return false;
  }
}

/**
 * Sets up storage policies for the bucket
 */
async function setupStoragePolicies() {
  try {
    // Set bucket to public
    const { error: policyError } = await supabase.storage.updateBucket(
      STORAGE_BUCKET,
      { public: true }
    );
    
    if (policyError) {
      console.error(`Error setting public policy for bucket '${STORAGE_BUCKET}':`, policyError);
      return false;
    }
    
    console.log(`Public policy set for bucket '${STORAGE_BUCKET}'`);
    return true;
  } catch (error) {
    console.error(`Error setting policy for bucket '${STORAGE_BUCKET}':`, error);
    return false;
  }
}

/**
 * Main function to initialize Supabase resources
 */
async function initializeSupabase() {
  console.log('🚀 Initializing Supabase resources for free plan...');
  
  try {
    // 1. Create storage bucket
    console.log('\n📦 Creating storage bucket...');
    const { data: bucketData, error: bucketError } = await createStorageBucket();
    
    if (bucketError) {
      console.error('❌ Error creating storage bucket:', bucketError);
    } else {
      console.log('✅ Storage bucket created or already exists');
    }
    
    // 2. Create folder structure
    console.log('\n📂 Creating folder structure...');
    const { success: folderSuccess, error: folderError } = await createFolderStructure();
    
    if (!folderSuccess) {
      console.error('❌ Error creating folder structure:', folderError);
    } else {
      console.log('✅ Folder structure created');
    }
    
    // 3. Create database table
    console.log('\n🗄️ Creating database table...');
    const tableCreated = await createUserFilesTable();
    
    if (tableCreated) {
      console.log(`✅ Table '${USER_FILES_TABLE}' created or already exists`);
    } else {
      console.error(`❌ Failed to create table '${USER_FILES_TABLE}'`);
    }
    
    // 4. Set up storage policies
    console.log('\n🔒 Setting up storage policies...');
    const policiesSet = await setupStoragePolicies();
    
    if (policiesSet) {
      console.log('✅ Storage policies set up successfully');
    } else {
      console.error('❌ Failed to set up storage policies');
    }
    
    console.log('\n🎉 Supabase initialization complete!');
    console.log('\nYou can now use the following resources:');
    console.log(`- Storage bucket: '${STORAGE_BUCKET}'`);
    console.log(`- Database table: '${USER_FILES_TABLE}'`);
    
    console.log('\nFolder structure:');
    console.log(`- ${STORAGE_BUCKET}/academic/ - For academic materials`);
    console.log(`- ${STORAGE_BUCKET}/profile-pictures/ - For user profile pictures`);
    console.log(`- ${STORAGE_BUCKET}/user-files/ - For user-uploaded files`);
    
    console.log('\n⚠️ Free Plan Limitations:');
    console.log('- Storage: 1GB total');
    console.log('- Database: 500MB');
    console.log('- Monthly Egress: 2GB');
    
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the initialization
initializeSupabase();
