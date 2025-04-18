import { Button } from "@/components/ui/button";
import { FileIcon, QrCodeIcon, UploadIcon } from "lucide-react";

interface HeaderProps {
  onUploadClick: () => void;
  onQrClick: () => void;
}

const Header = ({ onUploadClick, onQrClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-slate-800">MediRec</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="default"
            className="bg-primary hover:bg-blue-700 text-white shadow-sm"
            onClick={onQrClick}
          >
            <QrCodeIcon className="mr-2 h-4 w-4" />
            <span>Generate QR</span>
          </Button>
          <Button
            variant="default"
            className="bg-accent hover:bg-teal-700 text-white shadow-sm"
            onClick={onUploadClick}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            <span>Upload</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
