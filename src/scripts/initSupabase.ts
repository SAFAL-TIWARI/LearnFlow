/**
 * Script to initialize Supabase storage buckets and tables
 * 
 * Run this script once to set up the required storage buckets and database tables
 * for the LearnFlow application.
 * 
 * Usage:
 * ```
 * npm run init-supabase
 * ```
 */

import { supabase } from '../lib/supabaseClient';
import { 
  createStorageBuckets, 
  STORAGE_BUCKETS 
} from '../lib/supabaseStorage';
import { 
  createMaterialsTable, 
  createUserFilesTable,
  createSQLFunctions,
  DB_TABLES
} from '../lib/initSupabaseStorage';

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
        buckets.forEach((result: any) => {
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
