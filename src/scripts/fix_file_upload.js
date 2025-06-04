// Script to fix file upload issues
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    console.log('Starting file upload fix script...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../../fix_file_upload_issues.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL fix...');
    
    // Execute the SQL using Supabase's rpc function
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try an alternative approach - split the SQL into separate statements
      console.log('Trying alternative approach...');
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        console.log(`Executing statement: ${statement.substring(0, 50)}...`);
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (stmtError) {
          console.error('Error executing statement:', stmtError);
        }
      }
    } else {
      console.log('SQL fix executed successfully:', data);
    }
    
    // Check if the user-files bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      const bucketExists = buckets?.some(bucket => bucket.name === 'user-files');
      console.log(`Bucket 'user-files' exists: ${bucketExists}`);
      
      if (!bucketExists) {
        console.log("Creating 'user-files' bucket...");
        const { data: createData, error: createError } = await supabase.storage.createBucket('user-files', {
          public: true
        });
        
        if (createError) {
          console.error("Error creating 'user-files' bucket:", createError);
        } else {
          console.log("Bucket 'user-files' created successfully:", createData);
        }
      }
    }
    
    // Check if the user_files table exists
    const { data: tableInfo, error: tableError } = await supabase.rpc('check_table_exists', { 
      table_name: 'user_files',
      schema_name: 'public'
    });
    
    if (tableError) {
      console.error('Error checking if user_files table exists:', tableError);
    } else {
      console.log(`Table 'user_files' exists: ${tableInfo}`);
    }
    
    console.log('File upload fix script completed.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main();