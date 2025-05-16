/**
 * Script to initialize Supabase storage buckets and tables
 *
 * This is a Node.js version of the initialization script that doesn't rely on
 * import.meta.env which is specific to Vite.
 *
 * Usage:
 * ```
 * node src/scripts/initSupabaseNode.js
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

// Storage bucket names
const STORAGE_BUCKETS = {
  MATERIALS: 'academic-materials',
  RESOURCES: 'resources',
  PROFILE_PICTURES: 'profile-pictures',
  USER_FILES: 'user-files'
};

// Database table names
const DB_TABLES = {
  BRANCHES: 'branches',
  YEARS: 'years',
  SEMESTERS: 'semesters',
  SUBJECTS: 'subjects',
  MATERIALS: 'materials',
  PROFILES: 'profiles',
  USER_PROGRESS: 'user_progress',
  USER_MATERIALS: 'user_materials',
  USER_FILES: 'user_files'
};

/**
 * Creates storage buckets if they don't exist
 */
async function createStorageBuckets() {
  try {
    // Check if buckets exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return { error: listError };
    }

    const existingBuckets = new Set(buckets?.map(bucket => bucket.name));
    const bucketsToCreate = Object.values(STORAGE_BUCKETS).filter(
      bucketName => !existingBuckets.has(bucketName)
    );

    // Create missing buckets
    const results = [];
    for (const bucketName of bucketsToCreate) {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
      });

      results.push({
        bucketName,
        success: !error,
        error: error || null
      });

      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
      } else {
        console.log(`Created bucket: ${bucketName}`);
      }
    }

    return { data: results, error: null };
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    return { error };
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
 * Creates the materials table if it doesn't exist
 */
async function createMaterialsTable() {
  try {
    // Check if the table already exists
    const exists = await tableExists(DB_TABLES.MATERIALS);

    if (exists) {
      console.log(`Table ${DB_TABLES.MATERIALS} already exists.`);
      return true;
    }

    // Create the materials table
    const { error } = await supabase.rpc('create_materials_table');

    if (error) {
      console.error(`Error creating table ${DB_TABLES.MATERIALS}:`, error);
      return false;
    }

    console.log(`Created table: ${DB_TABLES.MATERIALS}`);
    return true;
  } catch (error) {
    console.error(`Error in createMaterialsTable:`, error);
    return false;
  }
}

/**
 * Creates the user_files table if it doesn't exist
 */
async function createUserFilesTable() {
  try {
    // Check if the table already exists
    const exists = await tableExists(DB_TABLES.USER_FILES);

    if (exists) {
      console.log(`Table ${DB_TABLES.USER_FILES} already exists.`);
      return true;
    }

    // Create the user_files table
    const { error } = await supabase.rpc('create_user_files_table');

    if (error) {
      console.error(`Error creating table ${DB_TABLES.USER_FILES}:`, error);
      return false;
    }

    console.log(`Created table: ${DB_TABLES.USER_FILES}`);
    return true;
  } catch (error) {
    console.error(`Error in createUserFilesTable:`, error);
    return false;
  }
}

/**
 * Creates SQL functions for table creation
 */
