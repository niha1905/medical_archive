import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QRCodeComponent, { downloadQRCode, emailQRCode } from '@/components/ui/qr-code';
import { Download, Mail, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userEmail?: string;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, userId, userEmail }) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  // Fetch the QR code data from the API
  const { data: qrCodeData, isLoading, error } = useQuery({
    queryKey: [`/api/users/${userId}/qrcode`],
    enabled: isOpen,
  });
  
  // Base URL for the QR code (adjust based on your deployment environment)
  const baseUrl = window.location.origin;
  const qrCodeUrl = qrCodeData ? `${baseUrl}/doctor/${qrCodeData.token}` : '';
  
  const handleDownload = () => {
    if (qrCodeRef.current) {
      downloadQRCode(qrCodeRef.current, 'medirec-qrcode.png');
      
      toast({
        title: 'QR Code Downloaded',
        description: 'Your QR code has been downloaded successfully.',
      });
    }
  };
  
  const handleEmailQrCode = () => {
    if (qrCodeRef.current && userEmail) {
      emailQRCode(qrCodeRef.current, userEmail);
      
      toast({
        title: 'Email Client Opened',
        description: 'Please complete the email to send your QR code.',
      });
    } else {
      toast({
        title: 'No Email Address',
        description: 'Please add an email address in your profile settings.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">Your Medical Records QR Code</DialogTitle>
          <DialogDescription>
            Doctors can scan this QR code to view your medical records
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center my-6">
          <div className="bg-white inline-flex p-2 border border-slate-200 rounded-lg shadow-sm">
            {isLoading ? (
              <div className="w-64 h-64 bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500">Generating QR code...</p>
              </div>
            ) : error ? (
              <div className="w-64 h-64 bg-slate-50 flex items-center justify-center">
                <p className="text-red-500">Error generating QR code</p>
              </div>
            ) : (
              <QRCodeComponent 
                value={qrCodeUrl}
                size={240}
                ref={qrCodeRef as any}
              />
            )}
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {qrCodeData?.expiresAt ? (
              <>This QR code will expire on {new Date(qrCodeData.expiresAt).toLocaleDateString()}</>
            ) : (
              <>This QR code can be used by doctors to access your records</>
            )}
          </p>
        </div>
        
        <DialogFooter className="flex flex-col gap-3 sm:flex-col">
          <Button className="w-full" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            <span>Download QR Code</span>
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleEmailQrCode}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span>Email QR Code</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeModal;
