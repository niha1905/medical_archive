import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Document } from "@shared/schema";
import { DownloadIcon, ShareIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

const DocumentViewer = ({ isOpen, onClose, document }: DocumentViewerProps) => {
  if (!document) return null;
  
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "lab_results":
        return "Lab Results";
      case "prescriptions":
        return "Prescriptions";
      case "imaging":
        return "Imaging";
      case "surgical":
        return "Surgical Reports";
      case "vaccination":
        return "Vaccination Records";
      default:
        return "Other";
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "lab_results":
        return "bg-primary";
      case "prescriptions":
        return "bg-secondary";
      case "imaging":
        return "bg-accent";
      case "surgical":
        return "bg-yellow-500";
      case "vaccination":
        return "bg-purple-600";
      default:
        return "bg-slate-600";
    }
  };
  
  const handleDownload = () => {
    // Create a temporary link to download the document
    const link = document.createElement('a');
    link.href = document.fileData;
    link.download = `${document.title}.${document.fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    if (!navigator.share) return;
    
    try {
      // Convert data URL to Blob
      const response = await fetch(document.fileData);
      const blob = await response.blob();
      
      await navigator.share({
        title: document.title,
        text: `Medical document: ${document.title}`,
        files: [new File([blob], `${document.title}.${document.fileType}`, { type: `image/${document.fileType}` })],
      });
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };
  
  const formattedDate = format(parseISO(document.date), "MMMM d, yyyy");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">{document.title}</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDownload}
              className="text-slate-500 hover:text-primary rounded-full hover:bg-slate-100"
            >
              <DownloadIcon className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShare}
              disabled={!navigator.share}
              className="text-slate-500 hover:text-primary rounded-full hover:bg-slate-100"
            >
              <ShareIcon className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-slate-500 hover:text-destructive rounded-full hover:bg-slate-100"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-slate-100">
          <div className="bg-white rounded shadow p-2 flex items-center justify-center min-h-[300px]">
            {document.fileType === "pdf" ? (
              <iframe 
                src={document.fileData} 
                className="w-full h-[600px]"
                title={document.title}
              />
            ) : (
              <img 
                src={document.fileData} 
                alt={document.title} 
                className="max-h-[600px] max-w-full object-contain"
              />
            )}
          </div>
        </div>
        
        <div className="p-4 border-t bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Category:</span> 
              <span className={`ml-1 ${getCategoryColor(document.category)} text-white text-xs px-2 py-1 rounded-full`}>
                {getCategoryDisplayName(document.category)}
              </span>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">Date:</span> 
              <span className="ml-1">{formattedDate}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
