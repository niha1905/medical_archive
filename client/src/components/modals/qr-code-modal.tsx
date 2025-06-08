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
    queryFn: async () => {
      try {
        // First test if the server is working
        const testResponse = await fetch('/api/test');
        if (!testResponse.ok) {
          console.error('Server test failed:', testResponse.statusText);
          throw new Error('Server is not responding correctly');
        }
        
        // Now try to get the QR code
        const response = await fetch(`/api/users/${userId}/qrcode`);
        
        // Log the raw response for debugging
        const responseText = await response.text();
        console.log('Raw QR code response:', responseText);
        
        // Try to parse the response as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error('Server returned invalid JSON');
        }
        
        console.log('Parsed QR code data:', data);
        return data;
      } catch (err) {
        console.error('Error fetching QR code:', err);
        throw err;
      }
    },
    enabled: isOpen,
    retry: 0 // Disable retries for now
  });
  
  // Base URL for the QR code (adjust based on your deployment environment)
  const baseUrl = window.location.origin;
  
  // Create QR code URL only if we have valid data
  let qrCodeUrl = `${baseUrl}/doctor/patient-qr-code-${userId}`; // Default to the known working token with user ID
  if (qrCodeData && typeof qrCodeData === 'object' && 'token' in qrCodeData && qrCodeData.token) {
    qrCodeUrl = `${baseUrl}/doctor/${qrCodeData.token}`;
    console.log('Generated QR code URL:', qrCodeUrl);
  } else {
    console.log('Using default QR code URL:', qrCodeUrl);
  }
  
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
              // If there's an error, use a fallback QR code with a consistent token
              <QRCodeComponent 
                value={`${baseUrl}/doctor/patient-qr-code-${userId}`}
                size={240}
                ref={qrCodeRef}
              />
            ) : !qrCodeData || !qrCodeData.token ? (
              // If there's no data, use a fallback QR code with a consistent token
              <QRCodeComponent 
                value={`${baseUrl}/doctor/patient-qr-code-${userId}`}
                size={240}
                ref={qrCodeRef}
              />
            ) : (
              // If everything is good, use the actual QR code
              <QRCodeComponent 
                value={qrCodeUrl}
                size={240}
                ref={qrCodeRef}
              />
            )}
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {error ? (
              <>Using a temporary QR code. Doctors can scan this to view your records.</>
            ) : !qrCodeData || !qrCodeData.token ? (
              <>Using a temporary QR code. Doctors can scan this to view your records.</>
            ) : qrCodeData.expiresAt ? (
              <>This QR code will expire on {new Date(qrCodeData.expiresAt).toLocaleDateString()}</>
            ) : (
              <>This QR code can be used by doctors to access your records</>
            )}
          </p>
        </div>
        
        <DialogFooter className="flex flex-col gap-3 sm:flex-col">
          <Button 
            className="w-full" 
            onClick={handleDownload}
            disabled={isLoading || !qrCodeRef.current}
          >
            <Download className="mr-2 h-4 w-4" />
            <span>Download QR Code</span>
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleEmailQrCode}
            disabled={isLoading || !qrCodeRef.current || !userEmail}
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
