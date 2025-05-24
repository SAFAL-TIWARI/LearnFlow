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
    console.log('Attempting to download file:', { fileUrl, fileName });

    // Show download started notification
    showDownloadNotification('Download started...', 'info');

    // Check if the URL is already a direct download URL
    if (fileUrl.includes('export=download')) {
      console.log('Using direct download URL');
      // Use the URL directly
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      a.target = '_blank'; // Open in a new tab to avoid CORS issues
      a.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        showDownloadNotification('Download initiated successfully!', 'success');
      }, 100);
      return;
    }

    // Extract the file ID from the Google Drive URL
    const fileId = extractGoogleDriveFileId(fileUrl);

    if (!fileId) {
      console.error('Could not extract file ID from URL:', fileUrl);
      showDownloadNotification('Could not process download URL. Opening file in new tab...', 'warning');
      // Try to use the URL directly as a fallback
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    console.log('Extracted file ID:', fileId);

    // Create the download URL
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    console.log('Generated download URL:', downloadUrl);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    a.target = '_blank'; // Open in a new tab to avoid CORS issues
    a.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      showDownloadNotification('Download initiated successfully!', 'success');
    }, 100);
  } catch (error) {
    console.error('Error downloading file:', error);
    showDownloadNotification('Download failed. Opening file in new tab...', 'error');
    // Fallback: try to open the URL directly
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Shows a download notification to the user
 * @param message The message to show
 * @param type The type of notification (info, success, warning, error)
 */
const showDownloadNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error'): void => {
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  const icons = {
    info: '📥',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white p-4 rounded-lg shadow-lg z-50 max-w-sm animate-slide-in`;
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="text-xl mr-2">${icons[type]}</span>
      <span class="font-medium">${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.add('animate-slide-out');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
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