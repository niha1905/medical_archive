import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

interface PatientData {
  user: {
    id: number;
    displayName: string;
    username: string;
    email?: string;
  };
  documents: Array<{
    id: number;
    title: string;
    categoryId: number;
    categoryName: string;
    date: string;
    notes?: string;
    fileData: any;
    createdAt: string;
  }>;
}

interface DoctorViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData?: PatientData;
  isLoading: boolean;
  error?: Error;
}

const DoctorViewModal: React.FC<DoctorViewModalProps> = ({
  isOpen,
  onClose,
  patientData,
  isLoading,
  error
}) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Handle document viewing
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
      }
    }
    // For other file types, show a preview dialog with metadata
    else {
      alert(`${document.title} - This file type can't be previewed directly. Try downloading it instead.`);
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
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Could not download the document. Please try again.');
    }
  };
  
  // Extract unique categories from documents
  const categories = patientData?.documents 
    ? Array.from(new Set(patientData.documents.map(doc => doc.categoryName)))
    : [];
  
  // Filter documents based on active tab
  const filteredDocuments = patientData?.documents 
    ? activeTab === 'all' 
      ? patientData.documents 
      : patientData.documents.filter(doc => doc.categoryName === activeTab)
    : [];
  
  // Sort documents by date (newest first)
  const sortedDocuments = [...(filteredDocuments || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };
  
  // Group documents by date for timeline view
  const documentsByDate = sortedDocuments.reduce((groups: Record<string, typeof sortedDocuments>, document) => {
    const date = format(new Date(document.date), 'MMM d, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(document);
    return groups;
  }, {});
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-12 text-center">
          <p className="text-slate-500">Loading patient records...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-auto max-w-md">
            <p className="text-red-600 font-medium">Error loading patient records</p>
            <p className="text-sm text-red-500 mt-2">{error.message}</p>
            <div className="mt-4 text-xs text-slate-600">
              <p>Possible solutions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-left">
                <li>Check if the QR code is valid and not expired</li>
                <li>Ensure you have proper permissions to access this record</li>
                <li>Try refreshing the page or scanning the QR code again</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    
    if (!patientData) {
      return (
        <div className="py-12 text-center">
          <p className="text-slate-500">No patient data available</p>
        </div>
      );
    }
    
    return (
      <>
        {/* Patient info */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="text-lg font-medium">{getInitials(patientData.user.displayName)}</span>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-slate-800">{patientData.user.displayName}</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                <span>ID: MR-{patientData.user.id}</span>
                {patientData.user.email && <span>Email: {patientData.user.email}</span>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Document tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-6 border-b border-slate-200 w-full justify-start">
            <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
              All Records
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {/* Document timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-slate-200"></div>
              
              <div className="space-y-6 pb-4">
                {Object.entries(documentsByDate).map(([date, docs]) => (
                  <div key={date} className="relative pl-10">
                    <div className="absolute left-[9px] -translate-x-1/2 w-5 h-5 rounded-full bg-primary border-2 border-white"></div>
                    <div className="text-sm text-slate-500 mb-2">{date}</div>
                    
                    {docs.map(doc => {
                      // Determine badge color based on category
                      const getBadgeColor = () => {
                        const category = doc.categoryName.toLowerCase();
                        if (category.includes('lab')) return 'bg-secondary';
                        if (category.includes('prescription')) return 'bg-accent';
                        if (category.includes('x-ray')) return 'bg-primary';
                        if (category.includes('vaccination')) return 'bg-green-500';
                        return 'bg-slate-500';
                      };
                      
                      return (
                        <div key={doc.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mb-3">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-base font-semibold text-slate-800">{doc.title}</h4>
                              <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${getBadgeColor()} text-white`}>
                                {doc.categoryName}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{doc.notes || 'No additional notes provided.'}</p>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200"
                                onClick={() => handleViewDocument(doc)}
                              >
                                <Eye className="h-3 w-3 mr-1.5" />
                                <span>View Report</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200"
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                <Download className="h-3 w-3 mr-1.5" />
                                <span>Download</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                
                {sortedDocuments.length === 0 && (
                  <div className="pl-10 py-4">
                    <p className="text-slate-500">No documents found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Patient Medical Records</DialogTitle>
          <DialogDescription>
            Accessed via QR Code
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default DoctorViewModal;
