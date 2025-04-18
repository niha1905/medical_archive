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
          <p className="text-red-500">Error loading patient records</p>
          <p className="text-sm text-slate-500 mt-2">{error.message}</p>
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
                              >
                                <Eye className="h-3 w-3 mr-1.5" />
                                <span>View Report</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200"
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
