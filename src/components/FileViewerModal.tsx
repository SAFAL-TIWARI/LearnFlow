import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    publicUrl: string;
    type?: string;
  } | null;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, onClose, file }) => {
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState<string>('');

  useEffect(() => {
    if (file) {
      setLoading(true);
      
      // Determine file type from extension or MIME type
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const mimeType = file.type || '';
      
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

  const handleDownload = () => {
    if (file && file.publicUrl) {
      const link = document.createElement('a');
      link.href = file.publicUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderFilePreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-learnflow-500"></div>
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
          />
        );
      
      case 'video':
        return (
          <video 
            controls 
            className="w-full max-h-[70vh]"
            onLoadedData={() => setLoading(false)}
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
        </DialogHeader>
        
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