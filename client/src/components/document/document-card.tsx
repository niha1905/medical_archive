import React from 'react';
import { format } from 'date-fns';
import { 
  Eye, 
  Download, 
  Share, 
  File, 
  FileText, 
  FileImage,
  Pill 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Format date to display
  const formattedDate = typeof document.date === 'string' 
    ? format(new Date(document.date), 'MMM d, yyyy')
    : format(document.date, 'MMM d, yyyy');
  
  // Determine icon based on category name
  const getCategoryIcon = () => {
    const category = document.categoryName.toLowerCase();
    
    if (category.includes('lab')) return <File className="text-3xl text-secondary" />;
    if (category.includes('prescription')) return <Pill className="text-3xl text-accent" />;
    if (category.includes('x-ray') || category.includes('image')) return <FileImage className="text-3xl text-primary" />;
    return <FileText className="text-3xl text-secondary" />;
  };
  
  // Get color for category badge
  const getCategoryColor = () => {
    const category = document.categoryName.toLowerCase();
    
    if (category.includes('lab')) return 'bg-secondary';
    if (category.includes('prescription')) return 'bg-accent';
    if (category.includes('x-ray')) return 'bg-primary';
    if (category.includes('vaccination')) return 'bg-green-500';
    return 'bg-slate-500';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
        {/* Document icon */}
        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded bg-slate-100 flex items-center justify-center">
          {getCategoryIcon()}
        </div>
        
        {/* Document details */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800 truncate">{document.title}</h3>
            <div className="mt-1 sm:mt-0 flex items-center">
              <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${getCategoryColor()} text-white`}>
                {document.categoryName}
              </span>
              <span className="ml-2 text-sm text-slate-500">{formattedDate}</span>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 line-clamp-2">{document.notes || 'No additional notes provided.'}</p>
          
          <div className="mt-3 flex items-center flex-wrap gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-slate-700 bg-slate-100 hover:bg-slate-200"
              onClick={() => onView && onView(document)}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              <span>View</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-slate-700 bg-slate-100 hover:bg-slate-200"
              onClick={() => onDownload && onDownload(document)}
            >
              <Download className="h-4 w-4 mr-1.5" />
              <span>Download</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-slate-700 bg-slate-100 hover:bg-slate-200"
              onClick={() => onShare && onShare(document)}
            >
              <Share className="h-4 w-4 mr-1.5" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
