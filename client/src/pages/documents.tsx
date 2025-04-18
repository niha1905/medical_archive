import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import DocumentFilters from '@/components/document/document-filters';
import DocumentCard from '@/components/document/document-card';
import DocumentUploader from '@/components/document/document-uploader';
import { useToast } from '@/hooks/use-toast';

const Documents: React.FC = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Default user ID (would normally come from authentication)
  const userId = 1;
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Extract category ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);
  
  // Fetch documents from the API
  const { data: documents, isLoading, error } = useQuery({
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
    // In a real app, this would open a document viewer
    toast({
      title: 'Viewing Document',
      description: `Opening ${document.title}`,
    });
  };
  
  // Handle document download
  const handleDownloadDocument = (document: any) => {
    // In a real app, this would download the document
    toast({
      title: 'Downloading Document',
      description: `Downloading ${document.title}`,
    });
  };
  
  // Handle document sharing
  const handleShareDocument = (document: any) => {
    // In a real app, this would open a sharing dialog
    toast({
      title: 'Share Document',
      description: `Preparing to share ${document.title}`,
    });
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Documents</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your medical records in one place</p>
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
          <div className="text-center py-8">
            <p className="text-slate-500">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading documents</p>
          </div>
        ) : sortedDocuments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-slate-500">No documents found</p>
            <p className="text-sm text-slate-400 mt-2">
              {searchTerm ? 'Try changing your search criteria' : 'Upload your first document to get started'}
            </p>
          </div>
        ) : (
          sortedDocuments.map(document => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleViewDocument}
              onDownload={handleDownloadDocument}
              onShare={handleShareDocument}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Documents;
