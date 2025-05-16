# Supabase Setup Guide for LearnFlow (Free Plan)

This guide will help you set up the necessary Supabase resources for LearnFlow using the free plan.

## Prerequisites

1. A Supabase account
2. A Supabase project (free tier is fine)
3. Your Supabase project URL and anon key

## Step 1: Set Up Environment Variables

1. Create or update your `.env` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 2: Create Storage Bucket

1. Log in to your Supabase dashboard
2. Navigate to the "Storage" section
3. Click "Create a new bucket"
4. Enter "resources" as the bucket name
5. Check "Public bucket" to make the bucket publicly accessible
6. Click "Create bucket"

## Step 3: Create Folder Structure

1. In the "resources" bucket, click "Create folder"
2. Create the following folders:
   - `academic`
   - `profile-pictures`
   - `user-files`

## Step 4: Create Database Table (Optional)

If you want to store metadata about uploaded files, you can create a table:

1. Navigate to the "Table Editor" section
2. Click "Create a new table"
3. Enter "user_files" as the table name
4. Add the following columns:
   - `id` (type: uuid, primary key, default: uuid_generate_v4())
   - `user_id` (type: uuid, not null)
   - `name` (type: text, not null)
   - `url` (type: text, not null)
   - `type` (type: text, not null)
   - `category` (type: text, not null)
   - `created_at` (type: timestamp with time zone, default: now())
5. Click "Save"

## Step 5: Set Up Storage Policies

1. Navigate to the "Storage" section
2. Click on the "Policies" tab
3. For the "resources" bucket, add the following policies:

### Public Read Access

1. Click "Add policy" (for the "resources" bucket)
2. Select "Custom policy"
3. Enter "Public Read Access" as the policy name
4. For "Allowed operations", select only "SELECT"
5. For "Policy definition", enter:
   ```sql
   true
   ```
6. Click "Save policy"

### Authenticated Insert Access

1. Click "Add policy" (for the "resources" bucket)
2. Select "Custom policy"
3. Enter "Authenticated Insert Access" as the policy name
4. For "Allowed operations", select only "INSERT"
5. For "Policy definition", enter:
   ```sql
   auth.role() = 'authenticated'
   ```
6. Click "Save policy"

### Authenticated Update/Delete Access (Owner Only)

1. Click "Add policy" (for the "resources" bucket)
2. Select "Custom policy"
3. Enter "Authenticated Owner Access" as the policy name
4. For "Allowed operations", select "UPDATE" and "DELETE"
5. For "Policy definition", enter:
   ```sql
   auth.uid() = owner
   ```
   (Note: This assumes you're storing the owner ID in the metadata)
6. Click "Save policy"

## Step 6: Test the Setup

1. Start your application with `npm run dev`
2. Navigate to the academic resources page
3. Select a year, semester, branch, subject, and material type
4. Try uploading a file using the file uploader
5. Verify that the file appears in the resource list

## Folder Structure

The folder structure in the "resources" bucket should look like this:

```
resources/
├── academic/
│   ├── CSA 101/
│   │   ├── syllabus/
│   │   ├── assignments/
│   │   └── ...
│   └── ...
├── profile-pictures/
└── user-files/
```

## Free Plan Limitations

Be aware of the following limitations on the Supabase free plan:

- Storage: 1GB total
- Database: 500MB
- Monthly Egress: 2GB

## Troubleshooting

### Files Not Appearing

1. Check that the bucket is public
2. Verify that the folder structure is correct
3. Check browser console for error messages

### Upload Errors

1. Verify that you're authenticated
2. Check that the storage policies are set up correctly
3. Check browser console for specific error messages

### Permission Errors

1. Make sure you've set up the storage policies correctly
2. Verify that you're using the correct Supabase credentials

## Next Steps

After setting up the basic storage infrastructure, you can:

1. Implement file management features (rename, delete, etc.)
2. Add search functionality for files
3. Implement version control for files
4. Add batch upload capabilities
