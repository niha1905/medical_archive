import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Eye, 
  Download, 
  Share2, 
  File, 
  FileText, 
  FileImage,
  Pill,
  Calendar,
  Tag,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DocumentCardProps {
  document: {
    id: number;
    title: string;
    categoryId: number;
    categoryName: string;
    date: string | Date;
    notes?: string;
    fileData: any;
  };
  onView?: (doc: any) => void;
  onDownload?: (doc: any) => void;
  onShare?: (doc: any) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onView,
  onDownload,
  onShare 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  
  // Format date to display
  const formattedDate = typeof document.date === 'string' 
    ? format(new Date(document.date), 'MMM d, yyyy')
    : format(document.date, 'MMM d, yyyy');
  
  // Determine icon based on category name
  const getCategoryIcon = () => {
    const category = document.categoryName.toLowerCase();
    
    if (category.includes('lab')) return <File className="h-10 w-10 text-blue-500" />;
    if (category.includes('prescription')) return <Pill className="h-10 w-10 text-purple-500" />;
    if (category.includes('x-ray') || category.includes('image')) return <FileImage className="h-10 w-10 text-indigo-500" />;
    if (category.includes('vaccination')) return <FileImage className="h-10 w-10 text-green-500" />;
    return <FileText className="h-10 w-10 text-blue-500" />;
  };
  
  // Get color for category badge
  const getCategoryColor = () => {
    const category = document.categoryName.toLowerCase();
    
    if (category.includes('lab')) return 'bg-blue-500';
    if (category.includes('prescription')) return 'bg-purple-500';
    if (category.includes('x-ray')) return 'bg-indigo-500';
    if (category.includes('vaccination')) return 'bg-green-500';
    return 'bg-blue-500';
  };
  
  // Check if document has image preview
  const hasImagePreview = () => {
    if (!document.fileData) return false;
    
    // Check if fileData is a string that starts with data:image
    if (typeof document.fileData === 'string') {
      return document.fileData.startsWith('data:image');
    }
    
    return false;
  };

  return (
    <>
      {/* Full-screen preview for images */}
      {showPreview && hasImagePreview() && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={() => setShowPreview(false)}
            >
              <X />
            </Button>
            <img src={document.fileData as string} alt="Document Preview" className="max-w-full h-auto" />
          </div>
        </div>
      )}
    
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-blue-100">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
          {/* Document icon */}
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-center">
            {getCategoryIcon()}
          </div>
          
          {/* Document details */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-800 truncate">{document.title}</h3>
              <div className="mt-1 sm:mt-0 flex items-center gap-2">
                <Badge className={`${getCategoryColor()} hover:${getCategoryColor()}`}>
                  {document.categoryName}
                </Badge>
                <div className="flex items-center text-sm text-blue-600">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {formattedDate}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">{document.notes || 'No additional notes provided.'}</p>
            
            {/* Preview thumbnail for images */}
            {hasImagePreview() && (
              <div className="mb-3 flex justify-start">
                <div 
                  className="w-24 h-16 rounded-md overflow-hidden border border-blue-200 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowPreview(true)}
                >
                  <img 
                    src={document.fileData as string} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-3 flex items-center flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-700"
                      onClick={() => onView && onView(document)}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      <span>View</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View document details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 bg-green-100 border-green-300 hover:bg-green-200 text-green-700"
                      onClick={() => onDownload && onDownload(document)}
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      <span>Download</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download this document</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-700"
                      onClick={() => onShare && onShare(document)}
                    >
                      <Share2 className="h-4 w-4 mr-1.5" />
                      <span>Share</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this document</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentCard;
