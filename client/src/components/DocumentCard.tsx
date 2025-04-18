import { Document } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { 
  FileIcon, 
  FileTextIcon, 
  FilePenIcon, 
  ImageIcon, 
  FileSpreadsheetIcon,
  SyringeIcon
} from "lucide-react";

interface DocumentCardProps {
  document: Document;
  onClick: () => void;
}

const DocumentCard = ({ document, onClick }: DocumentCardProps) => {
  // Get category display info
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "lab_results":
        return { 
          label: "Lab Results", 
          icon: <FileSpreadsheetIcon className="text-slate-400 h-10 w-10" />,
          bgColor: "bg-primary" 
        };
      case "prescriptions":
        return { 
          label: "Prescriptions", 
          icon: <FilePenIcon className="text-slate-400 h-10 w-10" />,
          bgColor: "bg-secondary" 
        };
      case "imaging":
        return { 
          label: "Imaging", 
          icon: <ImageIcon className="text-slate-400 h-10 w-10" />,
          bgColor: "bg-accent" 
        };
      case "surgical":
        return { 
          label: "Surgical", 
          icon: <FileTextIcon className="text-slate-400 h-10 w-10" />,
          bgColor: "bg-yellow-500" 
        };
      case "vaccination":
        return { 
          label: "Vaccination", 
          icon: <SyringeIcon className="text-slate-400 h-10 w-10" />,
          bgColor: "bg-purple-600" 
        };
      default:
        return { 
          label: "Other", 
          icon: <FileIcon className="text-slate-400 h-10 w-10" />,
          bgColor: "bg-slate-600" 
        };
    }
  };

  // Get file type icon
  const getFileTypeIcon = () => {
    switch (document.fileType) {
      case "jpg":
      case "jpeg":
      case "png":
        // If we have image data, render a preview
        if (document.fileData.startsWith("data:image")) {
          return (
            <img 
              src={document.fileData} 
              alt="Document preview"
              className="object-cover w-full h-full"
            />
          );
        }
        return <ImageIcon className="text-slate-400 h-10 w-10" />;
      default:
        return getCategoryInfo(document.category).icon;
    }
  };

  const categoryInfo = getCategoryInfo(document.category);
  const formattedDate = format(parseISO(document.date), "MMM d, yyyy");
  
  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="h-36 bg-slate-100 relative flex items-center justify-center">
        {getFileTypeIcon()}
        
        <div className={`absolute top-2 right-2 ${categoryInfo.bgColor} bg-opacity-90 text-white text-xs px-2 py-1 rounded-full`}>
          {categoryInfo.label}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-slate-800 mb-1 truncate">{document.title}</h3>
        <div className="flex items-center text-xs text-slate-500 space-x-4">
          <span className="flex items-center">
            <span className="mr-1">📅</span>
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center">
            <span className="mr-1">📄</span>
            <span>{document.fileType.toUpperCase()}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
