import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DownloadIcon, ShareIcon } from "lucide-react";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl?: string;
}

const QrCodeModal = ({ isOpen, onClose, qrCodeUrl }: QrCodeModalProps) => {
  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    // Create a temporary link to download the QR code
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'medirec-qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!qrCodeUrl || !navigator.share) return;
    
    try {
      // Convert data URL to Blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      await navigator.share({
        title: 'My Medical Records QR Code',
        text: 'Scan this QR code to access my medical records',
        files: [new File([blob], 'medirec-qrcode.png', { type: 'image/png' })],
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Medical Records QR Code</DialogTitle>
          <DialogDescription>
            Healthcare providers can scan this QR code to access your documents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code to access medical records" 
                className="w-48 h-48"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-slate-100">
                <p className="text-sm text-slate-500">Loading QR code...</p>
              </div>
            )}
          </div>
          
          <p className="text-sm text-center text-slate-600">
            This QR code contains access to your medical records. Healthcare providers can scan this to view your documents.
          </p>
          
          <div className="flex space-x-3">
            <Button
              className="bg-secondary hover:bg-indigo-700"
              onClick={handleDownload}
              disabled={!qrCodeUrl}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={!qrCodeUrl || !navigator.share}
            >
              <ShareIcon className="mr-2 h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeModal;