async function createSQLFunctions() {
  try {
    // Create function to create materials table
    const createMaterialsTableFn = `
      CREATE OR REPLACE FUNCTION create_materials_table()
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS ${DB_TABLES.MATERIALS} (
          id SERIAL PRIMARY KEY,
          subject_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          file_path TEXT NOT NULL,
          type TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add indexes
        CREATE INDEX IF NOT EXISTS materials_subject_id_idx ON ${DB_TABLES.MATERIALS} (subject_id);
        CREATE INDEX IF NOT EXISTS materials_type_idx ON ${DB_TABLES.MATERIALS} (type);
      END;
      $$;
    `;

    // Create function to create user_files table
    const createUserFilesTableFn = `
      CREATE OR REPLACE FUNCTION create_user_files_table()
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS ${DB_TABLES.USER_FILES} (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add indexes
        CREATE INDEX IF NOT EXISTS user_files_user_id_idx ON ${DB_TABLES.USER_FILES} (user_id);
        CREATE INDEX IF NOT EXISTS user_files_category_idx ON ${DB_TABLES.USER_FILES} (category);
      END;
      $$;
    `;

    // Execute the SQL functions
    const { error: materialsError } = await supabase.rpc('create_materials_table_fn', {
      sql: createMaterialsTableFn
    });

    if (materialsError) {
      console.error('Error creating materials table function:', materialsError);
    }

    const { error: userFilesError } = await supabase.rpc('create_user_files_table_fn', {
      sql: createUserFilesTableFn
    });

    if (userFilesError) {
      console.error('Error creating user_files table function:', userFilesError);
    }

    return {
      success: !materialsError && !userFilesError,
      materialsError,
      userFilesError
    };
  } catch (error) {
    console.error('Error creating SQL functions:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Main function to initialize Supabase resources
 */
async function initializeSupabase() {
  console.log('🚀 Initializing Supabase resources...');

  try {
    // 1. Create SQL functions (requires admin privileges)
    console.log('\n📝 Creating SQL functions...');
    try {
      const { success, error } = await createSQLFunctions();
      if (success) {
        console.log('✅ SQL functions created successfully');
      } else {
        console.warn('⚠️ Failed to create SQL functions:', error);
        console.log('   This is expected if you don\'t have admin privileges.');
        console.log('   You can ask your Supabase admin to run the SQL functions manually.');
      }
    } catch (error) {
      console.warn('⚠️ Error creating SQL functions:', error);
    }

    // 2. Create storage buckets
    console.log('\n📦 Creating storage buckets...');
    const { data: buckets, error: bucketsError } = await createStorageBuckets();

    if (bucketsError) {
      console.error('❌ Error creating storage buckets:', bucketsError);
    } else {
      console.log('✅ Storage buckets created or already exist');

      if (buckets && buckets.length > 0) {
        console.log('   Created buckets:');
        buckets.forEach((result) => {
          if (result.success) {
            console.log(`   - ${result.bucketName} ✅`);
          } else {
            console.log(`   - ${result.bucketName} ❌ (${result.error?.message || 'Unknown error'})`);
          }
        });
      }
    }

    // 3. Create database tables
    console.log('\n🗄️ Creating database tables...');

    // Materials table
    const materialsTableCreated = await createMaterialsTable();
    if (materialsTableCreated) {
      console.log(`✅ Table ${DB_TABLES.MATERIALS} created or already exists`);
    } else {
      console.error(`❌ Failed to create table ${DB_TABLES.MATERIALS}`);
    }

    // User files table
    const userFilesTableCreated = await createUserFilesTable();
    if (userFilesTableCreated) {
      console.log(`✅ Table ${DB_TABLES.USER_FILES} created or already exists`);
    } else {
      console.error(`❌ Failed to create table ${DB_TABLES.USER_FILES}`);
    }

    // 4. Set up bucket policies (public read access)
    console.log('\n🔒 Setting up storage bucket policies...');

    for (const bucketName of Object.values(STORAGE_BUCKETS)) {
      try {
        const { error } = await supabase.storage.getBucket(bucketName);

        if (!error) {
          // Set bucket to public
          const { error: policyError } = await supabase.storage.updateBucket(
            bucketName,
            { public: true }
          );

          if (policyError) {
            console.error(`❌ Error setting public policy for bucket ${bucketName}:`, policyError);
          } else {
            console.log(`✅ Public policy set for bucket ${bucketName}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error setting policy for bucket ${bucketName}:`, error);
      }
    }

    console.log('\n🎉 Supabase initialization complete!');
    console.log('\nYou can now use the following storage buckets:');
    Object.entries(STORAGE_BUCKETS).forEach(([key, value]) => {
      console.log(`- ${key}: ${value}`);
    });

    console.log('\nAnd the following database tables:');
    Object.entries(DB_TABLES).forEach(([key, value]) => {
      console.log(`- ${key}: ${value}`);
    });

  } catch (error) {
    console.error('❌ Error initializing Supabase:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the initialization
initializeSupabase();
