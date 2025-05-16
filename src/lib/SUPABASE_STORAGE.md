# Supabase Storage Integration for LearnFlow

This document explains how to use the Supabase storage integration for managing academic materials in LearnFlow.

## Overview

LearnFlow now supports two methods for managing academic materials:

1. **Manual Management**: Using the `academicData.ts` file to manually define materials with Google Drive links
2. **Supabase Storage**: Using Supabase storage buckets to automatically manage uploaded files

Both methods can be used simultaneously, allowing for a smooth transition from manual management to automated storage.

## Storage Buckets

The following storage buckets are used:

- `academic-materials`: For storing academic materials (syllabus, assignments, practicals, etc.)
- `resources`: For general resources
- `profile-pictures`: For user profile pictures
- `user-files`: For user-uploaded files

## Database Tables

The following database tables are used:

- `materials`: For storing metadata about academic materials
- `user_files`: For storing metadata about user-uploaded files

## Setup

To set up the Supabase storage integration:

1. Make sure your Supabase project is properly configured in your `.env` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Run the initialization script:

```bash
npm run init-supabase
```

This script will:
- Create the necessary storage buckets if they don't exist
- Create the required database tables if they don't exist
- Set up appropriate storage policies

## Usage

### Uploading Files

Students and teachers can upload files directly from the academic resources page. When a subject and material type are selected, an upload component will appear, allowing users to:

1. Drag and drop files
2. Click to select files from their device

Files are automatically uploaded to the appropriate bucket and folder based on the selected subject and material type.

### Accessing Files

Files are automatically displayed in the resource list along with manually defined materials. The system merges both sources, giving priority to storage files if there are duplicates.

### File Structure

Files in the `academic-materials` bucket are organized as follows:

```
academic-materials/
├── CSA 101/
│   ├── syllabus/
│   │   ├── file1.pdf
│   │   └── file2.docx
│   ├── assignments/
│   │   └── assignment1.pdf
│   └── ...
├── MAB 101/
│   └── ...
└── ...
```

## Implementation Details

### Key Files

- `src/lib/supabaseStorage.ts`: Core functions for interacting with Supabase storage
- `src/lib/academicStorageMapper.ts`: Functions for mapping between storage files and academicData structure
- `src/lib/initSupabaseStorage.ts`: Functions for initializing storage buckets and tables
- `src/components/SupabaseFileUploader.tsx`: Component for uploading files to Supabase storage
- `src/scripts/initSupabase.ts`: Script for initializing Supabase resources

### Integration with Existing Code

The integration is designed to work alongside the existing manual management system:

1. The `ResourceFiles` component now fetches files from both sources
2. Files are merged with priority given to storage files
3. The upload component appears when a subject and material type are selected

## Troubleshooting

### Common Issues

1. **Files not appearing**: Make sure the storage bucket is public and the file paths are correct
2. **Upload errors**: Check browser console for specific error messages
3. **Permission errors**: Ensure your Supabase project has the correct policies set up

### Debugging

To debug storage issues:

1. Check the browser console for error messages
2. Verify that the storage buckets exist in the Supabase dashboard
3. Check that the file paths match the expected structure

## Future Improvements

Potential future improvements include:

1. Adding file management capabilities (rename, delete, etc.)
2. Implementing version control for files
3. Adding search functionality for files
4. Supporting more file types and previews
5. Adding batch upload capabilities
