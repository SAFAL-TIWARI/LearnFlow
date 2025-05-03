/**
 * Utility functions for handling file downloads
 */

/**
 * Downloads a file from Google Drive
 * @param fileUrl The Google Drive file URL
 * @param fileName The name to save the file as
 */
export const downloadGoogleDriveFile = (fileUrl: string, fileName: string): void => {
  try {
    // Extract the file ID from the Google Drive URL
    const fileId = extractGoogleDriveFileId(fileUrl);
    
    if (!fileId) {
      console.error('Could not extract file ID from URL:', fileUrl);
      return;
    }
    
    // Create the download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    a.target = '_blank'; // Open in a new tab to avoid CORS issues
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

/**
 * Extracts the file ID from a Google Drive URL
 * @param url The Google Drive URL
 * @returns The file ID or null if not found
 */
export const extractGoogleDriveFileId = (url: string): string | null => {
  try {
    // Handle different Google Drive URL formats
    
    // Format: https://drive.google.com/file/d/FILE_ID/view
    const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return fileIdMatch[1];
    }
    
    // Format: https://drive.google.com/open?id=FILE_ID
    const openIdMatch = url.match(/[?&]id=([^&]+)/);
    if (openIdMatch && openIdMatch[1]) {
      return openIdMatch[1];
    }
    
    // Format: https://docs.google.com/document/d/FILE_ID/edit
    const docsMatch = url.match(/\/d\/([^/]+)/);
    if (docsMatch && docsMatch[1]) {
      return docsMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file ID:', error);
    return null;
  }
};