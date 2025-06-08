import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Redirect } from 'wouter';
import DocumentFilters from '@/components/document/document-filters';
import DocumentCard from '@/components/document/document-card';
import DocumentUploader from '@/components/document/document-uploader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import UploadModal from '@/components/modals/upload-modal';

const Documents: React.FC = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Redirect to="/login" />;
  }
  
  // Get user ID from authentication
  const userId = user?.id || 1;
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Extract category ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);
  
  // Fetch documents from the API
  interface Document {
    id: number;
    title: string;
    categoryId: number;
    categoryName: string;
    date: string | Date;
    notes?: string;
    fileData: any;
  }

  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: [`/api/users/${userId}/documents`, selectedCategory],
    queryFn: async ({ queryKey }) => {
      let url = `/api/users/${userId}/documents`;
      if (queryKey[1]) {
        url += `?categoryId=${queryKey[1]}`;
      }
      return fetch(url).then(res => res.json());
    }
  });
  
  // Handle document view
  const handleViewDocument = (document: any) => {
    const fileData = document.fileData;
    
    // Check if it's an image
    if (typeof fileData === 'string' && fileData.startsWith('data:image')) {
      // Create a new window to display the image
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${document.title}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                  background-color: #f0f4f8;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                .header {
                  margin-bottom: 20px;
                  text-align: center;
                }
                h1 {
                  color: #3b82f6;
                  margin-bottom: 5px;
                }
                .meta {
                  color: #64748b;
                  font-size: 14px;
                  margin-bottom: 10px;
                }
                .notes {
                  background-color: #fff;
                  padding: 15px;
                  border-radius: 8px;
                  border: 1px solid #e2e8f0;
                  margin-bottom: 20px;
                  width: 100%;
                  max-width: 800px;
                }
                .image-container {
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  max-width: 90%;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${document.title}</h1>
                <div class="meta">
                  <span>Category: ${document.categoryName}</span> | 
                  <span>Date: ${new Date(document.date).toLocaleDateString()}</span>
                </div>
                ${document.notes ? `<div class="notes">${document.notes}</div>` : ''}
              </div>
              <div class="image-container">
                <img src="${fileData}" alt="${document.title}">
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        toast({
          title: 'Popup Blocked',
          description: 'Please allow popups to view documents',
          variant: 'destructive'
        });
      }
    } 
    // Check if it's a PDF (data URL)
    else if (typeof fileData === 'string' && fileData.startsWith('data:application/pdf')) {
      // Open PDF in a new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${document.title}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body, html {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  overflow: hidden;
                }
                iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                }
              </style>
            </head>
            <body>
              <iframe src="${fileData}" type="application/pdf"></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        toast({
          title: 'Popup Blocked',
          description: 'Please allow popups to view documents',
          variant: 'destructive'
        });
      }
    }
    // For other file types, show a preview dialog with metadata
    else {
      toast({
        title: 'Viewing Document',
        description: `${document.title} - This file type can't be previewed directly. Try downloading it instead.`,
      });
    }
  };
  
  // Handle document download
  const handleDownloadDocument = (document: any) => {
    const fileData = document.fileData;
    
    try {
      // Create a link element
      const link = document.createElement('a');
      
      // Handle different types of file data
      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        // It's a data URL
        link.href = fileData;
        
        // Determine file extension from MIME type
        const mimeType = fileData.split(';')[0].split(':')[1];
        let extension = 'txt'; // Default extension
        
        if (mimeType.includes('image/')) {
          extension = mimeType.split('/')[1];
        } else if (mimeType.includes('application/pdf')) {
          extension = 'pdf';
        } else if (mimeType.includes('application/json')) {
          extension = 'json';
        }
        
        // Set download attribute with filename
        link.download = `${document.title.replace(/\s+/g, '_')}.${extension}`;
      } else {
        // Convert to JSON if it's not a data URL
        const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
        link.href = URL.createObjectURL(blob);
        link.download = `${document.title.replace(/\s+/g, '_')}.json`;
      }
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL if created
      if (link.href.startsWith('blob:')) {
        URL.revokeObjectURL(link.href);
      }
      
      toast({
        title: 'Download Started',
        description: `Downloading ${document.title}`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not download the document. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle document sharing
  const handleShareDocument = (document: any) => {
    // Check if Web Share API is available
    if (navigator.share) {
      // Create a blob from the document data
      const fileData = document.fileData;
      let blob;
      let fileName = `${document.title.replace(/\s+/g, '_')}.png`;
      
      // Handle different types of file data
      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        // It's a data URL
        const mimeType = fileData.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1];
        fileName = `${document.title.replace(/\s+/g, '_')}.${extension}`;
        
        // Convert data URL to blob
        const byteString = atob(fileData.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        blob = new Blob([ab], { type: mimeType });
      } else {
        // Default case - create a text blob
        blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
        fileName = `${document.title.replace(/\s+/g, '_')}.json`;
      }
      
      // Create a File object from the blob
      const file = new File([blob], fileName, { type: blob.type });
      
      // Share the file
      navigator.share({
        title: document.title,
        text: `Medical document: ${document.title}`,
        files: [file]
      }).catch(error => {
        console.error('Error sharing document:', error);
        toast({
          title: 'Sharing Failed',
          description: 'Could not share the document. Try downloading it instead.',
          variant: 'destructive'
        });
      });
    } else {
      // Web Share API not available
      toast({
        title: 'Sharing Not Supported',
        description: 'Your browser does not support sharing. Try downloading the document instead.',
        variant: 'destructive'
      });
    }
  };
  
  // Filter and sort documents
  const filteredDocuments = documents ? documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];
  
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
  
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-lg shadow-lg text-white">
        <div>
          <h2 className="text-3xl font-bold">My Medical Documents</h2>
          <p className="mt-2 text-blue-100">Securely manage and access all your medical records in one place</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <DocumentUploader userId={userId} />
        </div>
      </div>
      
      {/* Document Filters */}
      <DocumentFilters
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortOrder}
        initialCategory={selectedCategory}
      />
      
      {/* Documents List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-blue-100">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-blue-700 font-medium">Loading your documents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg shadow-md border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <p className="text-red-600 font-medium">Error loading documents</p>
            <p className="text-red-500 mt-2">Please try refreshing the page</p>
          </div>
        ) : sortedDocuments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-blue-100">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
            <p className="text-blue-700 font-medium text-lg">No documents found</p>
            <p className="text-blue-600 mt-2">
              {searchTerm ? 'Try changing your search criteria' : 'Upload your first document to get started'}
            </p>
            {!searchTerm && (
              <Button 
                className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setIsModalOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Document
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-blue-700">
                <span className="font-medium">{sortedDocuments.length}</span> document{sortedDocuments.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="space-y-4">
              {sortedDocuments.map(document => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  onShare={handleShareDocument}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Documents;
