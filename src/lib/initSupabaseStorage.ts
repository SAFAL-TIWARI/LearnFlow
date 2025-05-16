import { supabase } from './supabaseClient';
import { createStorageBuckets, STORAGE_BUCKETS } from './supabaseStorage';

/**
 * Database table names
 */
export const DB_TABLES = {
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
 * Checks if a table exists in the database
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
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
};

/**
 * Creates the materials table if it doesn't exist
 */
export const createMaterialsTable = async (): Promise<boolean> => {
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
};

/**
 * Creates the user_files table if it doesn't exist
 */
export const createUserFilesTable = async (): Promise<boolean> => {
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
};

/**
 * Initializes Supabase storage buckets and related database tables
 */
export const initializeSupabaseStorage = async () => {
  try {
    console.log('Initializing Supabase storage...');
    
    // Create storage buckets
    const { error: bucketsError } = await createStorageBuckets();
    
    if (bucketsError) {
      console.error('Error creating storage buckets:', bucketsError);
    }
    
    // Create database tables
    const materialsTableCreated = await createMaterialsTable();
    const userFilesTableCreated = await createUserFilesTable();
    
    console.log('Supabase storage initialization complete.');
    
    return {
      success: !bucketsError && materialsTableCreated && userFilesTableCreated,
      bucketsCreated: !bucketsError,
      materialsTableCreated,
      userFilesTableCreated
    };
  } catch (error) {
    console.error('Error initializing Supabase storage:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Creates SQL functions for table creation
 * This should be run once by an admin with appropriate permissions
 */
export const createSQLFunctions = async () => {
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
};
