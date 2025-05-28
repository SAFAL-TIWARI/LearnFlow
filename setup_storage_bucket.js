// This script can be run in the Supabase dashboard's SQL editor
// as a JavaScript Edge Function to create the storage bucket

// Create the user-files bucket if it doesn't exist
async function createUserFilesBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    return { error: listError };
  }
  
  const bucketExists = buckets?.some(bucket => bucket.name === 'user-files');
  
  if (bucketExists) {
    console.log(`Bucket 'user-files' already exists.`);
    return { data: { bucketName: 'user-files', exists: true }, error: null };
  }
  
  // Create bucket
  const { data, error } = await supabase.storage.createBucket('user-files', {
    public: false, // Not public by default for security
    fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
  });
  
  if (error) {
    console.error(`Error creating bucket 'user-files':`, error);
    return { error };
  }
  
  console.log(`Created bucket: 'user-files'`);
  return { data: { bucketName: 'user-files', exists: false }, error: null };
}

// Call the function
createUserFilesBucket();