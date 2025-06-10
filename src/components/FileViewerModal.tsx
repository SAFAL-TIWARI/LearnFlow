import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { materialTypes } from '../data/academicData';
import LoadingAnimation from './LoadingAnimation';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    publicUrl: string;
    type?: string;
    file_type?: string;
    created_at?: string;
    description?: string;
    subject_code?: string;
    material_type?: string;
    category?: string;
    file_size?: number;
  } | null;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, onClose, file }) => {
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setLoading(true);
      setDownloadError(null);
      
      // Determine file type from extension or MIME type
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const mimeType = file.type || file.file_type || '';
      
      if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExtension)) {
        setFileType('image');
      } else if (mimeType.startsWith('video/') || ['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        setFileType('video');
      } else if (mimeType === 'application/pdf' || fileExtension === 'pdf') {
        setFileType('pdf');
      } else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExtension)) {
        setFileType('office');
      } else if (['txt', 'md', 'json', 'csv'].includes(fileExtension)) {
        setFileType('text');
      } else {
        setFileType('other');
      }
      
      setLoading(false);
    }
  }, [file]);

  if (!file) return null;

  // Get material type name from ID
  const getMaterialTypeName = (materialTypeId?: string) => {
    if (!materialTypeId) return '';
    const materialType = materialTypes.find(mt => mt.id === materialTypeId);
    return materialType ? materialType.name : materialTypeId;
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleDownload = async () => {
    if (file && file.publicUrl) {
      try {
        setDownloadError(null);
        
        // Try to fetch the file to check if it's accessible
        const response = await fetch(file.publicUrl, { method: 'HEAD' });
        
        if (!response.ok) {
          throw new Error(`File not accessible (${response.status})`);
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = file.publicUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading file:', error);
        setDownloadError('Failed to download file. It may have been moved or deleted.');
      }
    }
  };

  const renderFilePreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingAnimation size="medium" />
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img 
              src={file.publicUrl} 
              alt={file.name} 
              className="max-h-[70vh] max-w-full object-contain"
              onLoad={() => setLoading(false)}
              onError={() => setDownloadError('Failed to load image preview.')}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <iframe 
            src={`${file.publicUrl}#toolbar=0`} 
            className="w-full h-[70vh]" 
            title={file.name}
            onLoad={() => setLoading(false)}
            onError={() => setDownloadError('Failed to load PDF preview.')}
          />
        );
      
      case 'video':
        return (
          <video 
            controls 
            className="w-full max-h-[70vh]"
            onLoadedData={() => setLoading(false)}
            onError={() => setDownloadError('Failed to load video preview.')}
          >
            <source src={file.publicUrl} />
            Your browser does not support the video tag.
          </video>
        );
      
      case 'office':
        return (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-600">This file type cannot be previewed directly.</p>
            <p className="text-gray-500 text-sm">Please download the file to view it.</p>
          </div>
        );
      
      default:
        return (
          <div className="text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-600">Preview not available for this file type.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {file.name}
          </DialogTitle>
          {(file.description || file.subject_code || file.material_type || file.category) && (
            <DialogDescription className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {file.description && (
                  <div className="col-span-2 mb-1">
                    <span className="text-gray-500">Description:</span> {file.description}
                  </div>
                )}
                {(file.subject_code || file.material_type || file.category) && (
                  <div className="flex flex-wrap gap-2 col-span-2 mt-1">
                    {file.subject_code && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                        {file.subject_code}
                      </span>
                    )}
                    {(file.material_type || file.category) && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                        {getMaterialTypeName(file.material_type || file.category)}
                      </span>
                    )}
                    {file.file_size && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs">
                        {formatFileSize(file.file_size)}
                      </span>
                    )}
                    {file.created_at && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs">
                        Uploaded: {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </DialogDescription>
          )}
        </DialogHeader>
        
        {downloadError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm">
            {downloadError}
          </div>
        )}
        
        <div className="my-4">
          {renderFilePreview()}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mr-2"
          >
            Close
          </Button>
          <Button 
            onClick={handleDownload}
            className="bg-learnflow-500 hover:bg-learnflow-600 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerModal;